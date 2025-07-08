public class RingtoneUtils {
  private static String[] staticRingtones = {"incallmanager_ringtone"};
  private static String defaultRingtone = staticRingtones[0];

  public static validateRingtone(String ringtone) {
    // TODO:
  }

  public static getRingtoneFromPN(String ringtone, String user) {
    return validateRingtone(_getRingtoneFromPN(ringtone, user));
  }
  private static _getRingtoneFromPN(String ringtone, String user) {
    // TODO:
    // parse user into username, tenant, host, port
    return _getRingtoneFromUser()
  }

  public static getRingtoneFromUser(String username, String tenant, String host, String port) {
    return validateRingtone(_getRingtoneFromUser(username, tenant, host, port))
  }
  private static _getRingtoneFromUser(String username, String tenant, String host, String port) {
    // Tạo hàm static findAccountPartial giống logic bên js để tìm ra account. Truyền vào biến user ở intent để tìm account
    // Nếu k có acc -> return default
    // Nếu có user picked ringtone -> user picked ringtone
    // Nếu có pbx ringtone -> pbx ringtone
    // -> default
  }
  // TODO: move other ringtone utils here
}
