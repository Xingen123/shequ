<template>
  <div class="top-header-wrapper">
    <!-- 主标题横梁 -->
    <div class="header-main">
      <!-- 左侧：园区身份与安全状态 -->
      <div class="header-left">
        <div class="badge-item primary">
          <span class="pulse-dot"></span>
          <span class="badge-title">智慧产业园区</span>
        </div>
        <div class="badge-item sub">
          <span class="badge-val">8</span> <span class="badge-unit">栋楼宇</span>
          <span class="divider">|</span>
          <span class="badge-val">268</span> <span class="badge-unit">家企业</span>
          <span class="divider">|</span>
          <span class="badge-highlight">100分</span> <span class="badge-unit">安全运行</span>
        </div>
      </div>

      <!-- 中间：大屏主标题 -->
      <div class="header-center">
        <div class="title-wing left-wing"></div>
        <div class="title-content">
          <h1 class="main-title">智慧产业园区数字孪生</h1>
          <div class="title-sub">SMART INDUSTRIAL PARK DIGITAL TWIN PLATFORM</div>
        </div>
        <div class="title-wing right-wing"></div>
      </div>

      <!-- 右侧：实时时钟与气象 -->
      <div class="header-right">
        <div class="clock-box">
          <span class="clock-time">{{ currentTime }}</span>
          <div class="date-group">
            <span class="clock-date">{{ currentDate }} {{ currentWeek }}</span>
            <span class="weather-pill" v-if="weather.tem">
              {{ weather.city }} {{ weather.tem }}°C {{ weather.wea }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 头部副栏（面包屑导航与快捷统计标签） -->
    <div class="header-subbar">
      <div class="subbar-left">
        <span class="view-tag">智慧产业园区 · 全域视图</span>
        <span class="hint-tag">
          <span class="hint-dot"></span>
          点击三维场景中的楼宇可展开楼层分体，双击可聚焦视角
        </span>
      </div>
      <div class="subbar-right">
        <div class="kpi-capsule">
          <span class="kpi-lbl">楼宇</span>
          <span class="kpi-num">{{ overview.buildingCount || 8 }}<span class="unit">栋</span></span>
        </div>
        <div class="kpi-capsule">
          <span class="kpi-lbl">企业</span>
          <span class="kpi-num">{{ overview.enterprises || 268 }}<span class="unit">家</span></span>
        </div>
        <div class="kpi-capsule">
          <span class="kpi-lbl">入驻率</span>
          <span class="kpi-num">{{ overview.occupancyRate || '87.6%' }}</span>
        </div>
        <div class="kpi-capsule">
          <span class="kpi-lbl">在岗</span>
          <span class="kpi-num">{{ overview.activeStaff || '6,840' }}<span class="unit">人</span></span>
        </div>
        <div class="kpi-capsule">
          <span class="kpi-lbl">今日能耗</span>
          <span class="kpi-num">32.6<span class="unit">t 标煤</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  overview?: any;
  weather?: any;
}>();

const currentTime = ref('');
const currentDate = ref('');
const currentWeek = ref('');

