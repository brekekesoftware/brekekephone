import CryptoKit
import Foundation
import Network

public enum ConnectionOptions {
  public enum TCP {
    public static var options: NWProtocolTCP.Options {
      let options = NWProtocolTCP.Options()
      options.noDelay = true
      return options
    }
  }

  public enum TLS {
    public enum Error: Swift.Error {
      case invalidP12
      case unableToExtractIdentity
      case unknown
    }

    public class Server {
      public let p12: URL
      public let passphrase: String

      public init(p12 url: URL, passphrase: String) {
        p12 = url
        self.passphrase = passphrase
      }

      public var options: NWProtocolTLS.Options? {
        guard let data = try? Data(contentsOf: p12)
        else {
          return nil
        }

        let pkcs12Options = [kSecImportExportPassphrase: passphrase]
        var importItems: CFArray?
        let status = SecPKCS12Import(
          data as CFData,
          pkcs12Options as CFDictionary,
          &importItems
        )

        guard status == errSecSuccess,
              let items = importItems as? [[String: Any]],
              let importItemIdentity = items
              .first?[kSecImportItemIdentity as String],
              let identity =
              sec_identity_create(importItemIdentity as! SecIdentity)
        else {
          return nil
        }

        let options = NWProtocolTLS.Options()
        sec_protocol_options_set_local_identity(
          options.securityProtocolOptions,
          identity
        )

        return options
      }
    }

    public class Client {
      public let publicKeyHash: String
      private let dispatchQueue =
        DispatchQueue(label: "ConnectionParameters.TLS.Client.dispatchQueue")

      public init(publicKeyHash: String) {
        self.publicKeyHash = publicKeyHash
      }

      /// attempt to verify the pinned certificate
      public var options: NWProtocolTLS.Options {
        let options = NWProtocolTLS.Options()

        sec_protocol_options_set_verify_block(
          options.securityProtocolOptions,
          { [self] _, secTrust, secProtocolVerifyComplete in
            let trust = sec_trust_copy_ref(secTrust).takeRetainedValue()
            guard let spkiData = spki(from: trust) else {
              secProtocolVerifyComplete(false)
              return
            }
            secProtocolVerifyComplete(sha256Base64(data: spkiData) ==
              publicKeyHash)
          },
          dispatchQueue
        )

        return options
      }

      private func sha256Base64(data: Data) -> String {
        let hash = SHA256.hash(data: data)
        return Data(hash).base64EncodedString()
      }

      /// Extract SubjectPublicKeyInfo (SPKI) from raw certificate DER bytes.
      /// This is algorithm-independent: the SPKI sequence already contains the
      /// AlgorithmIdentifier OID, so the resulting hash is valid for RSA,
      /// ECDSA,
      /// or any future algorithm without code changes.
      private func extractSPKI(from certData: Data) -> Data? {
        let bytes = [UInt8](certData)
        var i = 0

        func readLength() -> Int? {
          guard i < bytes.count else { return nil }
          let first = Int(bytes[i]); i += 1
          if first & 0x80 == 0 { return first }
          let n = first & 0x7F
          guard n > 0, n <= 4, i + n <= bytes.count else { return nil }
          var len = 0
          for _ in 0 ..< n {
            len = (len << 8) | Int(bytes[i]); i += 1
          }
          return len
        }

        func skipTLV() -> Bool {
          guard i < bytes.count else { return false }
          i += 1
          guard let len = readLength() else { return false }
          i += len
          return i <= bytes.count
        }

        func enterSequence() -> Bool {
          guard i < bytes.count, bytes[i] == 0x30 else { return false }
          i += 1
          return readLength() != nil
        }

        // X.509 DER: Certificate > TBSCertificate > ... > subjectPublicKeyInfo
        guard enterSequence() else { return nil } // Certificate
        guard enterSequence() else { return nil } // TBSCertificate
        if i < bytes.count,
           bytes[i] == 0xA0 { guard skipTLV() else { return nil } } // version
        guard skipTLV() else { return nil } // serialNumber
        guard skipTLV() else { return nil } // signature
        guard skipTLV() else { return nil } // issuer
        guard skipTLV() else { return nil } // validity
        guard skipTLV() else { return nil } // subject

        let spkiStart = i
        guard i < bytes.count, bytes[i] == 0x30 else { return nil }
        i += 1
        guard let spkiLen = readLength() else { return nil }
        let spkiEnd = i + spkiLen
        guard spkiEnd <= bytes.count else { return nil }
        return Data(bytes[spkiStart ..< spkiEnd])
      }

      private func spki(from trust: SecTrust) -> Data? {
        let cert: SecCertificate?
        if #available(iOS 15.0, macOS 12.0, *) {
          cert = (SecTrustCopyCertificateChain(trust) as? [SecCertificate])?
            .first
        } else {
          cert = SecTrustGetCertificateAtIndex(trust, 0)
        }
        guard let certificate = cert else { return nil }
        return extractSPKI(from: SecCertificateCopyData(certificate) as Data)
      }
    }
  }
}
