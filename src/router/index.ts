import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/home/index.vue'

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		redirect: '/home'
	},
	{
		path: '/home',
		component: Home
	},
]

const router = createRouter({
	history: createWebHashHistory(),
	routes
})

export default router
