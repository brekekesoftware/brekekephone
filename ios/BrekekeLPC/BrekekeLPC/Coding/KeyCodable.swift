import Foundation

struct KeyCodedPayload<Key: Codable>: Codable {
  var codingKey: Key
  var data: Data
}

public enum KeyCodableError: Error {
  case unknownValueType(String)
  case unknownKey(String)
  case encodingError(String)
}

protocol KeyCodable {
  associatedtype Key: Hashable
  var keymap: [Key: Codable.Type] { get }
}

extension KeyCodable {
  func decode(for key: Key, data: Data) throws -> Codable {
      print("KeyCodable::decode")
    guard let mappedType = keymap[key]
    else {
      throw KeyCodableError
        .unknownKey(
          "Cannot decode data using key: \(key), no matching key in keymap."
        )
    }

    let decoder = JSONDecoder()

    guard let decodedValue = mappedType.init(decoder: decoder, data: data)
    else {
      throw KeyCodableError.unknownKey("Cannot decode JSON with key: \(key).")
    }

    return decodedValue
  }

  func encode<Message: Codable>(value: Message) throws -> KeyCodedPayload<Key> {
    for (codingKey, type) in keymap {
      guard Swift.type(of: value) == type
      else {
        continue
      }

      do {
        let encoder = JSONEncoder()
        let data = try encoder.encode(value)
        return KeyCodedPayload(codingKey: codingKey, data: data)
      } catch {
        throw KeyCodableError.encodingError(error.localizedDescription)
      }
    }

    throw KeyCodableError
      .unknownValueType(
        "Cannot encode value: \(value), no matching key in keymap."
      )
  }
}
