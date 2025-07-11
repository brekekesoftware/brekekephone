

public class RingtoneUtils {
  static let staticRingtones : [String] = ["incallmanager_ringtone", "jinglebell" ,"thucuoi"]
  static let defaultRingtone = staticRingtones.first ?? ""
  static let defaultFormat = ".mp3"
  
  static func handleRingtoneList(title: String, uri: String) -> NSDictionary {
    return [
      "title": title,
      "uri": uri
    ]
  }
  
  @objc static func validateRingtone(ringtone : String) -> String {
    if(staticRingtones.contains(ringtone)){
      return ringtone + defaultFormat
    }
    return defaultRingtone + defaultFormat
  }
}
