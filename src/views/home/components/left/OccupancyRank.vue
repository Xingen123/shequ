<template>
  <div class="occupancy-list">
    <div
      v-for="(item, index) in list"
      :key="item.name"
      class="rank-row"
      :class="{ active: selectedName === item.fullName }"
      @click="onSelect(item)"
    >
      <div class="row-header">
        <span class="rank-name">{{ item.name }}</span>
        <span class="rank-rate">{{ item.rate }}%</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{
            width: item.rate + '%',
            background: getGradient(index)
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  list?: any[];
  selectedName?: string;
}>();

const emit = defineEmits(['selectBuilding']);

const defaultList = [
  { name: '智造 D', fullName: '智造工坊 D栋', rate: 100 },
  { name: '研发 A', fullName: '研发中心 A栋', rate: 93.2 },
  { name: '公寓 F', fullName: '人才公寓 F栋', rate: 91.5 },
  { name: '公寓 G', fullName: '人才公寓 G栋', rate: 88.2 },
  { name: '孵化 B', fullName: '产业孵化 B栋', rate: 86.4 },
  { name: '总部 C', fullName: '总部大厦 C栋', rate: 78.5 },
  { name: '商业 H', fullName: '商业配套 H栋', rate: 72.6 },
  { name: '会展 E', fullName: '会展中心 E栋', rate: 64.8 }
];

const list = props.list && props.list.length ? props.list : defaultList;

const getGradient = (index: number) => {
  if (index === 0) return 'linear-gradient(90deg, #00C6FF, #0072FF)';
  if (index === 1) return 'linear-gradient(90deg, #00F0FF, #00A8FF)';
  if (index === 2) return 'linear-gradient(90deg, #00E5FF, #0091EA)';
  return 'linear-gradient(90deg, #00B0FF, #0288D1)';
};

const onSelect = (item: any) => {
  emit('selectBuilding', item.fullName);
};
</script>

<style lang="scss" scoped>
.occupancy-list {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .rank-row {
    padding: 2px 4px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover, &.active {
      background: rgba(0, 240, 255, 0.12);
      transform: translateX(2px);
    }

    .row-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;

      .rank-name {
        font-size: 11px;
        color: #d8ecff;
        font-weight: 500;
      }

      .rank-rate {
        font-size: 11px;
        font-family: 'Consolas', monospace;
        font-weight: bold;
        color: #00f0ff;
      }
    }

    .progress-track {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        border-radius: 3px;
        box-shadow: 0 0 6px rgba(0, 240, 255, 0.6);
        transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
  }
}
</style>

