import registerStyle from '../shared/registerStyle';

registerStyle(v => ({
  'NativeBase.Header': {
    '.noLeft': {
      'NativeBase.Left': {
        width: 0,
        flex: 1,
      },
    },
    '.headerChat': {
      'NativeBase.Left': {
        flex: 0.25,
        paddingLeft: v.listItemPadding,
        paddingVertical: v.listItemPadding - 5,
      },
      'NativeBase.Body': {
        'NativeBase.Text': {
          fontWeight: '600',
          fontSize: 18,
        },
        'NativeBase.ViewNB': {
          paddingTop: v.listItemPadding - 5,
          flexDirection: 'row',
          alignItems: 'center',
        },
        flex: 0.5,
        alignItems: 'flex-start',
        paddingVertical: v.listItemPadding - 5,
      },
      'NativeBase.Right': {
        flex: 0.25,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: v.listItemPadding - 5,
      },
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1 / 3,
      height: 80,
    },
    '.search': {
      'NativeBase.Item': {
        'NativeBase.Input': {
          flex: 1,
          paddingVertical: 0,
        },
      },
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f1f1f1',
      // padding: std.gap.lg,
      borderColor: '#e2e2e4',
      // borderBottomWidth: StyleSheet.hairlineWidth,
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
    '.footerChat': {
      'NativeBase.Left': {
        'NativeBase.Button': {
          width: 45,
          height: 45,
        },
        flex: 0.2,
        paddingLeft: v.listItemPadding,
      },
      'NativeBase.Body': {
        flex: 0.5,
      },
      'NativeBase.Right': {
        flex: 0.3,
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
      justifyContent: 'flex-start',
    },
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
  v: {
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
      padding: v.listItemPadding,
      marginLeft: null,
    },
    '.chat': {
      'NativeBase.Left': {
        flex: 0.2,
      },
      'NativeBase.Body': {
        'NativeBase.ViewNB': {
          'NativeBase.Text': {
            '.note': {
              fontSize: 12,
              paddingLeft: v.listItemPadding,
              fontWeight: 'normal',
            },
            paddingRight: 10,
            fontSize: 14,
          },
          flexDirection: 'row',
          alignItems: 'center',
        },
        'NativeBase.Text': {
          marginLeft: null,
          paddingTop: 7,
          fontSize: 16,
        },
        flex: 0.8,
        alignSelf: 'flex-start',
        marginLeft: v.listItemPadding + 5,
      },
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
        paddingVertical: v.listItemPadding + 2,
        marginLeft: v.listItemPadding + 5,
      },
      'NativeBase.Right': {
        'NativeBase.Button': {
          '.transparent': {
            'NativeBase.Text': {
              fontSize: v.listNoteSize,
              color: v.sTabBarActiveTextColor,
            },
          },
          height: null,
          paddingHorizontal: v.listItemPadding,
        },
        flex: 0.25,
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingRight: v.listItemPadding + 5,
        paddingVertical: v.listItemPadding + 5,
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
        marginLeft: v.listItemPadding + 5,
      },
      'NativeBase.Right': {
        'NativeBase.Button': {
          '.transparent': {
            'NativeBase.Text': {
              fontSize: v.listNoteSize,
              color: v.sTabBarActiveTextColor,
            },
          },
          height: null,
        },
        flex: 0.25,
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingRight: v.listItemPadding + 5,
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
        paddingVertical: v.listItemPadding + 2,
        marginLeft: v.listItemPadding + 5,
      },
      'NativeBase.Right': {
        'NativeBase.Button': {
          '.transparent': {
            'NativeBase.Text': {
              fontSize: v.listNoteSize,
              color: v.sTabBarActiveTextColor,
            },
          },
          height: null,
        },
        flex: 0.4,
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingRight: v.listItemPadding + 5,
        paddingVertical: v.listItemPadding + 5,
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
              fontSize: v.listNoteSize,
              color: v.sTabBarActiveTextColor,
            },
          },
          height: null,
        },
        flex: 0.5,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignSelf: 'stretch',
        paddingVertical: v.listItemPadding + 5,
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
          borderRadius: v.listItemPadding * 4,
          width: v.listItemPadding * 6,
          height: v.listItemPadding * 6,
        },
        'NativeBase.Text': {
          paddingTop: v.listItemPadding,
          fontSize: v.listItemPadding,
        },
        alignItems: 'center',
        marginHorizontal: v.listItemPadding,
      },
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: v.listItemPadding * 2,
      marginLeft: v.listItemPadding,
      marginRight: v.listItemPadding,
    },
    '.hangUp': {
      'NativeBase.Left': {
        'NativeBase.Button': {
          justifyContent: 'center',
          borderRadius: v.listItemPadding * 4,
          width: v.listItemPadding * 6,
          height: v.listItemPadding * 6,
        },
        'NativeBase.Text': {
          fontWeight: 'bold',
          paddingTop: v.listItemPadding,
        },
        alignItems: 'center',
        marginHorizontal: v.listItemPadding,
      },
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: v.listItemPadding * 2,
      marginLeft: v.listItemPadding,
      marginRight: v.listItemPadding,
    },
    '.leftpd18': {
      marginLeft: v.listItemPadding + 12,
      marginTop: v.listItemPadding,
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
    '.removeServer': {
      'NativeBase.ViewNB': {
        'NativeBase.Text': {
          padding: v.listItemPadding,
          fontSize: 18,
          fontWeight: '400',
        },
        'NativeBase.ViewNB': {
          'NativeBase.Button': {
            '.cancel': {
              'NativeBase.Text': {
                fontSize: 14,
                fontWeight: '400',
                color: '#ffffff',
              },
              backgroundColor: '#212121',
              marginRight: v.listItemPadding,
            },
            '.remove': {
              'NativeBase.Text': {
                fontSize: 14,
                fontWeight: '400',
                color: '#ffffff',
              },
              backgroundColor: '#74bf53',
            },
          },
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginRight: v.listItemPadding,
          marginTop: v.listItemPadding,
        },
        backgroundColor: '#ffffff',
        padding: v.listItemPadding,
      },
      flex: 1,
      justifyContent: 'center',
    },
    '.callModal': {
      'NativeBase.ViewNB': {
        backgroundColor: '#ffffff',
      },
      flex: 1,
      justifyContent: 'flex-end',
    },
    '.av_transfer': {
      'NativeBase.ViewNB': {
        '.center': {
          alignSelf: 'center',
          alignItems: 'center',
          lineHeight: 10,
          'NativeBase.Text': {
            paddingVertical: v.listItemPadding,
            textAlign: 'center',
          },
        },
        '.btncall': {
          'NativeBase.Button': {
            justifyContent: 'center',
            borderRadius: v.listItemPadding * 2,
            width: v.listItemPadding * 4,
            height: v.listItemPadding * 4,
          },
          'NativeBase.ViewNB': {
            'NativeBase.Text': {
              paddingTop: v.listItemPadding,
              fontSize: v.listItemPadding,
              textAlign: 'center',
              alignSelf: 'center',
            },
          },
          marginTop: 100,
        },
        alignItems: 'center',
        marginHorizontal: v.listItemPadding,
        top: '30%',
      },
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: v.listItemPadding,
      top: '50%',
    },
    '.center': {
      alignItems: 'center',
    },
  },
}));
