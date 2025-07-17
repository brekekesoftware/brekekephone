

public class RingtoneUtils {
  static let staticRingtones : [String] = ["incallmanager_ringtone", "jinglebell" ,"thucuoi"]
  static let defaultRingtone : String = staticRingtones.first! + defaultFormat
  static let defaultFormat = ".mp3"
  static var audioPlayer: AVAudioPlayer?
  private static var downloadingFiles = Set<String>()
  
  @objc static func validateRingtone(ringtone : String, username : String, tenant : String, host: String, port : String) -> String {
    let r = _validate(ringtone : ringtone)
    print("Hoang:validateRingtone \(r)")
    if(r != "") {
      return r
    }
    return AccountUtils.getRingtoneFromUser(username: username, tenant: tenant, host: host, port: port)
  }
  
  @objc static func _validate(ringtone : String) -> String {
    print("Hoang:_validate \(ringtone)")
    if(staticRingtones.contains(ringtone)){
      return ringtone + defaultFormat
    }
    
    if(https(r: ringtone)) {
      let url = getSavedRingtonePath(from: ringtone)
      print("Hoang:url?.absoluteString \(url?.absoluteString ?? "")")
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
      print("[Hoang] Invalid URL")
      completion(false)
      return
    }
    
    let task = URLSession.shared.downloadTask(with: remoteURL) { location, response, error in
      guard let location = location, error == nil else {
        print("[Hoang] Download error: \(error?.localizedDescription ?? "Unknown error")")
        completion(false)
        return
      }
      let destinationURL = getDestinationURL(for : fileName)
      
      // Xóa file cũ nếu đã tồn tại
      try? FileManager.default.removeItem(at: destinationURL)
      
      do {
        try FileManager.default.moveItem(at: location, to: destinationURL)
        print("[Hoang] Saved to: \(destinationURL.path)")
        completion(true)
      } catch {
        print("[Hoang] Failed to move file: \(error.localizedDescription)")
        completion(false)
      }
    }.resume()
  }
  
  static func getSavedRingtonePath(from urlString: String) -> URL? {
    guard let url = URL(string: urlString) else { return nil }
    
    let fileName = url.lastPathComponent.replacingOccurrences(of: " ", with: "_")
    let fileURL = getDestinationURL(for : fileName)
    print("Hoang:fileURL \(fileURL)")
    print("Hoang:fileName \(fileName)")
    
    let isExist = FileManager.default.fileExists(atPath: fileURL.path)
    print("Hoang:isExist \(isExist)")
    if(isExist) {
      return fileURL
    }
    
    if(downloadingFiles.contains(fileName)) {
      return nil
    }
    downloadingFiles.insert(fileName)
    downloadAndSaveRingtone(from: urlString, fileName: fileName) {
      _ in DispatchQueue.main.async {
        downloadingFiles.remove(fileName)
      }
    }
    return nil
  }
  
  static func getDestinationURL(for fileName: String) -> URL {
    let cacheDirectory = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first!
    return cacheDirectory.appendingPathComponent(fileName)
  }

  
  static func deleteFile(at path: String) {
      let fileURL = URL(fileURLWithPath: path)
      let fileManager = FileManager.default

      if fileManager.fileExists(atPath: fileURL.path) {
          do {
              try fileManager.removeItem(at: fileURL)
              print("Hoang: File deleted at path: \(fileURL.path)")
          } catch {
              print("Hoang: Failed to delete file: \(error.localizedDescription)")
          }
      } else {
          print("File does not exist at path: \(fileURL.path)")
      }
  }
}
