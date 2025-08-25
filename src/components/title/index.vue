<template>
	<h3 :class='["es-screen-title",path ? "es-screen-path" : ""]'  @click="goPath">
		<slot>
			{{ title }}
		</slot>
		<slot name="icon">
		</slot>

	</h3>
	
</template>

<script setup lang='ts'>
import { useRouter } from "vue-router"
import { reactive } from "vue"
const props = defineProps({
	title: String,
	path:  String,
})


const router = useRouter();

const goPath = ()=> {
	if(!props.path) return false
	if(props.path == '/zhiban'){
		// state.openZb = true
		return false
	}
	router.push(props.path)
}
</script>

<style lang='scss' scoped>
.es-screen-path{
	cursor: pointer;
	transition: all 0.4s;
}

.es-screen-path:hover{
	animation-name: bounceText;
	animation-duration: 2s; /* 动画完成所需时间 */
	animation-delay: 0s; /* 动画延迟时间 */
	animation-iteration-count: infinite; /* 动画重复次数 */
	box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
@keyframes bounceText {
	0% {
	transform: scale(1); /*初始状态*/
	}
	50% {
	transform: scale(1.02); /*中间跳动状态*/
	text-shadow: 0 0 1px #0CECF7,0 0 5px #0CECF7, 0 0 1px #fff;
	}
	100% {
	transform: scale(1); /*结束状态*/
	}
}
.es-screen-title {
	position: relative;
	width: 100%;
	height: 32px;
	background: url('@/assets/images/titilebg.png') no-repeat;
    background-size:100% 100%;
	font-size: 21px;
	font-weight: 800;
	padding-left: 45px;
	padding-right: 8px;
	font-family: 'MyFont1';
	color: #FFFFFF;
	line-height: 23px;
	text-shadow: 0 0 1px #fff,0 0 5px #fff, 0 0 1px #0CECF7;
	margin-bottom: 8px;
	display: flex;
	justify-content: space-between;
}
</style>
