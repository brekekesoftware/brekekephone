// native picker options + error handler live in a shared module so they can be
// imported from pick-file.native.ts without the path shadowing to itself, while
// still being reachable from the web build (intl bundling).
export {
  onPickFileNativeError,
  pickFileNativeOptions,
} from '#/utils/pick-file-shared'

export const pickFile = (cb: Function) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = () => {
    cb(input.files?.[0])
  }
  input.click()
}
