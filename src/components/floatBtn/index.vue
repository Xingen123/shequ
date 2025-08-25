<template>
	<div class='es-float-btn'>
        <div class='es-float-btn-img'>
            <RightCircleOutlined @click="isShow = !isShow"/>
        </div>
		<slot v-show="isShow" >
			
		</slot>
            
	</div>
</template>

<script setup lang='ts'>
import { ref } from "vue"
import { RightCircleOutlined } from '@ant-design/icons-vue';
const props = defineProps({
    
})
const isShow = ref(false)

</script>

<style lang='scss' scoped>
.es-float-btn{
	width: 400px;
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
