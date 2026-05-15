export type CircularDepsMap = {
  [parent: string]: {
    [child: string]: boolean
  }
}

export const circularDeps = (map: CircularDepsMap) => {
  const circular: string[] = []
  Object.keys(map).forEach(parent =>
    circularDepsRecursive(map, parent, [], circular),
  )
  return circular
}

const circularDepsRecursive = (
  map: CircularDepsMap,
  name: string,
  traveled: string[],
  circular: string[],
) => {
  const i = traveled.indexOf(name)
  if (i > 0) {
    return
  }
  traveled.push(name)
  if (i === 0) {
    circular.push(traveled.join(' > '))
    return
  }
  Object.keys(map[name]).forEach(child => {
    if (child in map) {
      circularDepsRecursive(map, child, [...traveled], circular)
    }
  })
}