const updateClock = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${h}:${m}:${s}`;

  const y = now.getFullYear();
  const mon = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  currentDate.value = `${y}年${mon}月${d}日`;

  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  currentWeek.value = weeks[now.getDay()];
};

let timer: any = null;
onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.top-header-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  pointer-events: none; // 允许鼠标穿透到底层三维，子交互元素设 pointer-events: auto

  .header-main {
    position: relative;
    height: 72px;
    background: linear-gradient(180deg, rgba(6, 17, 33, 0.95) 0%, rgba(8, 22, 44, 0.75) 75%, transparent 100%);
    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;

    // 头部底部炫光线条
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 10%;
      right: 10%;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.8), transparent);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
    }
  }

  .header-left {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 320px;

    .badge-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(0, 240, 255, 0.08);
      border: 1px solid rgba(0, 240, 255, 0.25);
      font-size: 13px;
      color: #bce5ff;

      &.primary {
        background: linear-gradient(90deg, rgba(0, 240, 255, 0.2), rgba(0, 150, 255, 0.1));
        border-color: rgba(0, 240, 255, 0.45);
        font-weight: 600;
        color: #ffffff;
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #00f0ff;
        border-radius: 50%;
        box-shadow: 0 0 8px #00f0ff;
        animation: pulseAnim 1.8s infinite;
      }

      .badge-val {
        color: #00f0ff;
        font-weight: bold;
        font-size: 14px;
      }

      .badge-unit {
        color: rgba(255, 255, 255, 0.65);
        font-size: 11px;
      }

      .badge-highlight {
        color: #38ef7d;
        font-weight: bold;
      }

      .divider {
        color: rgba(255, 255, 255, 0.25);
      }
    }
  }

  .header-center {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    pointer-events: auto;

    .title-content {
      text-align: center;
      padding: 0 28px;

      .main-title {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 4px;
        background: linear-gradient(180deg, #ffffff 30%, #76d7ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
      }

      .title-sub {
        font-size: 10px;
        letter-spacing: 2px;
        color: rgba(0, 240, 255, 0.7);
        font-family: Arial, sans-serif;
        margin-top: -2px;
      }
    }

    .title-wing {
      width: 70px;
      height: 12px;
      border-bottom: 2px solid #00f0ff;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        width: 6px;
        height: 6px;
        background: #00f0ff;
        box-shadow: 0 0 8px #00f0ff;
      }

      &.left-wing {
        border-left: 2px solid #00f0ff;
        transform: skewX(-45deg);
        &::after { left: -3px; }
      }

      &.right-wing {
        border-right: 2px solid #00f0ff;
        transform: skewX(45deg);
        &::after { right: -3px; }
      }
    }
  }

  .header-right {
    pointer-events: auto;
    width: 320px;
    display: flex;
    justify-content: flex-end;

    .clock-box {
      text-align: right;

      .clock-time {
        font-size: 22px;
        font-family: 'Consolas', 'Courier New', monospace;
        font-weight: 700;
        color: #00f0ff;
        letter-spacing: 1px;
        text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
      }

      .date-group {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        color: rgba(220, 240, 255, 0.75);

        .weather-pill {
          background: rgba(0, 240, 255, 0.12);
          padding: 1px 6px;
          border-radius: 3px;
          color: #a4e5ff;
        }
      }
    }
  }

  // 头部副栏（全域视图面包屑与快捷指标标签）
  .header-subbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 24px;
    background: rgba(4, 14, 28, 0.5);
    backdrop-filter: blur(6px);
    border-bottom: 1px solid rgba(0, 240, 255, 0.1);

    .subbar-left {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 16px;

      .view-tag {
        font-size: 13px;
        font-weight: 600;
        color: #ffffff;
        background: rgba(0, 240, 255, 0.15);
        border: 1px solid rgba(0, 240, 255, 0.3);
        padding: 2px 10px;
        border-radius: 3px;
      }

      .hint-tag {
        font-size: 12px;
        color: rgba(180, 220, 255, 0.75);
        display: flex;
        align-items: center;
        gap: 6px;

        .hint-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38ef7d;
          box-shadow: 0 0 6px #38ef7d;
        }
      }
    }

    .subbar-right {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;

      .kpi-capsule {
        background: rgba(8, 28, 54, 0.75);
        border: 1px solid rgba(0, 240, 255, 0.2);
        border-radius: 3px;
        padding: 2px 10px;
        display: flex;
        align-items: center;
        gap: 6px;

        .kpi-lbl {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
        }

        .kpi-num {
          font-size: 13px;
          font-weight: bold;
          color: #00f0ff;

          .unit {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            font-weight: normal;
            margin-left: 2px;
          }
        }
      }
    }
  }
}

@keyframes pulseAnim {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}
</style>

