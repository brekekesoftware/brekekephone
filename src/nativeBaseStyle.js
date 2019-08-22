import merge from 'lodash/merge';
import getTheme from 'native-base/src/theme/components';
import variables from 'native-base/src/theme/variables/commonColor';
import { Platform } from 'react-native';

// Update the variables which depend on the platform condition
// See native-base/src/theme/variables/commonColor.js for detail
// We will choose ios as the default platform then change the variables as we need
merge(variables, {
  platform: 'ios',
  cardItemPadding: 10,
  CheckboxRadius: 13,
  CheckboxBorderWidth: 1,
  CheckboxPaddingLeft: 4,
  CheckboxPaddingBottom: 0,
  CheckboxIconSize: 21,
  CheckboxIconMarginTop: undefined,
  CheckboxFontSize: 23 / 0.9,
  brandPrimary: 'white',
  // fontFamily: 'Roboto', // Should respect font
  toolbarBtnColor: '#007aff',
  toolbarSearchIconSize: 20,
  toolbarBtnTextColor: '#007aff',
  toolbarDefaultBorder: '#a7a6ab',
  radioBtnSize: 25,
  radioBtnLineHeight: 29,
  segmentBackgroundColor: '#F8F8F8',
  segmentActiveBackgroundColor: '#007aff',
  segmentTextColor: '#007aff',
  segmentActiveTextColor: 'white',
  segmentBorderColor: '#007aff',
  segmentBorderColorMain: '#a7a6ab',
  titleFontfamily: 'System',
  titleFontSize: 17,
  subTitleFontSize: 11,
  subtitleColor: 'black',
  titleFontColor: 'black',
  borderRadiusBase: 3,
  inverseTextColor: 'black',
  toolbarDefaultBg: '#e0e0e0',
  tabDefaultBg: '#e0e0e0',
  get btnTextSize() {
    return this.fontSizeBase * 1.1;
  },
});

// Build the style object from the above variables
const nativeBaseStyle = getTheme(variables);

// This recursively update the whole style
// Will be useful for which field we need to update for every components
const recursiveUpdateStyle = obj => {
  Object.entries(obj).forEach(([k, v]) => {
    if (k === 'fontFamily') {
      if (Platform.OS === 'web') {
        obj[k] = 'Roboto';
      }
    } else if (k === 'elevation') {
      obj[k] = 0; // Remove box shadow on android
    } else if (v && typeof v === 'object') {
      recursiveUpdateStyle(v);
    }
  });
};
recursiveUpdateStyle(nativeBaseStyle);

