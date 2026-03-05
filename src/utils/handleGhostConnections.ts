export const getGhostSessionKeys = (
  videoClientSessionTable: Record<string, { remoteStreamObject?: MediaStream }>,
): string[] => {
  const ghostKeys: string[] = []

  for (const [k, v] of Object.entries(videoClientSessionTable)) {
    const tracks = v.remoteStreamObject?.getTracks?.()

    const isGhost =
      !!tracks?.length && tracks.every(t => t.muted || (t as any)._muted)

    if (isGhost) {
      ghostKeys.push(k)
    }
  }
  return ghostKeys
}

const isGhostSession = (v: { remoteStreamObject?: MediaStream }) => {
  const tracks = v.remoteStreamObject?.getTracks?.()
  return !!tracks?.length && tracks.every(t => t.muted || (t as any)._muted)
}
export const filterGhostSessions = <
  T extends { remoteStreamObject?: MediaStream },
>(
  sessions: T[],
): T[] => {
  const a = sessions.filter(s => !isGhostSession(s))
  return a
}
