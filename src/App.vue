<template>
<a-config-provider :locale="locale">
  <div :class="['es-screen-container']">
    <div  class="es-app" >
      <RouterView></RouterView>
    </div>
  </div>

</a-config-provider>
</template>

<script setup  lang='ts'>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { nextTick,ref,computed } from 'vue'
import { useResize } from '@/utils/useResize'
import { useScreenStore } from '@/store'
dayjs.locale('zh-cn')
const store = useScreenStore()
// const { screenRef } = useResize()

const locale = ref(zhCN)
const reload = computed(() => {
  return store.getReload
})
</script>
<style lang='scss' scoped>
.es-screen-container {
	--es-screen-width: 1920px;
  --es-screen-height: 1080px;
	--es-header-height: 72px;
	--es-block-bg: #222733;
	--es-screen-bg: rgb(22, 21, 34);
	--es-screen-text-color: #fff;
  
	position: relative;
	margin: 0;
	width: 100%;
	height: 100%;
	background-size: 100% 100%;
	overflow: hidden;
	background: black;
	color: var(--es-screen-text-color);
}
.es-app{
 	width: 100%;
	height: 100%;
}
</style>
