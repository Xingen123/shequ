class Socket {
  /**
   * 构造函数
   * @param {object} params 构造函数参数
   */
  constructor (params) {
    window.WebSocket = window.WebSocket || window.MozWebSocket
    if (!window.WebSocket) { // 检测浏览器支持
      console.error('错误: 浏览器不支持websocket')
      return
    }
    this.websocket = null
    this.params = params
    this.socketInit(params)
  }

  /**
   * 初始化socket
   * @param {string}   url     WebSocket服务器将响应的URL
   * @param {function} onopen  open事件的回调函数
   * @param {function} onclose close事件的回调函数
   * @param {function} onerror error事件的回调函数
   * @param {function} onclose close事件的回调函数
   * @param {boolean}  reconnect 是否启用断线重连 默认为false
   * @param {number}   timer   心跳周期 若为空或0则不启用
   */
  socketInit ({
    url, onopen, onmessage, onerror, onclose, reconnect = false, timer
  }) {
    if (url !== undefined) {
      // 若不以wss?开头
      if (!/^wss?:\/\//.test(url)) {
        const { protocol } = window.location
        // 则自动补上协议头
        url = protocol === 'http:' ? 'ws://' + url : 'wss://' + url
      }
      try {
        this.websocket = new WebSocket(url)
        // console.log(this.websocket)
        // 用于指定连接成功后的回调函数。
        this.websocket.onopen = (e) => {
          // console.log('连接成功', e)
          if (timer > 0) {
            this.heartCheck(timer)
          }
          if (typeof onopen === 'function') {
            onopen(e)
          }
        }
        // 用于指定当从服务器接受到信息时的回调函数。
        this.websocket.onmessage = (e) => {
          // console.log('接收数据', e)
          onmessage(e.data)
        }
        // 用于指定连接关闭后的回调函数。
        this.websocket.onclose = (e) => {
          // console.log('连接关闭', e)
          reconnect && this.reconnect()
          if (typeof onclose === 'function') {
            onclose(e)
          }
        }
        // 用于指定连接失败后的回调函数。
        this.websocket.onerror = (e) => {
          // console.log('连接异常', e)
          reconnect && this.reconnect()
          if (typeof onerror === 'function') {
            onerror(e)
          }
        }
      } catch (e) {
        console.log(e)
        reconnect && this.reconnect()
      }
    }
  }

  // 发送消息
  send (message) {
    // readyState 1 表示已经链接并且可以通讯
    if (!this.websocket || this.websocket.readyState !== 1) {
      console.log('请确认websocket是否已经链接并且可以通讯')
      return
    }
    console.log(JSON.stringify(message))
    this.websocket.send(JSON.stringify(message))
  }

  // 手动关闭socket
  close () {
    this.heartInterval && clearInterval(this.heartInterval)
    this.reconnectTimeout && clearTimeout(this.reconnectTimeout)
    if (!this.websocket) {
      console.log('websocket 不可用')
      return
    }
    this.websocket.close()
  }

  // 周期性发送ping 保活
  heartCheck (timer) {
    this.heartInterval = window.setInterval(() => {
      this.send({ type: 'ping' })
    }, timer)
  }

  // 断线重连
  reconnect () {
    if (this.lockReconnect) return
    this.lockReconnect = true
    this.reconnectTimeout && clearTimeout(this.reconnectTimeout)
    this.reconnectTimeout = window.setTimeout(() => {
      this.socketInit(this.params)
      this.lockReconnect = false
    }, 5000)
  }
}
export default Socket
