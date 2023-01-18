export const parsePalParams = (config: object = {}) =>
  Object.entries(config)
    .filter(([k]) => k.startsWith('webphone.pal.param.'))
    .reduce((params, [k, v]: string[]) => {
      params[k.replace('webphone.pal.param.', '')] = v
      return params
    }, {} as { [k: string]: string })
