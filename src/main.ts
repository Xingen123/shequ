import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import * as store from '@/store'
import * as chart from './components/chart'
import '@/assets/css/index.scss'
// import '@/assets/css/resetScroll.scss'
import VueCesium from 'vue-cesium'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css';
import 'vue-cesium/dist/index.css'
const app = createApp(App);
app.use(VueCesium, {
    cesiumPath: './Cesium/Cesium.js',
}).use(chart).use(Antd).use(store).use(router).mount('#app')
