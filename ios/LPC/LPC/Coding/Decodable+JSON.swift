import Foundation

extension Decodable {
    init?(decoder: JSONDecoder, data: Data) {
        do {
            self = try decoder.decode(Self.self, from: data)
        } catch {
            return nil
        }
    }
}
