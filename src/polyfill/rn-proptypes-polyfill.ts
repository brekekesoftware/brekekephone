/**
 * PropTypes Polyfill for React Native 0.79+
 *
 * This file provides polyfills for PropTypes that have been deprecated or removed
 * in React Native 0.79 and higher:
 * - ViewPropTypes
 * - ColorPropType
 * - EdgeInsetsPropType
 * - PointPropType
 * - Text.propTypes
 *
 * Implementation approaches:
 * 1. Global ReactNative object polyfill (for native)
 * 2. Object.defineProperty polyfill (for direct imports)
 */
import PropTypes from 'prop-types'

// Common PropTypes definitions
const ViewStylePropType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.array,
  PropTypes.number,
])

const ColorPropTypeDef = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.array,
  PropTypes.object,
])

const EdgeInsetsPropTypeDef = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.number,
])

const PointPropTypeDef = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.number,
  PropTypes.array,
])

// 1. Polyfill via global.ReactNative
if (global.ReactNative) {
  const RN = global.ReactNative

  // ViewPropTypes
  if (!RN.ViewPropTypes) {
    RN.ViewPropTypes = {
      style: ViewStylePropType,
    }
  }

  // ColorPropType
  if (!RN.ColorPropType) {
    RN.ColorPropType = ColorPropTypeDef
  }

  // EdgeInsetsPropType
  if (!RN.EdgeInsetsPropType) {
    RN.EdgeInsetsPropType = EdgeInsetsPropTypeDef
  }

  // PointPropType
  if (!RN.PointPropType) {
    RN.PointPropType = PointPropTypeDef
  }

  // Text.propTypes
  if (RN.Text && !RN.Text.propTypes) {
    RN.Text.propTypes = {
      style: PropTypes.any,
    }
  }
}

// 2. Polyfill via Object.defineProperty for direct imports
try {
  const RN = require('react-native')

  // ViewPropTypes
  if (!RN.ViewPropTypes) {
    Object.defineProperty(RN, 'ViewPropTypes', {
      configurable: true,
      get: () => ({
        style: ViewStylePropType,
      }),
    })
  }

  // ColorPropType
  if (!RN.ColorPropType) {
    Object.defineProperty(RN, 'ColorPropType', {
      configurable: true,
      get: () => ColorPropTypeDef,
    })
  }

  // EdgeInsetsPropType
  if (!RN.EdgeInsetsPropType) {
    Object.defineProperty(RN, 'EdgeInsetsPropType', {
      configurable: true,
      get: () => EdgeInsetsPropTypeDef,
    })
  }

  // PointPropType
  if (!RN.PointPropType) {
    Object.defineProperty(RN, 'PointPropType', {
      configurable: true,
      get: () => PointPropTypeDef,
    })
  }
} catch (err) {}
