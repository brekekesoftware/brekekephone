import { observer } from 'mobx-react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { v } from '#/components/variables'
import { RnLoading } from '#/stores/RnLoading'

const css = StyleSheet.create({
  RnLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: v.layerBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...v.backdropZindex,
  },
})

export const RnLoadingOverlay = observer(() =>
  !RnLoading.count ? null : (
    <View
      onResponderTerminationRequest={() => false}
      onStartShouldSetResponder={() => true}
      style={css.RnLoadingOverlay}
    >
      <ActivityIndicator size='large' color='white' />
    </View>
  ),
)
