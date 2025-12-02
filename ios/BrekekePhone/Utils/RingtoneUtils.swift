struct RingtonePicker: Codable {
  let ringtonePicker: [String: Bool]
}

public class RingtoneUtils {
  static let staticRingtones: [String] = ["brekeke_ringtone"]
  static let defaultRingtone: String = staticRingtones.first! + defaultFormat
  static let defaultFormat = ".mp3"
  static var audioPlayer: AVAudioPlayer?
  private static var downloadingFiles = Set<String>()

  // get ringtone from account
  @objc static func getRingtone(
    ringtone: String,
    username: String,
    tenant: String,
    host: String,
    port: String
  ) -> String {
    let r = _validate(ringtone: ringtone)
    if r != "" {
      return r
    }
    return getRingtone(
      username: username,
      tenant: tenant,
      host: host,
      port: port
    )
  }

  @objc static func getRingtone(
    username: String,
    tenant: String,
    host: String,
    port: String
  ) -> String {
    if let a = AccountUtils.find(
      username: username,
      tenant: tenant,
      host: host,
      port: port
    ) {
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
  @objc static func _validate(ringtone: String) -> String {
    if ringtone.isEmpty {
      return ""
    }

    if _static(r: ringtone) {
      return ringtone + defaultFormat
    }
    // https and file picker
    if let url = getSavedRingtonePath(from: ringtone) {
      return url.absoluteString
    }
    return ""
  }

  @objc static func https(r: String) -> Bool {
    return r.starts(with: "https://")
  }

  static func _static(r: String) -> Bool {
    return staticRingtones.contains(r)
  }

  static func _audio(r: String) -> Bool {
    return r.lowercased().hasSuffix(".mp3")
  }

  // handle save file to local
  static func downloadAndSaveRingtone(
    from urlString: String,
    fileName: String,
    completion: @escaping (Bool) -> Void
  ) {
    guard let remoteURL = URL(string: urlString) else {
      completion(false)
      return
    }

    let task = URLSession.shared
      .downloadTask(with: remoteURL) { location, _, error in
        guard let location = location, error == nil else {
          completion(false)
          return
        }
        let destinationURL = getDestinationURL(for: fileName)

        try? FileManager.default.removeItem(at: destinationURL)

        do {
          try FileManager.default.moveItem(at: location, to: destinationURL)
          completion(true)
        } catch {
          completion(false)
        }
      }.resume()
  }

  static func getSavedRingtonePath(from u: String) -> URL? {
    var fileName = u + defaultFormat
    if https(r: u) {
      if !_audio(r: u) {
        return nil
      }
      guard let url = URL(string: u) else { return nil }
      fileName = url.lastPathComponent.replacingOccurrences(of: " ", with: "_")
    }
    let fileURL = getDestinationURL(for: fileName)
    if FileManager.default.fileExists(atPath: fileURL.path) {
      return fileURL
    }
    if downloadingFiles.contains(fileName) {
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
    // Use the `Ringtones` folder name to sync with the
    // @react-native-documents/picker library patch
    let doc = FileManager.default.urls(
      for: .documentDirectory,
      in: .userDomainMask
    ).first!.appendingPathComponent("Ringtones")
    if !FileManager.default.fileExists(atPath: doc.path) {
      try? FileManager.default.createDirectory(
        at: doc,
        withIntermediateDirectories: true,
        attributes: nil
      )
    }
    return doc.appendingPathComponent(fileName)
  }

  // ringtone from picker
  static func getRingtonePicker() -> [String] {
    var results: [String] = []
    if let a = Storage.read(),
       let p = a.toModel(RingtonePicker.self) {
      for item in p.ringtonePicker {
        if checkPickerExist(item.key) {
          results.append(item.key)
        }
      }
    }
    return results
  }

  static func checkPickerExist(_ key: String) -> Bool {
    let fileName = key + defaultFormat
    let fileURL = getDestinationURL(for: fileName)
    return FileManager.default.fileExists(atPath: fileURL.path)
  }
}
