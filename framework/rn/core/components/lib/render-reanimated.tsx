export const renderReanimated = (Component: any, props: any) => {
  if (props.reanimatedStyle) {
    props = { ...props }
    const style = Array.isArray(props.style) ? props.style : [props.style]
    props.style = [...style, props.reanimatedStyle]
    delete props.reanimatedStyle
  }
  return <Component {...props} />
}
