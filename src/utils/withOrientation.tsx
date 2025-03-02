import { useOrientation } from './useOrientation'

export const withOrientation = Component => props => {
  const orientation = useOrientation()
  return <Component {...props} orientation={orientation} />
}
