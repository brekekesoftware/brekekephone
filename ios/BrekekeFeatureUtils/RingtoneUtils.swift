
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
  
  @objc static func validateRingtone(ringtone : String, username : String, tenant : String, host: String, port : String) -> String {
    let r = _validate(ringtone : ringtone)
    print("[RingtoneUtils]:validateRingtone \(r)")
    if(r != "") {
      return r
    }
    return AccountUtils.getRingtoneFromUser(username: username, tenant: tenant, host: host, port: port)
  }
  
  @objc static func validateRingtoneFromUser(ringtone : String) -> String {
    let r = _validate(ringtone : ringtone)
    print("[RingtoneUtils]:validateRingtone \(r)")
    if(r != "") {
      return r
    }
    
    if let url = getSavedRingtonePath(from: ringtone) {
      return url.absoluteString
    }
    
    return ""
  }
  
  @objc static func _validate(ringtone : String) -> String {
    print("[RingtoneUtils]:validateRingtone \(ringtone)")
    if(staticRingtones.contains(ringtone)){
      return ringtone + defaultFormat
    }
    
    if(https(r: ringtone)) {
      let url = getSavedRingtonePath(from: ringtone)
      print("RingtoneUtils:url?.absoluteString \(url?.absoluteString ?? "")")
      if(url != nil) {
        return url?.absoluteString ?? ""
      }
    }
    return ""
  }
  
  @objc static func https(r : String) -> Bool {
    return r.starts(with: "https://")
  }
  
  static func downloadAndSaveRingtone(from urlString: String , fileName : String , completion: @escaping (Bool) -> Void) {
    guard let remoteURL = URL(string: urlString) else {
      print("[[RingtoneUtils]] Invalid URL")
      completion(false)
      return
    }
    //TODO: move file to ringtone folder
    // and patch @react-native-documents/picker moveFiles
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
  
  
  static func getRingtonePicker() -> [String] {
    var results : [String] = []
    if let apiProfiles = AccountUtils.prepareProfile(),
       let pickerData = apiProfiles.toModel(RingtonePicker.self)
    {
      print("[RingtoneUtils] pickerData \(pickerData.ringtonePicker)")
      for item in pickerData.ringtonePicker {
        print("[RingtoneUtils] item \(item.key)")
        results.append(item.key)
      }
    }
    return results
  }
}
