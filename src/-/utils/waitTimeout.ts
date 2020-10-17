const waitTimeout = (time = 300) =>
  new Promise(resolve => {
    window.setTimeout(resolve, time)
  })

export default waitTimeout
