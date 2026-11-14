<template>
  <div class="smart-park-container">
    <!-- 1. 顶部科技 Header 横梁 -->
    <TopHeader :overview="overviewData" :weather="weatherData" />

    <!-- 2. 中间 Cesium 3D 数字孪生底座 -->
    <div class="cesium-viewport">
      <vc-viewer
        fullscreenElement="app"
        :info-box="false"
        ref="vcViewer"
        :log="false"
        :skyBox="false"
        :requestRenderMode="true"
        :skyAtmosphere="false"
        :should-animate="true"
        :show-credit="false"
        @ready="onViewerReady"
      >
        <vc-layer-imagery :alpha="1" :brightness="1" :contrast="1" :sort-order="10">
          <vc-imagery-provider-amap
            map-style="7"
            ltype="0"
            :projection-transforms="{
              from: 'GCJ02',
              to: 'WGS84'
            }"
            :minimumLevel="0"
            :maximumLevel="18"
            ref="provider"
          ></vc-imagery-provider-amap>
        </vc-layer-imagery>
      </vc-viewer>
    </div>

    <!-- 3. 左侧面板（4个科技卡片） -->
    <transition name="slide-left">
      <div class="side-panel left-panel" v-show="showPanels">
        <!-- 园区总览 -->
        <ScreenCard title="园区总览" subTitle="OVERVIEW">
          <OverviewCard :data="overviewData" />
        </ScreenCard>

        <!-- 今日能耗趋势 -->
        <ScreenCard title="今日能耗趋势" subTitle="ENERGY">
          <EnergyChart :data="energyData" />
        </ScreenCard>

        <!-- 楼宇入驻率排名 -->
        <ScreenCard title="楼宇入驻率排名" subTitle="OCCUPANCY">
          <OccupancyRank
            :list="occupancyList"
            :selectedName="selectedBuildingName"
            @selectBuilding="handleSelectBuildingByName"
          />
        </ScreenCard>

        <!-- 安防告警 -->
        <ScreenCard title="安防告警" subTitle="ALARM">
          <AlarmList :list="alarmList" />
        </ScreenCard>
      </div>
    </transition>

    <!-- 4. 右侧面板（3个科技卡片） -->
    <transition name="slide-right">
      <div class="side-panel right-panel" v-show="showPanels">
        <!-- 空间业态占比 -->
        <ScreenCard title="空间业态占比" subTitle="SPACE MIX">
          <SpaceMixChart :data="spaceMixData" />
        </ScreenCard>

        <!-- 楼层分层信息 -->
        <ScreenCard title="楼层分层信息" subTitle="FLOOR BY FLOOR" glow>
          <FloorDetailCard
            :building="currentFloorBuilding"
            @selectBuilding="handleSelectBuildingByName"
            @resetBuilding="resetSelectedBuilding"
          />
        </ScreenCard>

        <!-- 客流与车位 -->
        <ScreenCard title="客流与车位" subTitle="TRAFFIC">
          <TrafficChart :data="trafficData" />
        </ScreenCard>
      </div>
    </transition>

    <!-- 5. 底部居中操作指示条与浮动控制 -->
    <div class="center-bottom-bar">
      <div class="interactive-pill">
        <span class="dot"></span>
        <span class="txt">点击三维场景中的楼宇可展开楼层分体 | 鼠标拖拽旋转 · 滚轮缩放 · 双击聚焦</span>
      </div>

      <div class="dock-actions">
        <button class="dock-btn" :class="{ active: showTreeBox }" @click="showTreeBox = !showTreeBox">
          <span class="icon">📑</span> 楼宇目录
        </button>
        <button class="dock-btn" :class="{ active: isTableOpen }" @click="toggleTable">
          <span class="icon">📊</span> 资产台账
        </button>
        <button class="dock-btn" :class="{ active: !showPanels }" @click="showPanels = !showPanels">
          <span class="icon">{{ showPanels ? '🔭' : '🖥️' }}</span> {{ showPanels ? '全屏漫游' : '还原面板' }}
        </button>
        <button class="dock-btn reset" @click="resetCamera">
          <span class="icon">🎯</span> 复位全景
        </button>
      </div>
    </div>

    <!-- 6. 树形检索抽屉（隐藏/展开） -->
    <div v-show="showTreeBox">
      <CesiumTree
        ref="treeRef"
        v-if="showTree"
        @onChange="onCheckedChange"
        @clickTarget="clickTarget"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TopHeader from './components/top/TopHeader.vue';
