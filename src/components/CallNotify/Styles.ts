import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  notify: {
    flex: 1,
  },
  notifyBtnSideBySide: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  numberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyContainer: {
    flex: 1,
    marginBottom: 100,
  },
})

export default styles
