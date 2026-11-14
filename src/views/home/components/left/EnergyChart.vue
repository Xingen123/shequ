<template>
  <div class="energy-chart-container" ref="chartDom"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{
  data?: any;
}>();

const chartDom = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

const renderChart = () => {
  if (!chartDom.value) return;
  if (!myChart) {
    myChart = echarts.init(chartDom.value);
  }

  const times = props.data?.times || ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
  const values = props.data?.values || [1200, 950, 1580, 4820, 3960, 4650, 3120, 2400];

  const option: echarts.EChartsOption = {
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8, 28, 54, 0.85)',
      borderColor: '#00f0ff',
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: '{b}<br/>今日能耗: <b>{c}</b> kWh'
    },
    xAxis: {
      type: 'category',
      data: times,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.25)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'kWh',
      nameTextStyle: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10, align: 'right' },
      splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.08)', type: 'dashed' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: 10 }
    },
    series: [
      {
        name: '能耗',
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        data: values,
        itemStyle: { color: '#00f0ff' },
        lineStyle: { width: 2.5, color: '#00f0ff', shadowColor: 'rgba(0, 240, 255, 0.8)', shadowBlur: 8 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 240, 255, 0.45)' },
            { offset: 1, color: 'rgba(0, 240, 255, 0.02)' }
          ])
        }
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

<style scoped>
.energy-chart-container {
  width: 100%;
  height: 110px;
}
</style>