// Other small/accuracy modifications will be put here
// We should take a look at the default components to see the keys
merge(nativeBaseStyle, {
  'NativeBase.Header': {
    '.noLeft': {
      'NativeBase.Left': {
        width: 0,
        flex: 1,
      },
    },
    paddingTop: 0,
    paddingBottom: 0,
    borderBottomColor: null,
    borderBottomWidth: null,
    backgroundColor: 'white',
  },
  'NativeBase.TabHeading': {
    backgroundColor: 'white',
    '.active': {
      'NativeBase.Text': {
        color: 'black',
      },
    },
    'NativeBase.Text': {
      color: 'gray',
      fontWeight: 'bold',
      fontSize: 11,
    },
    'NativeBase.Bottom': {
      height: 2,
    },
  },
  'NativeBase.Footer': {
    backgroundColor: 'white',
  },
  'NativeBase.FooterTab': {
    'NativeBase.Button': {
      'NativeBase.Text': {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 9,
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    backgroundColor: 'white',
  },
  variables: {
    topTabBarActiveBorderColor: '#4cc5de',
  },
  'NativeBase.Badge': {
    '.brekeke': {
      backgroundColor: '#4cc5de',
    },
  },
  'NativeBase.ListItem': {
    '.statusUc': {
      'NativeBase.Left': {},
      'NativeBase.Right': {
        flex: 1,
        justifyContent: 'flex-end',
      },
      borderColor: '#c9c9c9',
      borderWidth: 1 / 3,
      backgroundColor: '#ffffff',
      padding: variables.listItemPadding,
      marginLeft: null,
    },
    '.btnlistServer': {
      'NativeBase.Left': {
        'NativeBase.Button': {
          backgroundColor: '#0000000',
          borderRadius: null,
          alignSelf: 'center',
          paddingLeft: variables.listItemPadding,
        },
        flex: 0.25,
      },
      'NativeBase.Body': {
        'NativeBase.Button': {
          backgroundColor: '#0000000',
          borderRadius: null,
          alignSelf: 'center',
        },
        flex: 0.25,
      },
      'NativeBase.Right': {
        'NativeBase.Button': {
          'NativeBase.Text': {
            fontWeight: '600',
            color: '#ffffff',
          },
          borderRadius: null,

          backgroundColor: null,
          alignSelf: 'center',
        },
        flex: 0.5,
        backgroundColor: '#000',
        borderBottomRightRadius: 15,
      },
      marginLeft: null,
      paddingRight: null,
      paddingVertical: null,
      borderBottomWidth: null,
    },
    '.listUser': {
      // -> components-Recent/Recents + PageContact
      'NativeBase.Left': {
        flex: 0.25,
      },
      'NativeBase.Body': {
        'NativeBase.ViewNB': {
          'NativeBase.Text': {
            paddingLeft: 5,
          },
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 5,
        },
        'NativeBase.Text': {
          marginLeft: null,
          paddingVertical: 3,
          fontSize: 18,
          fontWeight: '400',
        },
        paddingVertical: variables.listItemPadding + 2,
        marginLeft: variables.listItemPadding + 5,
      },
      'NativeBase.Right': {
        'NativeBase.Button': {
          '.transparent': {
            'NativeBase.Text': {
              fontSize: variables.listNoteSize,
              color: variables.sTabBarActiveTextColor,
            },
          },
          height: null,
          paddingHorizontal: variables.listItemPadding,
        },
        flex: 0.25,
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingRight: variables.listItemPadding + 5,
        paddingVertical: variables.listItemPadding + 5,
      },
    },
    '.infoUser': {
      // -> components-Recent/Recents + PageContact
      'NativeBase.Left': {
        flex: 0.25,
      },
      'NativeBase.Body': {
        'NativeBase.Text': {
          marginLeft: null,
          paddingVertical: 3,
        },
        marginLeft: variables.listItemPadding + 5,
      },
      'NativeBase.Right': {
        'NativeBase.Button': {
          '.transparent': {
            'NativeBase.Text': {
              fontSize: variables.listNoteSize,
              color: variables.sTabBarActiveTextColor,
            },
          },
          height: null,
        },
        flex: 0.25,
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingRight: variables.listItemPadding + 5,
      },
      borderBottomWidth: null,
    },
    '.listChat': {
      'NativeBase.Left': {
        flex: 0.25,
      },
      'NativeBase.Body': {
        'NativeBase.Text': {
          marginLeft: null,
          paddingVertical: 3,
        },
        paddingVertical: variables.listItemPadding + 2,
        marginLeft: variables.listItemPadding + 5,
      },
      'NativeBase.Right': {
        'NativeBase.Button': {
          '.transparent': {
            'NativeBase.Text': {
              fontSize: variables.listNoteSize,
              color: variables.sTabBarActiveTextColor,
            },
          },
          height: null,
        },
        flex: 0.4,
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingRight: variables.listItemPadding + 5,
        paddingVertical: variables.listItemPadding + 5,
      },
    },
    '.callpark': {
      'NativeBase.Left': {
        'NativeBase.Text': {
          alignSelf: 'flex-start',
        },
        flex: 0.5,
        flexDirection: 'column',
      },
      'NativeBase.Right': {
        'NativeBase.Button': {
          '.transparent': {
            'NativeBase.Text': {
              fontSize: variables.listNoteSize,
              color: variables.sTabBarActiveTextColor,
            },
          },
          height: null,
        },
        flex: 0.5,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingVertical: variables.listItemPadding + 5,
      },
    },
  },
  'NativeBase.Fab': {
    'NativeBase.Button': {
      backgroundColor: '#74bf53',
    },
  },
  'NativeBase.Left': {
    '.callBar': {
      'NativeBase.Left': {
        'NativeBase.Button': {
          justifyContent: 'center',
          borderRadius: variables.listItemPadding * 4,
          width: variables.listItemPadding * 6,
          height: variables.listItemPadding * 6,
        },
        'NativeBase.Text': {
          paddingTop: variables.listItemPadding,
          fontSize: variables.listItemPadding,
        },
        alignItems: 'center',
        marginHorizontal: variables.listItemPadding,
      },
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: variables.listItemPadding * 2,
      marginLeft: variables.listItemPadding,
      marginRight: variables.listItemPadding,
    },
    '.hangUp': {
      'NativeBase.Left': {
        'NativeBase.Button': {
          justifyContent: 'center',
          borderRadius: variables.listItemPadding * 4,
          width: variables.listItemPadding * 6,
          height: variables.listItemPadding * 6,
        },
        'NativeBase.Text': {
          fontWeight: 'bold',
          paddingTop: variables.listItemPadding,
        },
        alignItems: 'center',
        marginHorizontal: variables.listItemPadding,
      },
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: variables.listItemPadding * 2,
      marginLeft: variables.listItemPadding,
      marginRight: variables.listItemPadding,
    },
    '.leftpd18': {
      marginLeft: variables.listItemPadding + 12,
      marginTop: variables.listItemPadding,
      alignSelf: 'flex-start',
    },
    '.leftmgt15': {
      marginTop: '15%',
    },
    '.lefttop200': {
      top: '200%',
    },
  },
  'NativeBase.ViewNB': {
    '.heaederServer': {
      'NativeBase.ListItem': {
        '.end': {
          justifyContent: 'flex-end',
        },
        '.start': {
          'NativeBase.ViewNB': {
            'NativeBase.Text': {
              fontWeight: '600',
              fontSize: 30,
              alignSelf: 'flex-start',
              paddingBottom: variables.listItemPadding,
            },
            flexDirection: 'column',
            alignSelf: 'flex-start',
          },
          flexDirection: 'column',
          justifyContent: 'flex-start',
        },
        borderBottomWidth: null,
      },
    },
    '.noServer': {
      'NativeBase.Text': {
        fontSize: 50,
        textAlign: 'center',
      },
      'NativeBase.ListItem': {
        '.itemNoServer': {
          'NativeBase.Body': {
            'NativeBase.Icon': {
              fontSize: 50,
            },
            'NativeBase.Text': {
              fontSize: 25,
              fontWeight: '500',
              paddingTop: variables.listItemPadding,
            },
            'NativeBase.Button': {
              backgroundColor: '#000000',
              'NativeBase.Text': {
                fontWeight: '500',
                color: '#ffffff',
              },
            },
            alignItems: 'center',
            paddingTop: variables.listItemPadding,
          },
        },
        borderBottomWidth: null,
      },
      backgroundColor: Platform.select({
        ios: '#ffffff',
        android: '#ffffff',
        web: '#e2e2e4',
      }),
      width: '80%',
      marginLeft: variables.listItemPadding,
      borderRadius: 15,
      marginTop: '15%',
      padding: variables.listItemPadding - 5,
    },
    '.listServer': {
      backgroundColor: Platform.select({
        ios: '#ffffff',
        android: '#ffffff',
        web: '#e2e2e4',
      }),
      width: '90%',
      marginLeft: variables.listItemPadding,
      marginBottom: variables.listItemPadding,
      borderRadius: 15,
    },
    '.av_transfer': {
      'NativeBase.ViewNB': {
        '.center': {
          alignSelf: 'center',
          alignItems: 'center',
          lineHeight: 10,
          'NativeBase.Text': {
            paddingVertical: variables.listItemPadding,
            textAlign: 'center',
          },
        },
        '.btncall': {
          'NativeBase.Button': {
            justifyContent: 'center',
            borderRadius: variables.listItemPadding * 2,
            width: variables.listItemPadding * 4,
            height: variables.listItemPadding * 4,
          },
          'NativeBase.ViewNB': {
            'NativeBase.Text': {
              paddingTop: variables.listItemPadding,
              fontSize: variables.listItemPadding,
              textAlign: 'center',
              alignSelf: 'center',
            },
          },
          marginTop: 100,
        },
        alignItems: 'center',
        marginHorizontal: variables.listItemPadding,
        top: '30%',
      },
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: variables.listItemPadding,
      top: '50%',
    },
  },
});

export default nativeBaseStyle;
