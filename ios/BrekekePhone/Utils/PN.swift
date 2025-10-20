import Foundation

extension String {
  func toModel<T: Decodable>(_ type: T.Type) -> T? {
    guard let data = self.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(T.self, from: data)
  }
  
  func md5() -> String {
    let data = Data(self.utf8)
    var digest = [UInt8](repeating: 0, count: Int(CC_MD5_DIGEST_LENGTH))
    data.withUnsafeBytes {
      _ = CC_MD5($0.baseAddress, CC_LONG(data.count), &digest)
    }
    return digest.map { String(format: "%02x", $0) }.joined()
  }
}

class PN {
    static func id(_ m: [AnyHashable: Any]) -> String? {
        return get(m, "pn-id", "pnId")
    }

    static func callerName(_ m: [AnyHashable: Any]) -> String {
        if let v = get(m, "displayname", "displayName"), !v.isEmpty {
            return v
        }
        if let from = get(m, "from"), !from.isEmpty {
            return from
        }
        return L.loading()
    }

    static func ringtone(_ m: [AnyHashable: Any]) -> String? {
        return get(m, "ringtone")
    }

    static func username(_ m: [AnyHashable: Any]) -> String? {
        return get(m, "to", "pbxUsername")
    }

    static func tenant(_ m: [AnyHashable: Any]) -> String? {
        return get(m, "tenant", "pbxTenant")
    }

    static func host(_ m: [AnyHashable: Any]) -> String? {
        return get(m, "host", "pbxHostname")
    }

    static func port(_ m: [AnyHashable: Any]) -> String? {
        return get(m, "pbxPort", "port")
    }

    // MARK: - Private helpers

    private static func get(_ m: [AnyHashable: Any], _ k: String) -> String? {
      var d = m["x_\(k)"] as? String ?? ""
      if(d.isEmpty) {
        return m[k] as? String ?? ""
      }
      return d
    }

    private static func get(_ m: [AnyHashable: Any], _ k1: String, _ k2: String) -> String? {
        return get(m, k1) ?? get(m, k2)
    }

    private static func get(_ m: [AnyHashable: Any], _ k1: String, _ k2: String, _ k3: String) -> String? {
        return get(m, k1, k2) ?? get(m, k3)
    }
}
