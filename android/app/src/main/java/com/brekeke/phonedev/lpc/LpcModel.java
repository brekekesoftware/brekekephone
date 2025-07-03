package com.brekeke.phonedev.lpc;

public class LpcModel {
  public class User {
    String uuid;
    String uuid2;
    String deviceName;
    final String appid = "22177122297";

    User(String token, String token2, String userName) {
      this.uuid = token + "$pn-gw@" + userName;
      this.uuid2 = token2 + "$pn-gw@" + userName + "@voip";
      this.deviceName = userName;
    }
  }

  public class Settings {
    String host;
    int port;
    String tlsKeyHash = "";
    String[] localSsids;
    String[] remoteSsids;
    String mobileCountryCode = "";
    String mobileNetworkCode = "";
    String trackingAreaCode = "";
    boolean enabled = true;
    String token;
    String userName;

    public Settings(String host, int port, String tlsKeyHash, String token, String userName) {
      this.host = host;
      this.port = port;
      this.tlsKeyHash = tlsKeyHash;
      this.token = token;
      this.userName = userName;
    }
  }
}
