import express from 'express';
import cors from 'cors';
import { parkData } from './mockData.js';

const app = express();
const PORT = 8088;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// 通用成功响应封装
const successResponse = (data, msg = '操作成功') => ({
  code: 1,
  msg,
  data
});

// 1. 社区/园区树形数据与地理坐标（兼容前端原接口）
app.get('/api/equipment.Equipment/community', (req, res) => {
  res.json(successResponse(parkData.community));
});

// 2. 天气数据接口（兼容前端原接口）
app.get('/api/equipment.Equipment/weather', (req, res) => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const dynamicWeather = {
    ...parkData.weather,
    update_time: `${hours}:${minutes}`
  };
  res.json(successResponse(dynamicWeather));
});

// 3. 园区综合概览与KPI指标
app.get('/api/park/overview', (req, res) => {
  res.json(successResponse(parkData.overview));
});

// 4. 今日能耗趋势数据
app.get('/api/park/energy', (req, res) => {
  res.json(successResponse(parkData.energyTrend));
});

// 5. 楼宇入驻率排名
app.get('/api/park/occupancy', (req, res) => {
  res.json(successResponse(parkData.occupancyRank));
});

// 6. 安防告警与设备巡检动态
app.get('/api/park/alarms', (req, res) => {
  res.json(successResponse(parkData.alarms));
});

// 7. 空间业态占比分布
app.get('/api/park/space-mix', (req, res) => {
  res.json(successResponse(parkData.spaceMix));
});

// 8. 客流与车流数据
app.get('/api/park/traffic', (req, res) => {
  res.json(successResponse(parkData.traffic));
});

// 9. 楼宇逐层透视详情
app.get('/api/park/building-floors', (req, res) => {
  const buildingName = req.query.name;
  if (buildingName && parkData.buildingFloors[buildingName]) {
    res.json(successResponse(parkData.buildingFloors[buildingName]));
  } else {
    // 默认或返回第一个匹配楼宇
    const defaultData = parkData.buildingFloors["研发中心 A栋"];
    res.json(successResponse(defaultData));
  }
});

// 10. 服务健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Smart Park Twin Backend Server', time: new Date() });
});

// 启动监听
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 智慧产业园区数字孪生 本地后台服务已启动!`);
  console.log(`📡 服务地址: http://127.0.0.1:${PORT}`);
  console.log(`📋 API 文档:`);
  console.log(`   - GET /api/equipment.Equipment/community`);
  console.log(`   - GET /api/equipment.Equipment/weather`);
  console.log(`   - GET /api/park/overview`);
  console.log(`   - GET /api/park/energy`);
  console.log(`   - GET /api/park/occupancy`);
  console.log(`   - GET /api/park/alarms`);
  console.log(`   - GET /api/park/space-mix`);
  console.log(`   - GET /api/park/traffic`);
  console.log(`   - GET /api/park/building-floors`);
  console.log(`===============================================`);
});