import ScreenCard from '@/components/common/ScreenCard.vue';
import OverviewCard from './components/left/OverviewCard.vue';
import EnergyChart from './components/left/EnergyChart.vue';
import OccupancyRank from './components/left/OccupancyRank.vue';
import AlarmList from './components/left/AlarmList.vue';
import SpaceMixChart from './components/right/SpaceMixChart.vue';
import FloorDetailCard from './components/right/FloorDetailCard.vue';
import TrafficChart from './components/right/TrafficChart.vue';
import CesiumTree from './components/center/tree.vue';

import {
  getParkOverview,
  getParkEnergy,
  getParkOccupancy,
  getParkAlarms,
  getParkSpaceMix,
  getParkTraffic,
  getBuildingFloors,
  getWeather
} from '@/api/apiList';

// ---------------- 界面响应式数据 ----------------
const overviewData = ref<any>({});
const energyData = ref<any>({});
const occupancyList = ref<any[]>([]);
const alarmList = ref<any[]>([]);
const spaceMixData = ref<any>({});
const trafficData = ref<any>({});
const weatherData = ref<any>({});

const currentFloorBuilding = ref<any>(null);
const selectedBuildingName = ref<string>('');

const showPanels = ref(true);
const showTreeBox = ref(false);
const showTree = ref(false);
const treeRef = ref<any>(null);
const isTableOpen = ref(false);

// ---------------- Cesium 场景状态 ----------------
let _viewer: any = null;
let CesiumModule: any = null;
let highlightedModel: any = null;
let originalColor: any = null;

const polygonMap = new Map();
const modelMap = new Map();
const labelMap = new Map();
let parkCenterPosition: any = null;

// 初始化拉取本地后台所有指标数据
const loadDashboardData = async () => {
  try {
    const [ov, en, occ, al, sp, tr, we] = await Promise.all([
      getParkOverview().catch(() => ({})),
      getParkEnergy().catch(() => ({})),
      getParkOccupancy().catch(() => ([])),
      getParkAlarms().catch(() => ([])),
      getParkSpaceMix().catch(() => ({})),
      getParkTraffic().catch(() => ({})),
      getWeather().catch(() => ({}))
    ]);

    overviewData.value = ov || {};
    energyData.value = en || {};
    occupancyList.value = Array.isArray(occ) ? occ : [];
    alarmList.value = Array.isArray(al) ? al : [];
    spaceMixData.value = sp || {};
    trafficData.value = tr || {};
    weatherData.value = we || {};
  } catch (e) {
    console.error('加载大屏数据异常:', e);
  }
};

// 展开/收起数据资产表格
const toggleTable = () => {
  if (treeRef.value?.toggleTable) {
    treeRef.value.toggleTable();
    isTableOpen.value = !isTableOpen.value;
  }
};

// 选定某楼栋（从排行榜或三维点击）
const handleSelectBuildingByName = async (fullName: string) => {
  selectedBuildingName.value = fullName;

  // 1. 获取该楼宇逐层详情
  try {
    const floorInfo = await getBuildingFloors(fullName);
    currentFloorBuilding.value = {
      name: fullName,
      ...floorInfo
    };
  } catch {
    currentFloorBuilding.value = { name: fullName };
  }

  // 2. 联动场景相机飞向对应楼栋
  if (_viewer) {
    for (let [, val] of modelMap) {
      if (val.node && val.node.title.includes(fullName.replace('栋', '')) || fullName.includes(val.node.title)) {
        flyToNode(val.node);
        highlightSelectedModel(val.model);
        break;
      }
    }
  }
};

// 重置选中楼宇
const resetSelectedBuilding = () => {
  currentFloorBuilding.value = null;
  selectedBuildingName.value = '';
  if (highlightedModel && originalColor) {
    highlightedModel.color = originalColor;
    highlightedModel = null;
  }
  resetCamera();
};

// 高亮三维模型
const highlightSelectedModel = (model: any) => {
  if (!model || !CesiumModule) return;
  if (highlightedModel && highlightedModel !== model) {
    highlightedModel.color = originalColor;
  }
  highlightedModel = model;
  model.color = CesiumModule.Color.fromCssColorString('#00F0FF').withAlpha(0.95);
};

// 复位全景视角
const resetCamera = () => {
  if (!_viewer || !parkCenterPosition) return;
  _viewer.camera.flyTo({
    destination: CesiumModule.Cartesian3.fromDegrees(
      parkCenterPosition[0],
      parkCenterPosition[1] - 0.0035,
      620
    ),
    orientation: {
      heading: CesiumModule.Math.toRadians(0),
      pitch: CesiumModule.Math.toRadians(-35),
      roll: 0
    },
    duration: 1.8
  });
};

