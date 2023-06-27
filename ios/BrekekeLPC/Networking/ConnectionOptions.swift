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
        sec_protocol_options_append_tls_ciphersuite(
          options.securityProtocolOptions,
          tls_ciphersuite_t.RSA_WITH_AES_128_GCM_SHA256
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

      // attempt to verify the pinned certificate
      public var options: NWProtocolTLS.Options {
        let options = NWProtocolTLS.Options()

        sec_protocol_options_set_verify_block(
          options.securityProtocolOptions,
          { [self] _, secTrust, secProtocolVerifyComplete in
            let trust = sec_trust_copy_ref(secTrust).takeRetainedValue()

            guard let serverPublicKeyData = publicKey(from: trust)
            else {
              secProtocolVerifyComplete(false)
              return
            }

            let keyHash = cryptoKitSHA256(data: serverPublicKeyData)

            guard keyHash == publicKeyHash
            else {
              // presented certificate doesn't match
              secProtocolVerifyComplete(false)
              return
            }

            // presented certificate matches the pinned cert
            secProtocolVerifyComplete(true)
          },
          dispatchQueue
        )

        return options
      }

      private func cryptoKitSHA256(data: Data) -> String {
        let rsa2048Asn1Header: [UInt8] = [
          0x30, 0x82, 0x01, 0x22, 0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48,
          0x86,
          0xF7, 0x0D, 0x01, 0x01, 0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0F,
          0x00,
        ]

        let data = Data(rsa2048Asn1Header) + data
        let hash = SHA256.hash(data: data)

        return Data(hash).base64EncodedString()
      }

      private func publicKey(from trust: SecTrust) -> Data? {
        var data: Data?

        if #available(iOS 15.0, macOS 12.0, *) {
          guard let certificateChain =
            SecTrustCopyCertificateChain(trust) as? [SecCertificate],
            let serverCertificate = certificateChain.first
          else {
            return nil
          }

          let publicKey = SecCertificateCopyKey(serverCertificate)
          data = SecKeyCopyExternalRepresentation(publicKey!, nil)! as Data
        } else {
          guard let serverCertificate = SecTrustGetCertificateAtIndex(trust, 0)
          else {
            return nil
          }

          let publicKey = SecCertificateCopyKey(serverCertificate)
          data = SecKeyCopyExternalRepresentation(publicKey!, nil)! as Data
        }

        return data
      }
    }
  }
}
