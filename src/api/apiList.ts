import {postAction,getAction} from './index'

// atr-core
export const getShequTreeData = (param) => getAction('/api/equipment.Equipment/community',{ account: 'demo', password: '123456' })

// export const goLogin = (param) => postAction('/sys/login',param)
