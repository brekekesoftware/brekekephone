import Foundation

class L {
  private static var currentLocale: String = "en"

  // MARK: - Set

  private static var isJA: Bool {
    return currentLocale == "ja"
  }

  // MARK: - Localized Strings

  static func loading() -> String {
    return isJA ? "読込中..." : "Loading..."
  }
}
