<template>
  <div class="screen-card" :class="{ 'card-glow': glow }">
    <!-- 四角科技装饰点缀 -->
    <div class="corner top-left"></div>
    <div class="corner top-right"></div>
    <div class="corner bottom-left"></div>
    <div class="corner bottom-right"></div>

    <!-- 卡片头部标题 -->
    <div class="card-header" v-if="title">
      <div class="header-left">
        <span class="header-icon-bar"></span>
        <span class="card-title">{{ title }}</span>
        <span class="card-subtitle" v-if="subTitle">{{ subTitle }}</span>
      </div>
      <div class="header-right">
        <slot name="extra"></slot>
      </div>
    </div>

    <!-- 卡片内容区域 -->
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  subTitle?: string;
  glow?: boolean;
}>();
</script>

<style lang="scss" scoped>
.screen-card {
  position: relative;
  background: rgba(8, 24, 48, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 240, 255, 0.22);
  box-shadow: inset 0 0 20px rgba(0, 160, 255, 0.08), 0 8px 24px rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;

  &.card-glow {
    border-color: rgba(0, 240, 255, 0.5);
    box-shadow: inset 0 0 25px rgba(0, 240, 255, 0.15), 0 0 15px rgba(0, 240, 255, 0.2);
  }

  // 四角科技折角高亮
  .corner {
    position: absolute;
    width: 8px;
    height: 8px;
    border-color: #00f0ff;
    pointer-events: none;
    z-index: 2;

    &.top-left {
      top: 0;
      left: 0;
      border-top: 2px solid #00f0ff;
      border-left: 2px solid #00f0ff;
    }
    &.top-right {
      top: 0;
      right: 0;
      border-top: 2px solid #00f0ff;
      border-right: 2px solid #00f0ff;
    }
    &.bottom-left {
      bottom: 0;
      left: 0;
      border-bottom: 2px solid #00f0ff;
      border-left: 2px solid #00f0ff;
    }
    &.bottom-right {
      bottom: 0;
      right: 0;
      border-bottom: 2px solid #00f0ff;
      border-right: 2px solid #00f0ff;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(0, 240, 255, 0.12);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #00f0ff, transparent);
    }

    .header-left {
      display: flex;
      align-items: baseline;
      gap: 8px;

      .header-icon-bar {
        display: inline-block;
        width: 3px;
        height: 14px;
        background: #00f0ff;
        box-shadow: 0 0 8px #00f0ff;
        border-radius: 1px;
        align-self: center;
      }

      .card-title {
        font-size: 15px;
        font-weight: 600;
        color: #e6f7ff;
        letter-spacing: 0.5px;
        text-shadow: 0 0 6px rgba(0, 240, 255, 0.4);
      }

      .card-subtitle {
        font-size: 11px;
        color: rgba(160, 207, 245, 0.55);
        font-family: 'Helvetica Neue', Arial, sans-serif;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }

    .header-right {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.65);
    }
  }

  .card-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>

