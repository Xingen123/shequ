<template>
  <div class="alarm-list-container">
    <div
      v-for="item in items"
      :key="item.id"
      class="alarm-item"
      :class="item.level"
    >
      <div class="alarm-time">{{ item.time }}</div>
      <div class="alarm-content">
        <div class="alarm-loc">{{ item.location }}</div>
        <div class="alarm-desc">{{ item.title }}</div>
      </div>
      <div class="alarm-status-badge" :class="item.level">
        {{ item.status }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  list?: any[];
}>();

const defaultAlarms = [
  { id: 1, time: '11:26', location: 'D栋·外立面防雷', title: '设备在线自检良好，已巡检', level: 'info', status: '已巡检' },
  { id: 2, time: '11:07', location: 'C座·12F核心机房', title: '环境温度28.6℃，循环温控', level: 'warning', status: '温控中' },
  { id: 3, time: '10:48', location: '园区南主门闸机', title: '高峰车辆已引导有序通行', level: 'info', status: '通行畅' },
  { id: 4, time: '10:12', location: 'B区·B1地下车库', title: 'CO浓度实时达标，风机自维护', level: 'info', status: '自维护' }
];

const items = props.list && props.list.length ? props.list : defaultAlarms;
</script>

<style lang="scss" scoped>
.alarm-list-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 125px;
  overflow-y: auto;
  padding-right: 2px;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 240, 255, 0.3);
    border-radius: 2px;
  }

  .alarm-item {
    display: flex;
    align-items: center;
    background: rgba(7, 28, 56, 0.5);
    border-left: 2px solid #00f0ff;
    padding: 4px 6px;
    border-radius: 2px;
    gap: 8px;
    font-size: 11px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(7, 36, 72, 0.7);
    }

    &.warning {
      border-left-color: #ff9800;
    }

    &.danger {
      border-left-color: #ff5252;
    }

    .alarm-time {
      font-family: 'Consolas', monospace;
      color: #00f0ff;
      font-size: 10px;
      min-width: 32px;
    }

    .alarm-content {
      flex: 1;
      min-width: 0;

      .alarm-loc {
        color: #ffffff;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .alarm-desc {
        color: rgba(180, 210, 240, 0.65);
        font-size: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .alarm-status-badge {
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 2px;
      background: rgba(0, 240, 255, 0.15);
      color: #00f0ff;
      white-space: nowrap;

      &.warning {
        background: rgba(255, 152, 0, 0.15);
        color: #ff9800;
      }
    }
  }
}
</style>

