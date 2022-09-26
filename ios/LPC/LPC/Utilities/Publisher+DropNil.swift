import Foundation
import Combine

extension Publisher {
    public func dropNil<T>() -> AnyPublisher<T, Failure> where Output == T? {
        compactMap { $0 }
        .eraseToAnyPublisher()
    }
}
