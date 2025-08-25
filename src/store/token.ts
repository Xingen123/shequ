// import api from '@/api'
import { defineStore } from 'pinia'


import {goLogin} from '@/api/apiList'

const useTokenStore = defineStore(
  // 唯一ID
  'token',
  {
    state: () => ({
      token: localStorage.token,
      userInfo: localStorage.userInfo,
    }),
    getters: {
      isLogin: (state) => {
        let retn = false
        if (state.token != null) {
            retn = true
        }
        return retn
      },
    },
    actions: {
      login(data) {
        return new Promise<void>(async (resolve,reject) => {
          try{
            const {token,userInfo} = await goLogin(data)
            console.log(token,userInfo)
            // 模拟登录成功，写入 token 信息
            localStorage.setItem('token', token)
            localStorage.setItem('userInfo', userInfo)
            this.token = token
            this.userInfo = userInfo
            resolve()
          }catch(err){
            console.log(err)
            reject(err)
          }
         
        })
      },
      logout() {
        return new Promise<void>((resolve) => {
          // 模拟退出登录，清除 token 信息
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          this.token = null
          this.userInfo = null
          resolve()
        })
      },
    },
  },
)

export default useTokenStore
