import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
const pathResolve = (dir: string): string => {
  return resolve(__dirname, '.', dir)
}
export default defineConfig(({ mode }) => {
  return {
    plugins: [vue()],
    base: './',
	resolve: {
			alias: {
				'@': pathResolve('src')
			}
	},
	server: {
			open: true,
    		host: '0.0.0.0',
			port: 3006,
			proxy: {
				'/api': {
					target: 'http://127.0.0.1:8088',
					changeOrigin: true,
					secure: false
				},
			},
	}
  }
})
