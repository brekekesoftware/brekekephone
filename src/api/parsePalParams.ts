export const parsePalParams = (config: object = {}) =>
  Object.entries(config)
    .filter(([k]) => k.startsWith('webphone.pal.param.'))
    .reduce((params, [k, v]) => {
      params[k] = v
      return params
    }, {} as { [k: string]: string })
