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
			proxy: {
				'/api': {
					target: 'https://qhzhzp.ybnetwork.fun/index.php',
					changeOrigin: true,
					secure: false,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
	}
  }
})
