package com.brekeke.phonedev;

public class LPCModel {
    public  class User {
        String uuid;
        String uuid2;
        String deviceName;
        String appid = "com.brekeke.phonedev";
        User(String token, String userName) {
            this.uuid = token + "$pn-gw@" + userName;
            this.uuid2 = token + "$pn-gw@" + userName + "@voip";
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

        Settings(String host, int port, String tlsKeyHash, String token, String userName) {
            this.host = host;
            this.port = port;
            this.tlsKeyHash = tlsKeyHash;
            this.token = token;
            this.userName = userName;
        }
    }
}
