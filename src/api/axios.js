import { message } from 'ant-design-vue'
import axios from 'axios'
import { BASE_URL } from './ipConfig'
import router from '@/router';


const env = process.env.NODE_ENV === 'development' ? 'development'
  : (process.env.VUE_APP_TITLE === 'test' ? 'test' : 'production')
let a = 0
function myAxios (axiosConfig) {
  const service = axios.create({
    baseURL: env === 'production' ? BASE_URL : 'https://qhzhzp.ybnetwork.fun/index.php', // 设置统一的请求前缀
    timeout: 10000, // 设置统一的超时时长
  })
  const err = (error) => {
    if (error.response) {
      const code = error.response.data.code
      // source.cancel() // 失败后调用取消请求函数
      switch (code) {
        case 403:
          message.warning('拒绝访问')
          break
        case 500:
          message.warning('服务异常')
          break
        case 404:
          message.warning('很抱歉，资源未找到!')
          break
        case 504:
          message.warning('网络超时')
          break
        case 401:
          a++
          a == 1 && message.warning('token过期，请重新登录！')
          router.push('/login')
          // location.reload()
          break
        default:
          message.warning(error.response.data.message)
          break
      }
    }


    return Promise.reject(error)
  }

  // request interceptor
  service.interceptors.request.use(config => {
    // if(config.url !=  "/sys/login") {
    //   config.cancelToken = source.token // 写入取消请求的标识
    // }
    const token = localStorage.getItem('token') 
    config.headers['X-Access-Token'] = token
      if (config.method === 'get') {
      config.params = {
        ...config.params,
      }
    }
    return config
  }, (error) => {
    console.log(error)
    return Promise.reject(error)
  })

  // response interceptor
  service.interceptors.response.use((response) => {
    if (response.data.code !== 1) {
      message.warning(response.data.msg)
      return response.data.data
    }
    return response.data.data
  }, err)
  return service(axiosConfig)
}

export default myAxios
