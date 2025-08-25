// mock.js 文件
import Mock from 'mockjs' // 引入mockjs
import axios from 'axios'


export function mockList() {
  let dataList = [] // 用于接受生成数据的数组
  
  for (let i = 0; i < 26; i++) { // 可自定义生成的个数
    let template = {
      'id': i, // id
      'name': Mock.Random.cname(), // 生成姓名
      'time': Mock.Random.integer(0, 50),
      is:Mock.Random.boolean(),
      num:Mock.Random.integer(20, 200),
       type: Mock.Random.integer(1, 6),
    }
    dataList.push(template)
  }
  // 模拟分页
  // Mock.mock('http://localhost:5173/mocklist', 'post', (params) => {
  //   return {
  //         dataList,
  //   }
  // })
  return new Promise((resolve,reject)=>{
    resolve({data:{dataList}})
  }) 
  // return  axios.post('http://localhost:5173/mocklist', { page: 1, pageSize: 30 })
}
