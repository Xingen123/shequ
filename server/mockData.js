// 本地后台数据源：智慧产业园区数字孪生
export const parkData = {
  // 园区基础与社区树形数据（兼容原有的 getShequTreeData 接口）
  community: {
    title: "智慧产业园区 · 全域视图",
    coordinates: [
      [117.1795, 35.1205],
      [117.1865, 35.1205],
      [117.1868, 35.1150],
      [117.1792, 35.1150],
      [117.1795, 35.1205]
    ],
    leaders: ["张主任", "李总工"],
    address: "高新技术产业开发区未来大道888号",
    communityVillage: [
      {
        village_name: "核心产业片区",
        coordinates: [
          [117.1802, 35.1198],
          [117.1858, 35.1198],
          [117.1858, 35.1158],
          [117.1802, 35.1158],
          [117.1802, 35.1198]
        ],
        leaders: ["王主管", "刘经理"],
        address: "园区核心产业集群带",
        is_relocation: 0,
        permanent_population: 6840,
        mobile_population: 12480,
        key_population: 320,
        manager_name: "张建国",
        manager_phone: "189-5321-8899",
        building_area: "68.4万㎡",
        building_count: 8,
        household_count: 268,
        communityBuilding: [
          {
            building_name: "智造工坊 D栋",
            code: "D",
            type: "智能制造",
            occupancy: 100,
            enterprises: 42,
            people: 1280,
            floors: 12,
            area: "9.2万㎡",
            lnglat: "117.18138,35.11615",
            leaders: ["陈楼长"],
            address: "1F~3F 智能硬件实验室；4F~8F 工业互联创新中心；9F~12F 自动化研发总部"
          },
          {
            building_name: "研发中心 A栋",
            code: "A",
            type: "研发办公",
            occupancy: 93.2,
            enterprises: 56,
            people: 1650,
            floors: 18,
            area: "14.8万㎡",
            lnglat: "117.18140,35.11913",
            leaders: ["李楼长"],
            address: "1F~2F 园区共享展厅与会议中心；3F~10F 人工智能实验室；11F~18F 云计算研发基地"
          },
          {
            building_name: "人才公寓 F栋",
            code: "F",
            type: "人才公寓",
            occupancy: 91.5,
            enterprises: 18,
            people: 850,
            floors: 16,
            area: "6.5万㎡",
            lnglat: "117.18218,35.11904",
            leaders: ["王管家"],
            address: "1F 社区生活配套与健身中心；2F~16F 精装青年人才创客公寓，共480套"
          },
          {
            building_name: "人才公寓 G栋",
            code: "G",
            type: "人才公寓",
            occupancy: 88.2,
            enterprises: 15,
            people: 780,
            floors: 16,
            area: "6.2万㎡",
            lnglat: "117.18419,35.11910",
            leaders: ["赵管家"],
            address: "1F 共享洗衣房与咖啡书吧；2F~16F 专家与高端人才套房，共420套"
          },
          {
            building_name: "产业孵化 B栋",
            code: "B",
            type: "创业孵化",
            occupancy: 86.4,
            enterprises: 68,
            people: 920,
            floors: 10,
            area: "7.8万㎡",
            lnglat: "117.18256,35.11689",
            leaders: ["孙楼长"],
            address: "1F 众创空间与路演大厅；2F~5F 种子期科创团队；6F~10F 独角兽加速器"
          },
          {
            building_name: "总部大厦 C栋",
            code: "C",
            type: "总部办公",
            occupancy: 78.5,
            enterprises: 24,
            people: 760,
            floors: 22,
            area: "12.5万㎡",
            lnglat: "117.18345,35.11902",
            leaders: ["周楼长"],
            address: "1F 挑高商务大堂；2F~10F 智慧能源集团；11F~22F 新一代信息技术龙头总部"
          },
          {
            building_name: "商业配套 H栋",
            code: "H",
            type: "商业配套",
            occupancy: 72.6,
            enterprises: 30,
            people: 360,
            floors: 6,
            area: "4.8万㎡",
            lnglat: "117.18431,35.11688",
            leaders: ["吴经理"],
            address: "1F~2F 智慧商超与风味美食汇；3F 科技体验馆；4F~6F 商务差旅酒店"
          },
          {
            building_name: "会展中心 E栋",
            code: "E",
            type: "会展展示",
            occupancy: 64.8,
            enterprises: 15,
            people: 240,
            floors: 5,
            area: "6.6万㎡",
            lnglat: "117.18422,35.11615",
            leaders: ["郑主管"],
            address: "1F 无柱数字艺术展厅；2F 国际学术发布厅；3F~5F 成果转化对接服务平台"
          }
        ]
      }
    ]
  },

  // 天气数据（兼容 getWeather 接口）
  weather: {
    city: "智慧高新园区",
    date: "2026-11-14",
    week: "星期六",
    update_time: "11:16",
    wea: "晴",
    wea_img: "qing",
    tem: "22",
    tem_day: "25",
    tem_night: "16",
    win: "东南风",
    win_speed: "2级",
    win_meter: "11km/h",
    air: "48 优",
    pressure: "1013",
    humidity: "42%"
  },

  // 园区关键指标概览 OVERVIEW
  overview: {
    buildingCount: 8,
    buildingArea: "68.4万㎡",
    enterprises: 268,
    newEnterprisesThisMonth: 12,
    occupancyRate: "87.6%",
    occupancyGrowth: "+2.4%",
    activeStaff: "6,840",
    todayVisitors: "12,480人次",
    todayEnergy: "48,620",
    energyUnit: "kWh",
    energyComparison: "-3.2%",
    parkingOccupied: 1032,
    parkingTotal: 1200,
    parkingRate: "86.0%",
    safeDays: 268
  },

  // 今日能耗趋势 ENERGY
  energyTrend: {
    times: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "24:00"],
    values: [1200, 950, 1580, 4820, 3960, 4650, 3120, 2400, 1600],
    unit: "kWh"
  },

  // 楼宇入驻率排行榜 OCCUPANCY
  occupancyRank: [
    { name: "智造 D", fullName: "智造工坊 D栋", rate: 100, enterprises: 42, color: "#0CECF7" },
    { name: "研发 A", fullName: "研发中心 A栋", rate: 93.2, enterprises: 56, color: "#1E90FF" },
    { name: "公寓 F", fullName: "人才公寓 F栋", rate: 91.5, enterprises: 18, color: "#00E5FF" },
    { name: "公寓 G", fullName: "人才公寓 G栋", rate: 88.2, enterprises: 15, color: "#38EF7D" },
    { name: "孵化 B", fullName: "产业孵化 B栋", rate: 86.4, enterprises: 68, color: "#11998E" },
    { name: "总部 C", fullName: "总部大厦 C栋", rate: 78.5, enterprises: 24, color: "#4FACFE" },
    { name: "商业 H", fullName: "商业配套 H栋", rate: 72.6, enterprises: 30, color: "#F7971E" },
    { name: "会展 E", fullName: "会展中心 E栋", rate: 64.8, enterprises: 15, color: "#FFD200" }
  ],

  // 安防告警实时动态 ALARM
  alarms: [
    { id: 1, time: "11:26", location: "D栋·外立面防雷", title: "设备在线自检良好，已完成巡检", level: "info", status: "已巡检" },
    { id: 2, time: "11:07", location: "C座·12F核心机房", title: "环境温度28.6℃，循环降温已开启", level: "warning", status: "温控中" },
    { id: 3, time: "10:48", location: "园区南主门闸机", title: "高峰车辆入园，已自动导流通行", level: "info", status: "通行畅" },
    { id: 4, time: "10:12", location: "B区·B1地下车库", title: "CO浓度实时监测达标，排风自启", level: "info", status: "自维护" },
    { id: 5, time: "09:35", location: "A栋·高空抛物探头", title: "雷达触发瞬态抓拍，无异常抛坠物", level: "normal", status: "已确认" },
    { id: 6, time: "08:50", location: "E栋·会展南侧消防通道", title: "消防通道巡防合规，通道畅通无阻", level: "normal", status: "正常" }
  ],

  // 空间业态占比 SPACE MIX
  spaceMix: {
    totalArea: "68.4",
    unit: "万㎡",
    items: [
      { name: "研发办公", value: 28.7, percent: "42.0%", color: "#00E5FF" },
      { name: "智能制造", value: 17.8, percent: "26.0%", color: "#38EF7D" },
      { name: "人才公寓", value: 10.3, percent: "15.0%", color: "#FF9800" },
      { name: "商业配套", value: 6.8, percent: "10.0%", color: "#E040FB" },
      { name: "会展展示", value: 4.8, percent: "7.0%", color: "#2979FF" }
    ]
  },

  // 客流与车流数据 TRAFFIC
  traffic: {
    times: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
    pedestrians: [120, 80, 650, 4850, 3920, 3100, 4200, 1850],
    vehicles: [60, 30, 240, 1680, 1120, 980, 1450, 620]
  },

  // 楼宇逐层透视详情数据 FLOOR BY FLOOR
  buildingFloors: {
    "智造工坊 D栋": {
      totalFloors: 12,
      occupancy: "100%",
      area: "9.2万㎡",
      currentCompanies: [
        { floor: "10F-12F", tenant: "微芯工控计算联合实验室", type: "工业控制", people: 320 },
        { floor: "7F-9F", tenant: "智造未来工业软件科技", type: "数字化制造", people: 410 },
        { floor: "4F-6F", tenant: "天枢精密机器人工坊", type: "智能装备", people: 360 },
        { floor: "1F-3F", tenant: "柔性智造快试与公共打样中心", type: "试验产线", people: 190 }
      ]
    },
    "研发中心 A栋": {
      totalFloors: 18,
      occupancy: "93.2%",
      area: "14.8万㎡",
      currentCompanies: [
        { floor: "15F-18F", tenant: "量子智能算法研究院", type: "核心算法", people: 420 },
        { floor: "11F-14F", tenant: "深蓝云海网络技术", type: "云计算与SaaS", people: 510 },
        { floor: "6F-10F", tenant: "极客数智科技", type: "大模型应用", people: 480 },
        { floor: "1F-5F", tenant: "园区创享展厅与生态路演中心", type: "公共共享", people: 240 }
      ]
    },
    "总部大厦 C栋": {
      totalFloors: 22,
      occupancy: "78.5%",
      area: "12.5万㎡",
      currentCompanies: [
        { floor: "18F-22F", tenant: "先锋低碳科技集团总部", type: "清洁能源", people: 260 },
        { floor: "11F-17F", tenant: "恒升智通物联网股份", type: "物联网", people: 320 },
        { floor: "1F-10F", tenant: "综合商务接待中心与企业共享会客厅", type: "商务办公", people: 180 }
      ]
    }
  }
};

