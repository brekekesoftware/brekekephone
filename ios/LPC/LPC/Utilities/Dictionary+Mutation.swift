import Foundation

extension Dictionary {
    public mutating func get(_ key: Key, insert newValue: @autoclosure () -> Value) -> Value {
        var value = self[key]

        if let value = self[key] {
            return value
        }

        value = newValue()
        self[key] = value!
        return value!
    }
}
