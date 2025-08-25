<template>
<header>
	<div class="es-screen-header" >
		<div class="es-screen-header-left">
			<span class="datetime">{{ currentTime }}</span>
			<label style="margin:0 30px;font-size:14px;" >{{ currentDate }}</label>
		</div>
		<div class="es-screen-header-title"  @click="screenChange"></div>
		<div class="es-screen-header-right">
		
		</div>
	</div>
</header>

</template>

<script setup lang='ts'>
import { CloudFilled} from '@ant-design/icons-vue';
import { computed,onMounted,onBeforeUnmount,nextTick,watch, ref } from 'vue'
import dayjs from 'dayjs'
import { useScreenStore } from '@/store'
import darkIcon from '@/assets/images/screen/qiehuan_dark.png'
import lightIcon from '@/assets/images/screen/qiehuan_light.png'
import githubIconDark from '@/assets/images/screen/github_dark.svg'
import githubIconLight from '@/assets/images/screen/github_light.svg'
import { useRouter } from "vue-router"
const store = useScreenStore()
const router = useRouter();

const weather = computed(() => {
	return store.getEvaluation.weather
})
const icon = computed(() => store.theme === 'dark' ? darkIcon : lightIcon)
const githubIcon = computed(() => store.theme === 'dark' ? githubIconDark : githubIconLight)

const currentTime = ref('')
const currentDate = ref('')
const allTime = ref(null)
let timeId = null
const isScreen = ref(true)
function handleChangeTheme() {
	store.$patch({
		theme: store.theme === 'dark' ? 'light' : 'dark'
	})
}
function screenChange(){
	isScreen.value = !isScreen.value
	if(!isScreen.value){
		document.documentElement.requestFullscreen()
	}else{
		document.exitFullscreen()
	}
}
function startTime() {
	timeId = setTimeout(() => {
		currentTime.value = dayjs().format('HH:mm:ss')
		if(currentTime.value == '06:00:00'){
			store.setReload(false)
			setTimeout(()=>{
				store.setReload(true)
			},1000)
		}
		startTime()
	}, 1000)
	const day = ['日','一','二','三','四','五','六']
	currentDate.value = `${dayjs().format('YYYY-MM-DD')}   星期${day[dayjs().day()]}`
}

onMounted(() => {
})
onBeforeUnmount(() => {
	clearTimeout(timeId)
})

startTime()
</script>

<style lang='scss' scoped>

.es-screen-header {
	position: fixed;
	width:  100%;
	height: 126px;
	animation: fade 3s;
	z-index: 10;
	// background: url('@/assets/images/top-bg.png') no-repeat;
	background-size: 100% 100%;
	&-title {
		position: absolute;
		left: 50%;
		top: 30%;
		cursor: pointer;
		transform: translate(-50%, -50%);
		width: 505px;
		height: 50px;
		font-family: 'MyFont2';
		background-size: 100% 100%;
		line-height: 110px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 38px;
		font-weight: 500;
		letter-spacing: 7px;
		
		// background:linear-gradient(90deg, #ffffff 0%  #dceffd 20% #c8e4fd 100%);
		// -webkit-background-clip: text;
		// -webkit-text-fill-color: transparent;
		// color: #FFFFFF;
		// text-shadow: 0px 0px 10px #1380FF;
	}
	&-left {
		width: 410px;
		height: 34px;
		display: flex;
		align-items: center;
		padding: 0 15px;
		position:absolute;
		// background: rgba($color: #000000, $alpha: 0.6);
		// background: url('@/assets/images/navleft.png') no-repeat;
		background-size: 100% 100%;
		z-index: 1;
		left: 42px;
		top: 37%;
		color: white;
		// transform: translateY(-80%);
		line-height: 29px;
		.datetime{
			font-size: 31px;
			font-family: 'MyFont2';
			font-weight: 500;
			width: 120px;
			margin-right: 10px;
			color: #FFFFFF;
			text-shadow: 0px 0px 10px #1380FF;
		}
	}
	&-right {
		display: flex;
		align-items: center;
		justify-content: center;
		position:absolute;
		right: 42px;
		top: 37%;
		z-index: 1;
		width: 410px;
		font-weight: 500;
		height: 34px;
		line-height: 29px;
		// background: rgba($color: #000000, $alpha: 0.6);
		// background: url('@/assets/images/navright.png') no-repeat;
		background-size: 100% 100%;
		font-size: 16px;
		color: #ECF6FF;
		// line-height: 19px;
		.text1{
			font-size: 31px;
			font-family: 'MyFont2';
			font-weight: 500;
			color: #FFFFFF;
			text-shadow: 0px 0px 10px #1380FF;
		}
		.text2{
			font-size: 10px;
			font-family: 'MyFont1';
			font-weight: 400;
			color: #FFFFFF;
			text-shadow: 0px 0px 10px #1380FF;
		}
	}
}

@keyframes fade {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style>
