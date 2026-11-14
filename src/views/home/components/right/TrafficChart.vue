<template>
  <div class="traffic-chart-container" ref="chartDom"></div>
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
  const pedestrians = props.data?.pedestrians || [120, 80, 650, 4850, 3920, 3100, 4200, 1850];
  const vehicles = props.data?.vehicles || [60, 30, 240, 1680, 1120, 980, 1450, 620];

  const option: echarts.EChartsOption = {
    grid: {
      top: '22%',
      left: '3%',
      right: '4%',
      bottom: '6%',
      containLabel: true
    },
    legend: {
      data: ['人员人次', '车辆频次'],
      right: '2%',
      top: '0%',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8, 28, 54, 0.85)',
      borderColor: '#00f0ff',
      textStyle: { color: '#ffffff', fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: times,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.25)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '人次',
        nameTextStyle: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 9 },
        splitLine: { lineStyle: { color: 'rgba(0, 240, 255, 0.08)', type: 'dashed' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: 9 }
      },
      {
        type: 'value',
        name: '车次',
        nameTextStyle: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 9 },
        splitLine: { show: false },
        axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: 9 }
      }
    ],
    series: [
      {
        name: '人员人次',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: pedestrians,
        itemStyle: { color: '#00f0ff' },
        lineStyle: { width: 2, color: '#00f0ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 240, 255, 0.35)' },
            { offset: 1, color: 'rgba(0, 240, 255, 0.02)' }
          ])
        }
      },
      {
        name: '车辆频次',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        data: vehicles,
        itemStyle: { color: '#ffb800' },
        lineStyle: { width: 2, color: '#ffb800' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 184, 0, 0.35)' },
            { offset: 1, color: 'rgba(255, 184, 0, 0.02)' }
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
.traffic-chart-container {
  width: 100%;
  height: 110px;
}
</style>

