<template>
  <div class="weather-card">
    <header class="weather-header">
      <div class="city">{{ weather.city }}</div>
      <div class="date">
        {{ weather.date }} {{ weather.week }}
      </div>
      <div class="now-time">当前时间：{{ nowTime }}</div>
      <div class="update">数据更新时间：{{ weather.update_time }}</div>
    </header>

    <main class="weather-main">
      <div class="wea-info">
        <!-- <img
          class="wea-icon"
          :src="getWeaIcon(weather.wea_img)"
          :alt="weather.wea"
        /> -->
        <div class="tem">{{ weather.tem }}°C</div>
        <div class="wea">{{ weather.wea }}</div>
      </div>

      <div class="tem-range">
        <span>白天：{{ weather.tem_day }}°C</span>
        <span>夜间：{{ weather.tem_night }}°C</span>
      </div>
    </main>

    <footer class="weather-footer">
      <div class="footer-item">风向：{{ weather.win }}</div>
      <div class="footer-item">风力：{{ weather.win_speed }}</div>
      <div class="footer-item">风速：{{ weather.win_meter }}</div>
      <div class="footer-item">气压：{{ weather.pressure }} hPa</div>
      <div class="footer-item">湿度：{{ weather.humidity }}</div>
      <div class="footer-item">空气质量：{{ weather.air }}</div>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { getShequTreeData,getWeather } from '@/api/apiList.ts';
// 天气数据
const weather = reactive({
  // nums: 226,
  // cityid: "101120101",
  // city: "济南",
  // date: "2022-05-05",
  // week: "星期四",
  // update_time: "22:38",
  // wea: "多云",
  // wea_img: "yun",
  // tem: "25",
  // tem_day: "30",
  // tem_night: "23",
  // win: "南风",
  // win_speed: "3级",
  // win_meter: "19km/h",
  // air: "53",
  // pressure: "987",
  // humidity: "27%"
});

// 当前时间
const nowTime = ref("");

// 格式化时间函数
const formatTime = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
};

// 定时器
let timer = null;
onMounted(() => {
	getWeatherApi();
  nowTime.value = formatTime(new Date());
  timer = setInterval(() => {
    nowTime.value = formatTime(new Date());
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
// 获取天气图标
// 获取天气
const getWeatherApi = async () => {
  const cacheKey = "weather_cache";

  // 1. 先尝试读取缓存
  const cache = localStorage.getItem(cacheKey);
  if (cache) {
    try {
      const { date, data } = JSON.parse(cache);

      // 判断日期是否一致（只比对 yyyy-MM-dd）
      const today = formatDate(new Date());
      if (date === today) {
        console.log("使用缓存天气数据");
        Object.assign(weather, data);
        return;
      }
    } catch (e) {
      console.warn("缓存解析失败，忽略", e);
    }
  }

  // 2. 如果没有缓存或过期，就请求接口
  console.log("请求接口获取天气数据");
  const data = await getWeather();
  Object.assign(weather, data);

  // 3. 写入缓存
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      date: formatDate(new Date()),
      data
    })
  );
};

// 工具函数：格式化日期为 yyyy-MM-dd
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 获取天气图标
const getWeaIcon = (icon) => {
  return `https://weather-icon.verydog.cn/svg/${icon}.svg`;
};
</script>

<style scoped>
.weather-card {
  position: absolute;
  top: 120px;   /* 距离屏幕上边 */
  left: 20px;  /* 距离屏幕左边 */
	z-index: 1111;
  width: 320px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #83283a, #da5c60);
  color: #fff;
  font-family: "Microsoft YaHei", sans-serif;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.weather-header {
  text-align: center;
  margin-bottom: 12px;
}
.city {
  font-size: 20px;
  font-weight: bold;
}
.date {
  font-size: 14px;
}
.now-time {
  font-size: 14px;
  margin-top: 2px;
}
.update {
  font-size: 12px;
  opacity: 0.8;
}
.weather-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}
.wea-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.wea-icon {
  width: 48px;
  height: 48px;
}
.tem {
  font-size: 32px;
  font-weight: bold;
}
.wea {
  font-size: 16px;
}
.tem-range {
  font-size: 14px;
  margin-top: 8px;
}
.weather-footer {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  font-size: 13px;
}
.footer-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px;
  border-radius: 6px;
}
</style>
