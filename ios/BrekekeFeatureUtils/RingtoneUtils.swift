

public class RingtoneUtils {
  static let staticRingtones : [String] = ["incallmanager_ringtone", "jinglebell" ,"thucuoi"]
  static let defaultRingtone : String = staticRingtones.first! + defaultFormat
  static let defaultFormat = ".mp3"
  
  @objc static func validateRingtone(ringtone : String, username : String, tenant : String, host: String, port : String) -> String {
    print("Hoang:validateRingtone \(ringtone)")
    let r = _validate(ringtone : ringtone)
    if(r != "") {
      return ringtone + defaultFormat
    }
    return AccountUtils.getRingtoneFromUser(username: username, tenant: tenant, host: host, port: port)
  }
  
  @objc static func _validate(ringtone : String) -> String {
    print("Hoang:_validate \(ringtone)")
    if(staticRingtones.contains(ringtone)){
      return ringtone + defaultFormat
    }
    return ""
  }
}
