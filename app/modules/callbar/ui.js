import React from 'react'
import {Platform, StyleSheet, View, Text, TouchableOpacity as Button, Image} from 'react-native'
import {std,rem} from '../styleguide'

const st = {
    main: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: std.color.shade1,
        borderColor: std.color.shade4,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,

    },
    tab: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    tabIcon: {
        fontFamily: std.font.icon,
        fontSize: Platform.select({
            ios: rem(32),
            android: std.iconSize.md,
            web:std.iconSize.md
        }),
        lineHeight: std.iconSize.md + std.gap.md * 2,
        color: std.color.shade5
    },

    navbar: {
        backgroundColor: std.color.shade1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: std.gap.sm,
        borderColor: std.color.shade4,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    navbarTitle: {
        fontFamily: std.font.text,
        fontSize: std.textSize.md,
        lineHeight: std.textSize.md + std.gap.md * 2,
        color: std.color.shade9
    },
    navbarLeftOpt: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: std.gap.lg,
        top: 0,
        bottom: 0,
        paddingRight: std.gap.lg
    },
    navbarRightOpt: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: std.gap.lg,
        top: 0,
        bottom: 0,
        paddingLeft: std.gap.lg
    },
    navbarOptText: {
        fontFamily: std.font.text,
        fontSize: std.textSize.md,
        lineHeight: std.textSize.md + std.gap.md * 2,
        color: std.color.action
    },
    control: {
        backgroundColor: std.color.shade0,
        borderColor: std.color.shade4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: std.gap.lg
    },
    controlCall: {
        alignItems: 'center',
        paddingVertical: std.gap.md
    },
    controlOpts: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center'
    },
    controlOpt: {
        justifyContent: 'center',
        alignItems: 'center',
        width: std.iconSize.md * 2,
        height: std.iconSize.md * 2,
        borderRadius: std.iconSize.md,
        borderColor: std.color.shade4,
        borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: std.gap.md,
        marginBottom: std.gap.md
    },
    optIconAction: {
        fontFamily: std.font.icon,
        fontSize: std.iconSize.md,
        color: std.color.action
    },
    optIconDanger: {
        fontFamily: std.font.icon,
        fontSize: std.iconSize.md,
        color: std.color.danger
    },
    callStatusPlaceholder: {
        width: rem(48),
        height: std.textSize.sm,
        marginVertical: std.gap.sm,
        backgroundColor: std.color.shade3
    },
    callNamePlaceholder: {
        width: rem(96),
        height: std.textSize.md,
        marginVertical: std.gap.md,
        backgroundColor: std.color.shade3
    },
    callNumberPlaceholder: {
        width: rem(64),
        height: std.textSize.sm,
        marginVertical: std.gap.sm,
        backgroundColor: std.color.shade3
    },
    call: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: std.gap.lg,
        paddingVertical: std.gap.sm,
        backgroundColor: std.color.shade0,
        borderColor: std.color.shade4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flex:1
    },
    callSelected: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: StyleSheet.hairlineWidth * 5,
        backgroundColor: std.color.active
    },
    callIconIncoming: {
        fontFamily: std.font.icon,
        fontSize: std.iconSize.md,
        color: std.color.notice,
        width: std.iconSize.md,
        marginRight: std.gap.lg
    },
    callIconMissed: {
        fontFamily: std.font.icon,
        fontSize: std.iconSize.md,
        color: std.color.danger,
        width: std.iconSize.md,
        marginRight: std.gap.lg
    },
    callIconOutgoing: {
        fontFamily: std.font.icon,
        fontSize: std.iconSize.md,
        color: std.color.active,
        width: std.iconSize.md,
        marginRight: std.gap.lg
    },
    callIconTalking: {
        fontFamily: std.font.icon,
        fontSize: std.iconSize.md,
        color: std.color.active,
        width: std.iconSize.md,
        marginRight: std.gap.lg
    },
    callIconHolding: {
        fontFamily: std.font.icon,
        fontSize: std.iconSize.md,
        color: std.color.shade4,
        width: std.iconSize.md,
        marginRight: std.gap.lg
    },
    callIconParking: {
        fontFamily: std.font.icon,
        fontSize: std.iconSize.md,
        color: std.color.shade4,
        width: std.iconSize.md,
        marginRight: std.gap.lg
    },
    callInfo: {
        flex: 1
    },
    callStatus: {
        fontFamily: std.font.text,
        fontSize: std.textSize.sm,
        lineHeight: std.textSize.sm + std.gap.sm * 2,
        color: std.color.shade5
    },
    callName: {
        fontFamily: std.font.text,
        fontSize: std.textSize.md,
        lineHeight: std.textSize.md + std.gap.md * 2,
        color: std.color.shade9
    },
    callNumber: {
        fontFamily: std.font.text,
        fontSize: std.textSize.sm,
        lineHeight: std.textSize.sm + std.gap.sm * 2,
        color: std.color.shade5
    },
    callOpt: {
        width: std.iconSize.md * 2,
        height: std.iconSize.md * 2,
        borderRadius: std.iconSize.md,
        borderColor: std.color.shade4,
        borderWidth: StyleSheet.hairlineWidth,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: std.gap.lg
    },

}

const Callbar = function(p) {
    const bVisible = p.activecallid && p.pathname !== '/auth/calls/manage';

    return <View style={st.main}>
        { bVisible && (
            <RunningItem
                hangup={p.hangup}
                hold={p.hold}
                unhold={p.unhold}
                activecallid={p.activecallid}
                activecall={p.runningById[p.activecallid]}
                pressCallsManage={p.pressCallsManage}
            />
        )}
    </View>
}

const RunningItem = (p) => (
    <Button style={st.call} onPress={p.pressCallsManage}>
        {!p.activecall.answered && p.activecall.incoming && (
            <Text style={st.callIconIncoming}>
                icon_phone_incoming
            </Text>
        )}
        {p.activecall.incoming && !p.activecall.answered && (
            <Text style={st.callIconMissed}>
                icon_phone_missed
            </Text>
        )}
        {!p.activecall.answered && !p.activecall.incoming && (
            <Text style={st.callIconOutgoing}>
                icon_phone_outgoing
            </Text>
        )}
        {p.activecall.answered && p.activecall.holding && (
            <Text style={st.callIconHolding}>
                icon_phone_pause
            </Text>
        )}
        {p.activecall.answered && !p.activecall.holding && (
            <Text style={st.callIconTalking}>
                icon_phone_call
            </Text>
        )}
        <View style={st.callInfo}>
            <Text style={st.callName}>
                {p.activecall.partyName || p.activecall.partyNumber }
            </Text>
            <Text style={st.callNumber}>
                {p.activecall.partyNumber}
            </Text>
        </View>
        {p.activecall.answered && p.activecall.holding && (
            <Button style={st.controlOpt}
                    onPress={p.unhold}>
                <Text style={st.optIconAction}>
                    icon_play
                </Text>
            </Button>
        )}
        {!p.activecall.holding && (
            <Button style={st.callOpt}
                    onPress={p.hangup}>
                <Text style={st.optIconDanger}>
                    icon_phone_hang
                </Text>
            </Button>
        )}
        {p.activecall.answered && !p.activecall.holding && (
            <Button style={st.callOpt}
                    onPress={p.hold}>
                <Text style={st.optIconAction}>
                    icon_pause
                </Text>
            </Button>
        )}

    </Button>
)



export default Callbar
