import Foundation

public class AccountUtils {
  private static func compareFalsishField(v1: String, v2: String) -> Bool {
    return v1.isEmpty || v2.isEmpty || v1 == v2
  }

  static func find(username: String, tenant: String, host: String,
                   port: String) -> Profile? {
    if let a = Storage.account() {
      for p in a {
        if p.pbxUsername.isEmpty {
          continue
        }
        if p.pbxUsername == username,
           compareFalsishField(v1: p.pbxTenant ?? "", v2: tenant),
           compareFalsishField(v1: p.pbxHostname ?? "", v2: host),
           compareFalsishField(v1: p.pbxPort ?? "", v2: port) {
          return p
        }
      }
    }
    return nil
  }

  static func find(m: [AnyHashable: Any]) -> Profile? {
    let u = PN.username(m) ?? ""
    let t = PN.tenant(m) ?? ""
    let h = PN.host(m) ?? ""
    let p = PN.port(m) ?? ""
    return find(username: u, tenant: t, host: h, port: p)
  }
}
