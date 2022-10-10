import Combine
import Foundation
import os
import UIKit

class SettingsManager: NSObject {
  enum Error: Swift.Error {
    case uuidMismatch
  }

  static let shared = SettingsManager()

  var settings: Settings {
    settingsSubject.value
  }

  private(set) lazy var settingsPublisher = settingsSubject.eraseToAnyPublisher()
  private let settingsWillWriteSubject = PassthroughSubject<Void, Never>()
  private static let settingsKey = "settings"
  private static let userDefaults =
    UserDefaults(suiteName: "group.com.brekeke.lpc")!
  private let settingsSubject: CurrentValueSubject<Settings, Never>
  private static let logger = Logger(
    prependString: "SettingsManager",
    subsystem: .general
  )

  override init() {
    var settings = Self.fetch()
    SettingsManager.logger.log("settings init(): \(settings)")
    if settings == nil {
      settings = Settings(
        appId: "",
        uuid: "",
        deviceName: ""
      )

      do {
        try Self.set(settings: settings!)
      } catch {
        SettingsManager.logger.log("Error encoding settings - \(error)")
      }
    }

    settingsSubject = CurrentValueSubject(settings!)

    super.init()

    Self.userDefaults.addObserver(
      self,
      forKeyPath: Self.settingsKey,
      options: [.new],
      context: nil
    )
  }

  // MARK: - Publishers

  // A publisher that emits new settings following a call to `set(settings:)`.
  private(set) lazy var settingsDidWritePublisher = settingsWillWriteSubject
    .compactMap { [weak self] _ in
      self?.settingsPublisher
        .dropFirst()
        .first()
    }
    .switchToLatest()
    .eraseToAnyPublisher()

  // MARK: - Actions

  func refresh() throws {
    guard let settings = Self.fetch() else {
      return
    }

    settingsSubject.send(settings)
  }

  func set(settings: Settings) throws {
//    Self.logger.log("setSetting::\(settings)")
//    Self.logger.log("setSetting::\(self.settings)")
//    guard settings.uuid == self.settings.uuid else {
//      throw Error.uuidMismatch
//    }
//    if(settings.uuid != ""){
//      if(settings.uuid != self.settings.uuid){
        settingsWillWriteSubject.send()
//      }
      try Self.set(settings: settings)
      settingsSubject.send(settings)
//      Self.logger.log("setSetting::\(settingsSubject.first())")
//    }
  }

  private static func set(settings: Settings) throws {
    let encoder = JSONEncoder()
    let encodedSettings = try encoder.encode(settings)
    userDefaults.set(encodedSettings, forKey: Self.settingsKey)
  }

  private static func fetch() -> Settings? {
    guard let encodedSettings = userDefaults.data(forKey: settingsKey)
    else {
      return nil
    }

    do {
      let decoder = JSONDecoder()
      let settings = try decoder.decode(
        Settings.self,
        from: encodedSettings
      )
      return settings
    } catch {
      logger.log("Error decoding settings - \(error)")
      return nil
    }
  }

  // MARK: - KVO

  override func observeValue(
    forKeyPath _: String?,
    of _: Any?,
    change _: [NSKeyValueChangeKey: Any]?,
    context _: UnsafeMutableRawPointer?
  ) {
    do {
      try refresh()
    } catch {
      SettingsManager.logger.log("Error refreshing settings - \(error)")
    }
  }
}