// Cesium 视口加载完成回调
const onViewerReady = ({ viewer, Cesium }: any) => {
  _viewer = viewer;
  CesiumModule = Cesium;
  showTree.value = true;
  originalColor = Cesium.Color.WHITE;

  // 开启场景光照
  viewer.scene.globe.enableLighting = true;
  if (viewer.scene.globe) {
    viewer.scene.globe.depthTestAgainstTerrain = false;
  }

  // 去除双击默认事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );

  addClickHandler();
};

// 树节点变动渲染三维要素
const onCheckedChange = (nodes: any[]) => {
  if (!nodes || !nodes.length) return;
  traverseAndRender(nodes);
};

function traverseAndRender(nodes: any[]) {
  if (!_viewer || !CesiumModule) return;
  polygonMap.forEach((obj) => (obj.used = false));
  modelMap.forEach((obj) => (obj.used = false));
  labelMap.forEach((obj) => (obj.used = false));

  nodes.forEach((node, index) => {
    // 1. 社区/片区多边形边界
    if (node.type === 1 || node.type === 2) {
      if (node.position && node.position.length > 2) {
        if (!polygonMap.has(node.key)) {
          const polygon = _viewer.entities.add({
            id: node.key,
            polygon: {
              hierarchy: CesiumModule.Cartesian3.fromDegreesArray(node.position),
              material: CesiumModule.Color.fromCssColorString(node.type === 2 ? '#0072FF' : '#003B73').withAlpha(0.25),
              outline: true,
              outlineColor: CesiumModule.Color.fromCssColorString('#00F0FF'),
              outlineWidth: 2,
              extrudedHeight: node.type === 2 ? 1 : 0
            }
          });
          polygon._type = node.type;
          polygon._originalMaterial = polygon.polygon.material;

          const center = getPolygonCenter(node.position);
          if (center && index === 0) {
            parkCenterPosition = center;
            // 初始视角俯冲到园区上空
            _viewer.camera.setView({
              destination: CesiumModule.Cartesian3.fromDegrees(center[0], center[1] - 0.0035, 620),
              orientation: {
                heading: CesiumModule.Math.toRadians(0),
                pitch: CesiumModule.Math.toRadians(-35),
                roll: 0
              }
            });
          }

          polygonMap.set(node.key, { entity: polygon, node, used: true });
        } else {
          polygonMap.get(node.key).entity.show = true;
          polygonMap.get(node.key).used = true;
        }
      }
    }

    // 2. 楼栋三维模型与发光标牌
    if (node.type === 3) {
      const [lon, lat] = node.position;
      const height = 1;
      if (!modelMap.has(node.key)) {
        const lastPosition = CesiumModule.Cartesian3.fromDegrees(lon, lat, height);
        const model = CesiumModule.Model.fromGltf({
          url: node.glbUrl || './lou.glb',
          modelMatrix: CesiumModule.Transforms.eastNorthUpToFixedFrame(lastPosition),
          scale: 0.85
        });
        model.id = node.key;
        _viewer.scene.primitives.add(model);

        // 建筑发光标识
        const titleLabel = _viewer.entities.add({
          position: CesiumModule.Cartesian3.fromDegrees(lon, lat, height + 16),
          label: {
            text: node.title,
            font: '13px sans-serif',
            fillColor: CesiumModule.Color.WHITE,
            showBackground: true,
            backgroundPadding: new CesiumModule.Cartesian2(8, 4),
            backgroundColor: CesiumModule.Color.fromCssColorString('#04162e').withAlpha(0.85),
            outlineColor: CesiumModule.Color.fromCssColorString('#00F0FF'),
            outlineWidth: 1,
            distanceDisplayCondition: new CesiumModule.DistanceDisplayCondition(0, 80000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });

        modelMap.set(node.key, { model, node, used: true });
        labelMap.set(node.key, { entity: titleLabel, used: true });
      } else {
        const existing = modelMap.get(node.key);
        existing.model.show = true;
        existing.used = true;

        const lbl = labelMap.get(node.key);
        if (lbl) {
          lbl.entity.show = true;
          lbl.used = true;
        }
      }
    }
  });

  // 隐藏未用对象
  polygonMap.forEach((obj) => { if (!obj.used) obj.entity.show = false; });
  modelMap.forEach((obj) => { if (!obj.used) obj.model.show = false; });
  labelMap.forEach((obj) => { if (!obj.used) obj.entity.show = false; });
}

function getPolygonCenter(coords: number[]) {
  if (!coords || coords.length < 2) return null;
  let lonSum = 0, latSum = 0;
  let count = coords.length / 2;
  for (let i = 0; i < coords.length; i += 2) {
    lonSum += coords[i];
    latSum += coords[i + 1];
  }
  return [lonSum / count, latSum / count];
}

function flyToNode(node: any) {
  if (!node || !_viewer) return;
  const labelObj = labelMap.get(node.key);
  if (labelObj && labelObj.entity) {
    _viewer.flyTo(labelObj.entity, {
      duration: 1.5,
      offset: new CesiumModule.HeadingPitchRange(
        CesiumModule.Math.toRadians(0),
        CesiumModule.Math.toRadians(-28),
        360
      )
    });
  } else if (node.position && node.position.length >= 2) {
    _viewer.camera.flyTo({
      destination: CesiumModule.Cartesian3.fromDegrees(node.position[0], node.position[1] - 0.002, 360),
      orientation: {
        heading: CesiumModule.Math.toRadians(0),
        pitch: CesiumModule.Math.toRadians(-28),
        roll: 0
      },
      duration: 1.5
    });
  }
}

// 点击目录中的具体楼栋
function clickTarget(node: any) {
  if (!node) return;
  flyToNode(node);
  handleSelectBuildingByName(node.title);
}

// 三维场景交互点击事件监听
function addClickHandler() {
  const handler = new CesiumModule.ScreenSpaceEventHandler(_viewer.scene.canvas);

  handler.setInputAction((movement: any) => {
    const picked = _viewer.scene.pick(movement.position);

    if (CesiumModule.defined(picked) && picked.primitive instanceof CesiumModule.Model) {
      const model = picked.primitive;
      let matchedNode: any = null;

      for (let [, val] of modelMap) {
        if (val.model === model) {
          matchedNode = val.node;
          break;
        }
      }

      if (matchedNode) {
        handleSelectBuildingByName(matchedNode.title);
      }
    }
  }, CesiumModule.ScreenSpaceEventType.LEFT_CLICK);
}

onMounted(() => {
  loadDashboardData();
});
</script>

<style lang="scss" scoped>
.smart-park-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #040c1a;
  background-image: 
    radial-gradient(circle at 50% 30%, rgba(0, 114, 255, 0.12) 0%, transparent 65%),
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #ffffff;

  // 三维视口铺满底层
  .cesium-viewport {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  // 左右两侧科技面板列
  .side-panel {
    position: absolute;
    top: 116px;
    bottom: 24px;
    width: 325px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: auto;

    &.left-panel {
      left: 20px;
    }

    &.right-panel {
      right: 20px;
    }
  }

  // 底部控制与提示条
  .center-bottom-bar {
    position: absolute;
    bottom: 16px;
    left: 360px;
    right: 360px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;

    .interactive-pill {
      pointer-events: auto;
      background: rgba(4, 18, 38, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 240, 255, 0.3);
      padding: 4px 16px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);

      .dot {
        width: 6px;
        height: 6px;
        background: #00f0ff;
        border-radius: 50%;
        box-shadow: 0 0 6px #00f0ff;
      }

      .txt {
        font-size: 11px;
        color: rgba(200, 230, 255, 0.85);
        letter-spacing: 0.5px;
      }
    }

    .dock-actions {
      pointer-events: auto;
      display: flex;
      gap: 8px;

      .dock-btn {
        background: rgba(6, 24, 52, 0.8);
        border: 1px solid rgba(0, 240, 255, 0.25);
        color: #d0e8ff;
        font-size: 11px;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.2s ease;

        &:hover, &.active {
          background: rgba(0, 240, 255, 0.2);
          border-color: #00f0ff;
          color: #00f0ff;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.35);
        }

        &.reset {
          border-color: rgba(56, 239, 125, 0.4);
          &:hover {
            color: #38ef7d;
            border-color: #38ef7d;
          }
        }
      }
    }
  }

  // 左右面板滑入滑出过渡动画
  .slide-left-enter-active, .slide-left-leave-active,
  .slide-right-enter-active, .slide-right-leave-active {
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .slide-left-enter-from, .slide-left-leave-to {
    transform: translateX(-340px);
    opacity: 0;
  }

  .slide-right-enter-from, .slide-right-leave-to {
    transform: translateX(340px);
    opacity: 0;
  }
}
</style>
