<template>
  <div class="space-mix-wrapper">
    <!-- 左侧环形图 -->
    <div class="donut-chart" ref="chartDom"></div>

    <!-- 右侧图例与数值 -->
    <div class="legend-list">
      <div
        v-for="item in items"
        :key="item.name"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: item.color }"></span>
        <span class="legend-name">{{ item.name }}</span>
        <span class="legend-val">{{ item.percent }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{
  data?: any;
}>();

const chartDom = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

const defaultItems = [
  { name: '研发办公', value: 28.7, percent: '42%', color: '#00E5FF' },
  { name: '智能制造', value: 17.8, percent: '26%', color: '#38EF7D' },
  { name: '人才公寓', value: 10.3, percent: '15%', color: '#FF9800' },
  { name: '商业配套', value: 6.8, percent: '10%', color: '#E040FB' },
  { name: '会展展示', value: 4.8, percent: '7%', color: '#2979FF' }
];

const items = ref(defaultItems);

const renderChart = () => {
  if (!chartDom.value) return;
  if (!myChart) {
    myChart = echarts.init(chartDom.value);
  }

  if (props.data?.items && props.data.items.length) {
    items.value = props.data.items;
  }

  const totalArea = props.data?.totalArea || '68.4';

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(8, 28, 54, 0.9)',
      borderColor: '#00f0ff',
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: '{b}: <b>{c}</b> 万㎡ ({d}%)'
    },
    title: {
      text: totalArea,
      subtext: '万㎡ 总面积',
      left: 'center',
      top: '32%',
      textStyle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'DIN Alternate, sans-serif'
      },
      subtextStyle: {
        color: 'rgba(180, 220, 255, 0.65)',
        fontSize: 10
      }
    },
    series: [
      {
        name: '业态占比',
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 5
        },
        data: items.value.map(i => ({
          name: i.name,
          value: i.value,
          itemStyle: { color: i.color }
        }))
      }
    ]
  };

  myChart.setOption(option);
};

const handleResize = () => {
  myChart?.resize();
};

watch(() => props.data, () => {
  renderChart();
}, { deep: true });

onMounted(() => {
  renderChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
});
</script>

<style lang="scss" scoped>
.space-mix-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 120px;

  .donut-chart {
    flex: 1;
    height: 100%;
    min-width: 120px;
  }

  .legend-list {
    width: 130px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 6px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;

      .legend-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      .legend-name {
        color: rgba(220, 235, 250, 0.8);
        flex: 1;
      }

      .legend-val {
        color: #00f0ff;
        font-family: 'Consolas', monospace;
        font-weight: 500;
      }
    }
  }
}
</style>

