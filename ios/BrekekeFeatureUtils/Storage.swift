import Foundation

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

public class Storage {
  
  static func read() -> String? {
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
  
  static func account() -> [Profile]? {
    if let d = read(),
       let p = d.toModel(ProfilesWrapper.self){
      return p.profiles
    }
    return nil
  }
}
