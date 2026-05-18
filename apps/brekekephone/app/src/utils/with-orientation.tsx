import { useOrientation } from '#/utils/use-orientation'

export const withOrientation = Component => props => {
  const orientation = useOrientation()
  return <Component {...props} orientation={orientation} />
}
