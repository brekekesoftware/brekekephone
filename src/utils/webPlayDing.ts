import ding from '#/assets/ding.mp3'
import { ctx } from '#/stores/ctx'
import { waitTimeout } from '#/utils/waitTimeout'

export const webPlayDing = async () => {
  const a = new Audio()
  a.volume = 0.05
  a.src = ctx.global.buildEmbedStaticPath(ding)
  document.body.appendChild(a)
  a.play()
  await waitTimeout(3000)
  document.body.removeChild(a)
}
