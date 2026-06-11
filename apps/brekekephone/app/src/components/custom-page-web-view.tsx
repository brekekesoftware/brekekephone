import { forwardRef, useRef } from 'react'

interface Props {
  url: string
  onTitle?: (title: string) => void
  onTitleChanged?: (title: string) => void
  onJsLoading?: (loading: boolean) => void
  onLoadStart?: () => void
  onLoadEnd?: (e: any) => void
  onError?: () => void
}
export const CustomPageWebView = forwardRef(
  ({ url, onLoadEnd }: Props, ref) => {
    const webViewRef = useRef(null)
    const onLoaded = () => {
      onLoadEnd?.(null)
    }
    return (
      <iframe
        ref={webViewRef}
        className='h-full w-full'
        src={url}
        height='100%'
        width='100%'
        id='customPage'
        onLoad={onLoaded}
        frameBorder='0'
        loading='eager'
        referrerPolicy='unsafe-url'
        sandbox='allow-same-origin allow-scripts'
      />
    )
  },
)
