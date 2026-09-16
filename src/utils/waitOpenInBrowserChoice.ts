let resolveChoice: (() => void) | null = null

const promise = new Promise<void>(resolve => {
  resolveChoice = resolve
})

export const waitOpenInBrowserChoice = () => promise

export const resolveOpenInBrowserChoice = () => {
  if (resolveChoice) {
    resolveChoice()
    resolveChoice = null
  }
}
