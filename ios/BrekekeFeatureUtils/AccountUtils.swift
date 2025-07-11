import Foundation


extension String {
  func toJSON(options: JSONSerialization.ReadingOptions = .mutableContainers) -> Any? {
    guard let data = self.data(using: .utf8 , allowLossyConversion: false) else { return nil }
    return try? JSONSerialization.jsonObject(with: data, options: options)
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

public class AccountUtils {
  
  @objc static func getRingtoneFromUser(username : String, tenant : String, host: String, port : String) -> String {
    let fileManager = FileManager.default
    
    guard let appSupportDirectory = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first,
          let bundleId = Bundle.main.bundleIdentifier else {
      return ""
    }
    
    let supportDirectory = appSupportDirectory.appendingPathComponent(bundleId)
    let storageDirectory = supportDirectory.appendingPathComponent("RCTAsyncLocalStorage_V1")
    let storageFile = storageDirectory.appendingPathComponent("_api_profiles".md5())
    if fileManager.fileExists(atPath: storageFile.path) {
      do {
        
        let apiProfiles = try String(contentsOf: storageFile, encoding: .utf8)
//        print("[getTokenFromReactNative] apiProfiles file content: \(apiProfiles)")
        
        guard let dictApiProfiles = apiProfiles.toJSON() as? [String : Any],
              let profilesArray = dictApiProfiles["profiles"] as? [[String: Any]] else {
          print("[getTokenFromReactNative] failed init.")
          return ""
        }
        
        if let account = findAccountPartial(profilesArray: profilesArray, username: username, tenant: tenant, host: host, port: port) {
          let ringtoneName = account["ringtoneName"] as? String
          print("[getTokenFromReactNative] \(ringtoneName)")
          print("[getTokenFromReactNative] pbxRingtone \(account["pbxRingtone"])")
          print("[getTokenFromReactNative] ringtoneData \(account["ringtoneData"])")
          if(ringtoneName == "default") {
            return account["pbxRingtone"] as? String ?? ""
          }
          return account["ringtoneData"] as? String ?? ""
        }
        
      } catch {
        print("[getTokenFromReactNative] Error while reading or parsing JSON: \(error)")
        return ""
      }
    }
    return ""
  }
  
  static func compareFalsishField(v1 :String ,v2 : String ) -> Bool {
    print("[compareFalsishField] v1 \(v1)")
    print("[compareFalsishField] v2 \(v2)")
    print("[compareFalsishField] bool \(v1 == v2)")
    return v1.isEmpty || v2.isEmpty || v1 == v2
  }
  
  static func findAccountPartial(profilesArray : [[String: Any]], username : String, tenant : String, host: String, port : String) -> [String: Any]? {
    for p in profilesArray {
      let pbxUsername = p["pbxUsername"] as? String ?? ""
      if(pbxUsername.isEmpty) {
        continue
      }
      
      if(pbxUsername == username) && compareFalsishField(v1: p["pbxTenant"] as? String ?? "", v2: tenant) && compareFalsishField(v1: p["pbxHostname"] as? String ?? "", v2: host) && compareFalsishField(v1: p["pbxPort"] as? String ?? "", v2: port) {
        return p
      }
    }
    return nil
  }
}
