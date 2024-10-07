package com.brekeke.phonedev;

import android.content.Context;
import android.util.Log;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class LocalConfig {
  private static String TAG = "[LocalConfig]";

  public static String fileName = "BrekekeConfig";

  public static void writeConfig(Context context, String content) {
    try (FileOutputStream fos = context.openFileOutput(fileName, Context.MODE_PRIVATE)) {
      fos.write(content.getBytes());
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public static String readConfig(Context context) throws FileNotFoundException {
    FileInputStream fis = context.openFileInput(fileName);
    InputStreamReader inputStreamReader = new InputStreamReader(fis, StandardCharsets.UTF_8);
    StringBuilder stringBuilder = new StringBuilder();
    try (BufferedReader reader = new BufferedReader(inputStreamReader)) {
      String line = reader.readLine();
      while (line != null) {
        stringBuilder.append(line).append('\n');
        line = reader.readLine();
      }
      return stringBuilder.toString();
    } catch (IOException e) {
      Log.d(TAG, "readConfig: " + e.getMessage());
    }
    return "";
  }
}
