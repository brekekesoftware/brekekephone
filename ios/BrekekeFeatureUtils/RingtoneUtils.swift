
struct RingtonePicker : Codable {
  let ringtonePicker : [String: RingtoneItem]
  
}
struct RingtoneItem: Codable {
  let uri: String
}


public class RingtoneUtils {
  static let staticRingtones : [String] = ["incallmanager_ringtone", "jinglebell" ,"thucuoi"]
  static let defaultRingtone : String = staticRingtones.first! + defaultFormat
  static let defaultFormat = ".mp3"
  static var audioPlayer: AVAudioPlayer?
  private static var downloadingFiles = Set<String>()
  
  
  // get ringtone from account
  @objc static func getRingtone(ringtone: String, username : String, tenant : String, host: String, port : String) -> String {
    let r = _validate(ringtone: ringtone)
    if r != "" {
      return r
    }
    return getRingtone(username: username, tenant: tenant, host: host, port: port)
  }
  
  @objc static func getRingtone(username : String, tenant : String, host: String, port : String) -> String {
    if let a = AccountUtils.find(username: username, tenant: tenant, host: host, port: port) {
      var r = _validate(ringtone: a.ringtone ?? "")
      if !r.isEmpty {
        return r
      }
      r = _validate(ringtone: a.pbxRingtone ?? "")
      if !r.isEmpty {
        return r
      }
    }
    return defaultRingtone
  }
  
  // validate
  
  
  @objc static func _validate(ringtone : String) -> String {
    print("[RingtoneUtils]:validateRingtone \(ringtone)")
    if(ringtone.isEmpty){
      return ""
    }
    
    if(_static(r: ringtone)){
      return ringtone + defaultFormat
    }
    // https and file picker
    if let url = getSavedRingtonePath(from: ringtone) {
      print("RingtoneUtils:url?.absoluteString \(url.absoluteString)")
      return url.absoluteString
    }

    return ""
  }
  
  @objc static func https(r : String) -> Bool {
    return r.starts(with: "https://")
  }
  
  static func _static(r : String) -> Bool {
    return staticRingtones.contains(r)
  }
  
  
  // handle save file to local
  static func downloadAndSaveRingtone(from urlString: String , fileName : String , completion: @escaping (Bool) -> Void) {
    guard let remoteURL = URL(string: urlString) else {
      print("[[RingtoneUtils]] Invalid URL")
      completion(false)
      return
    }
    let task = URLSession.shared.downloadTask(with: remoteURL) { location, response, error in
      guard let location = location, error == nil else {
        print("[[RingtoneUtils]] Download error: \(error?.localizedDescription ?? "Unknown error")")
        completion(false)
        return
      }
      let destinationURL = getDestinationURL(for : fileName)
      
      try? FileManager.default.removeItem(at: destinationURL)
      
      do {
        try FileManager.default.moveItem(at: location, to: destinationURL)
        print("[[RingtoneUtils]] Saved to: \(destinationURL.path)")
        completion(true)
      } catch {
        print("[[RingtoneUtils]] Failed to move file: \(error.localizedDescription)")
        completion(false)
      }
    }.resume()
  }
  
  static func getSavedRingtonePath(from u: String) -> URL? {
    var fileName = u + defaultFormat
    if(https(r: u)) {
      guard let url = URL(string: u) else { return nil }
      fileName = url.lastPathComponent.replacingOccurrences(of: " ", with: "_")
    }
    
    let fileURL = getDestinationURL(for : fileName)
    print("[RingtoneUtils]:fileURL \(fileURL)")
    
    let isExist = FileManager.default.fileExists(atPath: fileURL.path)
    if(isExist) {
      return fileURL
    }
    
    if(downloadingFiles.contains(fileName)) {
      return nil
    }
    downloadingFiles.insert(fileName)
    downloadAndSaveRingtone(from: u, fileName: fileName) {
      _ in DispatchQueue.main.async {
        downloadingFiles.remove(fileName)
      }
    }
    return nil
  }
  
  static func getDestinationURL(for fileName: String) -> URL {
    let doc = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!.appendingPathComponent("Ringtones")
    if(!FileManager.default.fileExists(atPath:doc.path)) {
      try? FileManager.default.createDirectory(at: doc, withIntermediateDirectories: true, attributes: nil)
    }
    return doc.appendingPathComponent(fileName)
  }
  
  // ringtone from picker
  static func getRingtonePicker() -> [String] {
    var results : [String] = []
    if let a = Storage.read(),
       let p = a.toModel(RingtonePicker.self)
    {
      print("[RingtoneUtils] pickerData \(p.ringtonePicker)")
      for item in p.ringtonePicker {
        results.append(item.key)
      }
    }
    return results
  }
}
