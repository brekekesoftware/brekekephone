import Foundation
import Combine

extension Publisher {
    public func unfailable() -> AnyPublisher<Result<Output, Failure>, Never> {
        map { output -> Result<Output, Failure> in
            .success(output)
        }
        .catch { error -> Just<Result<Output, Failure>> in
            Just(.failure(error))
        }
        .eraseToAnyPublisher()
    }
}
