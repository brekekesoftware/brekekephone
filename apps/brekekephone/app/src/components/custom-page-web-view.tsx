import { forwardRef, useRef } from 'react'


const css = {
  image: {
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  imageError: {
    overflow: 'hidden',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#00000030',
    overflow: 'hidden',
    zIndex: 100,
  },
  full: {
    width: '100%',
    height: '100%',
  },
}
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
        style={css.full}
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
