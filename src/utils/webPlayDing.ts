import ding from '#/assets/ding.mp3'
import { waitTimeout } from '#/utils/waitTimeout'

export const webPlayDing = async () => {
  const a = new Audio()
  a.volume = 0.05
  a.src = ding
  document.body.appendChild(a)
  a.play()
  await waitTimeout(3000)
  document.body.removeChild(a)
}
