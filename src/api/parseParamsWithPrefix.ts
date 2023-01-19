export const parsePalParams = (config?: object) =>
  parseParamsWithPrefix('webphone.pal.param.', config)
export const parseCallParams = (config?: object) =>
  parseParamsWithPrefix('webphone.call.', config)

const parseParamsWithPrefix = (prefix: string, o: object = {}) =>
  Object.entries(o)
    .filter(([k]) => k.startsWith(prefix))
    .reduce((res, [k, v]: string[]) => {
      res[k.replace(prefix, '')] = v
      return res
    }, {} as { [k: string]: string })
