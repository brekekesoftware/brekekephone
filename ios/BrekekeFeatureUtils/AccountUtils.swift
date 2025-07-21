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

struct Profile: Codable {
  let pbxUsername: String
  let pbxTenant: String?
  let pbxHostname: String?
  let pbxPort: String?
  let ringtone: String?
  let pbxRingtone: String?
}

struct ProfilesWrapper: Codable {
  let profiles: [Profile]
}


public class AccountUtils {
  
  @objc static func getRingtoneFromUser(username : String, tenant : String, host: String, port : String) -> String {
    
    if let apiProfiles = prepareProfile(),
       let profileWrapper = apiProfiles.toModel(ProfilesWrapper.self) {
      
      if let account = findAccountPartial(profiles: profileWrapper.profiles, username: username, tenant: tenant, host: host, port: port) {
        var ringtone = RingtoneUtils.validateRingtoneFromUser(ringtone: account.ringtone ?? "")
        if ringtone != "" {
          return ringtone
        }
        
        ringtone = RingtoneUtils.validateRingtoneFromUser(ringtone: account.pbxRingtone ?? "")
        if ringtone != "" {
          return ringtone
        }
      }
    }
    
    return RingtoneUtils.defaultRingtone
  }
  
  static func compareFalsishField(v1 :String ,v2 : String ) -> Bool {
    return v1.isEmpty || v2.isEmpty || v1 == v2
  }
  
  static func findAccountPartial(profiles: [Profile], username: String, tenant: String, host: String, port: String) -> Profile? {
    for p in profiles {
      if p.pbxUsername.isEmpty {
        continue
      }
      
      if p.pbxUsername == username &&
          compareFalsishField(v1: p.pbxTenant ?? "", v2: tenant) &&
          compareFalsishField(v1: p.pbxHostname ?? "", v2: host) &&
          compareFalsishField(v1: p.pbxPort ?? "", v2: port) {
        return p
      }
    }
    return nil
  }
  
  
  static func prepareProfile() -> String? {
    let f = FileManager.default
    
    guard let a = f.urls(for: .applicationSupportDirectory, in: .userDomainMask).first,
          let bundleId = Bundle.main.bundleIdentifier else {
      return nil
    }
    
    let st = a.appendingPathComponent(bundleId).appendingPathComponent("RCTAsyncLocalStorage_V1")
    let storageFile = st.appendingPathComponent("_api_profiles".md5())
    
    if f.fileExists(atPath: storageFile.path) {
      do {
        let apiProfiles = try String(contentsOf: storageFile, encoding: .utf8)
        return apiProfiles
      } catch {
        print("[AccountUtils] Error while reading or parsing JSON: \(error)")
      }
    }
    print("[AccountUtils] can not get file")
    return nil
  }
  

}
