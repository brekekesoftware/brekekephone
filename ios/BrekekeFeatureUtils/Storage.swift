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
  private static let KEY = "_api_profiles"
  
  static func read() -> String? {
    let f = FileManager.default
    
    guard let a = f.urls(for: .applicationSupportDirectory, in: .userDomainMask).first,
          let bundleId = Bundle.main.bundleIdentifier else {
      return nil
    }
    
    let st = a.appendingPathComponent(bundleId).appendingPathComponent("RCTAsyncLocalStorage_V1")
    var p = st.appendingPathComponent("manifest.json")
    
    if f.fileExists(atPath: p.path) {
      let pr = readManifest(path: p)
      if pr != nil {
        return pr
      }
    }
    
    p = st.appendingPathComponent(KEY.md5())
    if f.fileExists(atPath: p.path) {
      return readMd5(path : p)
    }
    return nil
  }
  
  static func account() -> [Profile]? {
    if let d = read(),
       let p = d.toModel(ProfilesWrapper.self){
      return p.profiles
    }
    return nil
  }
  
  static func readManifest(path : URL) -> String? {
    do {
      let data = try Data(contentsOf: path)
      let json = try JSONSerialization.jsonObject(with: data, options: [])
      if let dict = json as? [AnyHashable: Any],
         let profile = dict[KEY] as? String {
          return profile
      }
    } catch {}
    return nil
  }
  
  static func readMd5(path : URL) -> String? {
    do {
      let profile = try String(contentsOf: path, encoding: .utf8)
      return profile
    } catch {}
    return nil
  }
  
}
