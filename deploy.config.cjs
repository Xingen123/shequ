module.exports = {
  projectName: 'jh',
  // privateKey: '/Users/xingen/.ssh/id_rsa',
  passphrase: '',
  cluster: [],
  test: {
    // 环境对象
    name: '测试环境', // 环境名称
    script: 'npm run build', // 打包命令
    host: '192.168.30.14', // 服务器地址
    port: 22, // 服务器端口号
    username: 'wxrh', // 服务器登录用户名
    password: '1qaz@WSX', // 服务器登录密码
    distPath: 'dist', // 本地打包生成目录
    webDir: '/web/jh-map/dist', // 服务器部署路径（不可为空或'/'）
    isRemoveRemoteFile: true, // 是否删除远程文件（默认true）
  },
  prod: {
    // 环境对象
    name: '生产环境', // 环境名称
    script: 'npm run build', // 打包命令
    host: '192.168.30.14', // 服务器地址
    port: 22, // 服务器端口号
    username: 'wxrh', // 服务器登录用户名
    password: '1qaz@WSX', // 服务器登录密码
    distPath: 'dist', // 本地打包生成目录
    webDir: '/web/jh-map/dist', // 服务器部署路径（不可为空或'/'）
    isRemoveRemoteFile: true, // 是否删除远程文件（默认true）
  },
};
