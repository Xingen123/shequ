import { defineStore } from 'pinia'
interface ScreenState {
	userId: string,
}

export const useScreenStore = defineStore({
	id: 'screen',
	state: (): ScreenState => {
		return {
			userId:''
		}
	},
	getters: {
		getUserId(){
			return this.userId;
		  },
	},
	actions: {
		async setUserInfo({userId}){
			//  this.userId = userId
			//  const data = await getPersonInfo({userId})
			 this.userInfo = ''
		},
	},
})
