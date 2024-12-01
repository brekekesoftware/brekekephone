import 'whatwg-fetch'

import humanizeDuration from 'humanize-duration'
import { useEffect, useState } from 'react'

export const LastModified = ({ url }: { url: string }) => {
  const [duration, setDuration] = useState('')
  useEffect(() => {
    window
      .fetch(url, {
        method: 'HEAD',
        headers: new Headers({
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        }),
      })
      .then(res => {
        const lm = res.headers.get('Last-Modified')
        if (!lm) {
          setDuration('')
          return
        }
        setDuration(
          humanizeDuration(Date.now() - new Date(lm).getTime(), {
            largest: 1,
            round: true,
          }),
        )
      })
      .catch(() => {
        setDuration('')
      })
  }, [url])
  return url && duration && `(${duration} ago)`
}
