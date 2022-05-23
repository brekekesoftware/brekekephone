import ding from '../assets/ding.mp3'

export const triggerAudioPermission = () => {
  const a = new Audio()
  a.volume = 0.05
  a.src = ding
  document.body.appendChild(a)
  a.play()
  setTimeout(() => {
    document.body.removeChild(a)
  }, 3000)
}
