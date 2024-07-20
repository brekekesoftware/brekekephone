//
//  ObservableLocalNetworkAuthorization.swift
//  BrekekePhone
//
//  Created by ThangNT on 2024/07/19.
//
//
import Combine
import Foundation
import Network
import OSLog

/// Observes the local network authorization.
/// Inspired by discussions and solutions at
// https://stackoverflow.com/questions/63940427/ios-14-how-to-trigger-local-network-dialog-and-check-user-answer
/// To save resources, this class stops further work once the status has
// transitioned to `.granted`.
///
/// NOTE: If you're using this class to show a warning UI while the authorization
// dialog is initially visible,
/// you might have the problem that ­– since the status always starts out with
// `.notDetermined` ­–
/// your UI might shortly display the wrong state, since the transition
// `.notDetermined` -> `.granted` happens
/// only after a "short while". If you don't want that, it's advised to delay the
// evaluation for
/// about 1 second. If it takes longer than 1 second to publish the network
// service locally,
/// we can safely assume that it didn't work due to a permission problem.

/// Thinking about it, we could perhaps code this logic into this class and start
// out with an `.unknown` state first,
/// before transitioning afterwards into one of the three other states. Then
// again, I usually don't like
/// to hard code timings in such a way, so it might be better to fix this in your
// UI layer. Please give feedback,
/// if you have an opinion on that.
public class ObservableLocalNetworkAuthorization: NSObject, ObservableObject,
  NetServiceDelegate {
  public enum Status {
    case notDetermined
    case denied
    case granted
  }

  @Published public private(set) var status: Status = .notDetermined {
    didSet {
      #if DEBUG
        print("LNA status now \(status)")
      #endif
      switch status {
      case .granted:
//                  self.shutdown()
        break
      case .denied:
//                  self.shutdown()
        break
      default:
        break
      }
    }
  }

  private var browser: NWBrowser?
  private var service: NetService?

  override public init() {
    super.init()
    let service = NetService(
      domain: "local.",
      type: "_lnp._tcp.",
      name: "ObservableLocalNetworkAuthorization",
      port: 7891
    )
    service.delegate = self
    self.service = service
//      browser.start(queue: .main)
//      service.publish()
  }

  public func start() {
    if self.browser != nil {
      return
    }

    let parameters = NWParameters()
    parameters.includePeerToPeer = true
    let browser = NWBrowser(
      for: .bonjour(type: "_bonjour._tcp", domain: nil),
      using: parameters
    )

    browser.stateUpdateHandler = { [weak self] state in
      os_log(
        "BrekekeUtils::NWBrowser status update: %@",
        log: OSLog.default,
        type: .debug,
        "\(state)"
      )
      guard let self else { return }
      switch state {
      case .failed:
        self.service?.publish()
      case .waiting:
        self.status = .denied
      default:
        break
      }
    }
    self.browser = browser
    self.browser?.start(queue: .main)
    service!.publish()
  }

  public func netServiceDidPublish(_: NetService) {
    os_log(
      "BrekekeUtils::NetService did publish",
      log: OSLog.default,
      type: .debug
    )
    status = .granted
  }

  public func netService(
    _: NetService,
    didNotPublish errorDict: [String: NSNumber]
  ) {
    os_log(
      "BrekekeUtils::NetService did not publish: %s",
      log: OSLog.default,
      type: .debug,
      errorDict.description
    )
    status = .denied
  }

  public func shutdown() {
    browser?.cancel()
    service?.stop()
    browser = nil
  }
}
