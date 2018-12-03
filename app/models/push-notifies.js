import {createModel} from '@thenewvu/redux-model'
import immutable from "@thenewvu/immutable";

export default createModel({
    prefix: 'pushNotifies',
    origin: {
        notifDatas: []
    },
    getter: {
        notifDatas: (s) => s.notifDatas
    },
    action: {
        add: function(state, notifData) {
            const obj = immutable.on(state)(
                immutable.fset('notifDatas', (datas) => [...datas, notifData]),
            );
            return obj;
        },
        remove: (state, notifData) => immutable.on(state)(
            immutable.fset('notifDatas', ({[notifData]: removed, ...rest}) => rest)
        )
        ,clear: () => ({
            notifDatas : []
        })

    }
})
