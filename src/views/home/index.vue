<template>
	<div class="es-center">
    <!-- <Headers v-show="showTreeBox"></Headers> -->
     <div class="button-panel">
         <img   v-show="activeLou?.model?.show" src="../../assets/img/lou1.png" @click="showModalLou"/>
         <img v-show="!activeLou?.model?.show"  src="../../assets/img/lou.png"  @click="showModalLou"/>
          <img   v-show="lcLayerEntity?.show" src="../../assets/img/louceng1.png" @click="showModalLouCeng"/>
          <img v-show="!lcLayerEntity?.show"  src="../../assets/img/louceng.png"  @click="showModalLouCeng"/>
      </div>
    <div class="header">
      {{activeShequ}}
    </div>
      <a-button class="toggle-btn" @click="toggleTree">
          {{ showTreeBox ? '隐藏' : '显示' }}
      </a-button>
      <div v-show="showTreeBox">
        <CesiumTree
          v-if="showTree"
          @onChange="onCheckedChange"
          @clickTarget="clickTarget"
        />
      </div>
       <a-modal center v-model:open="open" title="查看楼层" @ok="handleOk" >
        <div style="width:100%;display:flex; justify-content:center;">
          <a-input-number
            v-model:value="loucengNum"
            :min="1"
            :max="maxNum"
            :default-value="1"
            addon-after="层"
          />
        </div>
         <template #footer>
          <div style="width:100%;display:flex; justify-content:center;">
            <a-button  @click="open = !open">关闭</a-button>
            <a-button  type="primary"  @click="handleOk">查看</a-button>
          </div>
        </template>
      </a-modal>
     
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
	 <!-- <vc-navigation ref="navigation" :offset="[55, 35]"></vc-navigation> -->
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
</template>

<script setup lang='ts'>
  // import Headers from '@/components/header/index.vue'
	import CesiumTree from './components/center/tree.vue'
  import { onMounted,ref } from 'vue'
  import SingleBuildingRuler from './components/center/SingleBuildingRuler'
  // import { height } from '@/utils/useResize';
  import { getFloorInfo } from '@/api/apiList.ts';
	let _viewer = null
	let highlightedModel = null; // 保存高亮中的模型
  let originalColor = null; // 默认颜色

  let singleRuler = null //刻度尺
  let titleLabelList = []
  const positions = []; // 存储经纬度数组
  // xy轴
  let xyEntitys = []
  // 全局存储
  let lcLayerEntity = ref(null);
  let lcPointsEntity =  new Map();

  let highlightedPolygon: any = null;
  const showTreeBox = ref(false)
  const activeShequ = ref('')
  // key 就是 node.key
  const polygonMap = new Map();
  const modelMap = new Map();
  const labelMap = new Map();
  const clickLabelMap = new Map();
  // 选中的楼
  const activeLou = ref(null)

	const showTree = ref(false)
  // 楼层弹窗
  const open = ref(false);
  const loucengNum = ref(1)
  const maxNum = ref(100)
  
  const showModalLou = () => {
     activeLou.value.model.show = !activeLou.value.model.show 
     lcLayerEntity.value.show = false
     lcPointsEntity.forEach(item=>{
      item.point.show = false
     })
  };
  const showModalLouCeng = () => {
    lcLayerEntity.value.show = !lcLayerEntity.value.show
    activeLou.value.model.show = false
     lcPointsEntity.forEach(item=>{
      item.point.show = !item.point.show
     })
  };
  const showModal = () => {
    open.value = true;
    console.log(`output->`,activeLou.value)
  // maxNum.value = floors&& floors.length ||  1

  };
  const handleOk = (e: MouseEvent) => {
    open.value = false;
    activeLou.value.model.show = false
    if(loucengNum.value){
      drawFloorPlan()
    }
    if(!activeLou.value.node) return 
    // let louLabelEntity = labelMap.get(activeLou.value.node.key)
    let louClickLabelEntity = clickLabelMap.get(activeLou.value.node.key)
    // louLabelEntity.entity.show = false
    louClickLabelEntity.show = false
    // console.log(`output->`, activeLou.value)

  };
	const onViewerReady = ({viewer,Cesium}) =>{
		_viewer = viewer
		showTree.value = true
    viewer.scene.globe.enableLighting = true; // 开启光照
		addClickHandler()
   singleRuler = new SingleBuildingRuler(_viewer);

    originalColor = Cesium.Color.WHITE; // 默认颜色
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
	}
	const onCheckedChange = (data) => {
		traverseAndRender(data)
	}
function traverseAndRender(nodes) {
  // 先把所有已绘制对象标记为未使用
  polygonMap.forEach((obj) => (obj.used = false));
  modelMap.forEach((obj) => (obj.used = false));
  labelMap.forEach((obj) => (obj.used = false));
  activeShequ.value = nodes[0].title 
  nodes.forEach((node,index) => {
    // === 社区/小区 ===
    // type 1社区2小区3 楼栋
    if (node.type === 1 || node.type === 2) {
      if (node.position && node.position.length > 2) {
        if (!polygonMap.has(node.key)) {
          // 没有绘制过 → 新建
         const polygon = _viewer.entities.add({
            id: node.key,  // 或 model.id
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(node.position),
              material: Cesium.Color.fromCssColorString(node.type== 2 ? "#A77746" : '#88a9bc'),
              outline: false,
              // outlineColor: Cesium.Color.YELLOW,
              // outlineWidth: 2,
              extrudedHeight: node.type == 2 ? 1 : 0  
            },
          });
          polygon._type = node.type
          // 保存原始材质
          polygon._originalMaterial = polygon.polygon.material;
          const [centerLon, centerLat] = getPolygonCenter(node.position);
          const labelEntity = _viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 10),
            label: {
              text: node.type === 1 ? '' : node.title,
              font: "24px sans-serif",
              fillColor: Cesium.Color.WHITE,
              showBackground: true,
              // 🔹 背景边距
              backgroundPadding: new Cesium.Cartesian2(8, 4), // 左右 8px，上下 4px
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER, 
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              backgroundColor: Cesium.Color.RED.withAlpha(1),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 80000),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          });
          if(index == 0){
            _viewer.flyTo(labelEntity, {
              duration: 2, // 飞行时间
              offset: new Cesium.HeadingPitchRange(
                Cesium.Math.toRadians(0),   // 朝向
                Cesium.Math.toRadians(-20), // 俯角
                700                         // 距离 entity 的相机距离
              )
            });
          }
          polygonMap.set(node.key, { entity: polygon,node, used: true });
          labelMap.set(node.key, { entity: labelEntity, used: true });
        } else {
          // 已存在 → 显示并标记为已用
          polygonMap.get(node.key).entity.show = true;
          polygonMap.get(node.key).used = true;

          const lbl = labelMap.get(node.key);
          if (lbl) {
            lbl.entity.show = true;
            lbl.used = true;
          }
        }
      }
    }
    // === 楼栋 ===
    if (node.type === 3) {
  const [lon, lat] = node.position;
  const height = 1;
  if (!modelMap.has(node.key)) {
    // 新建 model
    const lastPosition = Cesium.Cartesian3.fromDegrees(lon, lat, height);
    const model = Cesium.Model.fromGltf({
      url: node.glbUrl || "./lou.glb",
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(lastPosition),
      scale: 0.8,
    });
    model.id = node.key;
    // 添加到场景
    _viewer.scene.primitives.add(model);
    // 标签
    const titleLabel = _viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, height + 10),
      label: {
        text: node.title,
        font: "14px sans-serif",
        fillColor: Cesium.Color.WHITE,
        showBackground: true,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        backgroundColor: Cesium.Color.fromCssColorString("#5475ba"),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 80000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    modelMap.set(node.key, { model, node, used: true });
    labelMap.set(node.key, { entity: titleLabel, used: true });
  } else {
    // 已存在 → 显示
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

  // 🔹 遍历 Map，把未使用的隐藏
  polygonMap.forEach((obj) => {
    if (!obj.used) obj.entity.show = false;
  });
  modelMap.forEach((obj) => {
    if (!obj.used) obj.model.show = false;
  });
  labelMap.forEach((obj) => {
    if (!obj.used) obj.entity.show = false;
  });
}

// 工具方法：计算多边形中心点 (简化版，取平均)
function getPolygonCenter(coords) {
  if (!coords || coords.length < 2) return null;

  let lonSum = 0, latSum = 0;
  let count = coords.length / 2;

  for (let i = 0; i < coords.length; i += 2) {
    lonSum += coords[i];
    latSum += coords[i + 1];
  }

  return [lonSum / count, latSum / count]; // [lon, lat]
}


function flyToNode(node) {
  if (!node) return;
    const {entity} = labelMap.get(node.key);
    _viewer.flyTo(entity, {
      duration: 2, // 飞行时间
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),   // 朝向
        Cesium.Math.toRadians(-30), // 俯角
        100                         // 距离 entity 的相机距离
      )
    });
}




// Tree 点击触发
function clickTarget(node) {

  // console.log(`output->`,node)
  if (!_viewer || !node.position.length) return;
  // 查找对应模型
  let targetModel = null;
  _viewer.scene.primitives._primitives.forEach(primitive => {
    if (primitive instanceof Cesium.Model && primitive.id === node.key) {
      targetModel = primitive;
    }
  });
  flyToNode(node)
  // addOrUpdateLabelById(node.key,node.type)
  // 高亮处理
  // if (highlightedModel) {
  //   highlightedModel.color = Cesium.Color.WHITE;
  // }
  // if (targetModel) {
  //   targetModel.color = Cesium.Color.YELLOW.withAlpha(0.9);
  //   highlightedModel = targetModel;
  // }
}
// 全局或模块内维护一个 Map

// 全局或模块内维护一个 Map
function addOrUpdateLabelById(id, type) {
  // 先清空楼层
  clearLcEntity()
  if (type == 1) return;
  let entity = type == 3 ? modelMap.get(id) : polygonMap.get(id);
  if (!entity || !entity.node) return;
  activeLou.value = entity
  let {node} = entity
  let { position, address } = node;
  let [lon, lat] = position;

  // 判断当前是否已存在
  if (clickLabelMap.has(id)) {
    const existing = clickLabelMap.get(id);
    // 如果当前是显示状态 → 点击后隐藏
    if (existing.show) {
      existing.show = false;
      return null;
    }
    // 如果当前是隐藏状态 → 点击后显示，并隐藏其他
    clickLabelMap.forEach((entity) => (entity.show = false));
    existing.show = true;
    return existing;
  }
  // 如果之前没有，就新建一个，并隐藏其他
  clickLabelMap.forEach((entity) => (entity.show = false));
  const labelEntity = _viewer.entities.add({
    id: `click-label-${id}`,
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 1),
    label: {
      text: address,
      font: "14px sans-serif",
      fillColor: Cesium.Color.BLACK,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      backgroundColor: Cesium.Color.YELLOW.withAlpha(1),
      showBackground: true,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 80000),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    show: true,
  });
  clickLabelMap.set(id, labelEntity);
  return labelEntity;
}

// 简单判断是否是移动端
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function addClickHandler() {
  const handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
// handler.setInputAction(function (click) {
//     // 将屏幕坐标转换为地理坐标
//     const cartesian = _viewer.camera.pickEllipsoid(click.position, _viewer.scene.globe.ellipsoid);
//     if (cartesian) {
//         // 转换为经纬度
//         const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//         const longitude = Cesium.Math.toDegrees(cartographic.longitude);
//         const latitude = Cesium.Math.toDegrees(cartographic.latitude);
//         // 存入数组
//         positions.push([longitude, latitude]);

//         console.log('点击点：', positions);
//     }
// }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction(function (movement) {
  const picked = _viewer.scene.pick(movement.position);
  if (!Cesium.defined(picked)) return;

  // 1. 先处理 point
  if (picked.id && picked.id.id && String(picked.id.id).startsWith("point-")) {
    const entity = picked.id;
    let {point,node} = lcPointsEntity.get(entity.id)
    if(point && node){
      // console.log(`output->`,node)
      point.label.text = (point.label.text == node.name && node.detali && node.detali.length > 0)  ? `${node.name}\n` + node.detali.map(d => `姓名：${d.user_name}, 电话：${d.user_phone}`).join('\n') : node.name
    }
    return; // 直接返回，阻止冒泡
  }

  // 2. 再处理模型
  if (picked.primitive instanceof Cesium.Model) {
    const model = picked.primitive;
    // console.log("点击模型:", model.id);
    if (!model.show) return;
    addOrUpdateLabelById(model.id, 3);
    if (isMobile()) return;

    if (highlightedModel === model) {
      highlightedModel.color = originalColor;
      highlightedModel = null;
      return;
    }
    if (highlightedModel) {
      highlightedModel.color = originalColor;
    }
    highlightedModel = model;
    highlightedModel.color = Cesium.Color.YELLOW.withAlpha(0.9);
    showModal && showModal();
    return; // 不再继续
  }

  // 3. 最后处理 Polygon
  if (picked.id && picked.id.polygon && !lcLayerEntity.value.show) {
    const entity = picked.id;
    if (entity._type == 1) return;

    addOrUpdateLabelById(entity.id, entity._type);
    if (isMobile()) return;

    // 清除上一个高亮
    if (highlightedPolygon && highlightedPolygon !== entity) {
      highlightedPolygon.polygon.material = highlightedPolygon._originalMaterial;
      highlightedPolygon = null;
    }

    // 点击同一个取消高亮
    if (highlightedPolygon === entity) {
      entity.polygon.material = entity._originalMaterial;
      highlightedPolygon = null;
      return;
    }

    // 设置高亮
    entity.polygon.material = new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW.withAlpha(0.5));
    highlightedPolygon = entity;
  }
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

}
function computeRectangleCorners(centerLon, centerLat, widthMeters, heightMeters) {
  const R = 6378137; // WGS84 地球半径
  // 一度纬度对应的米数大约
  const metersPerDegLat = 111320;
  // 一度经度对应的米数要乘 cos(lat)
  const metersPerDegLon = 111320 * Math.cos(centerLat * Math.PI / 180);

  const dLat = (heightMeters / 2) / metersPerDegLat;
  const dLon = (widthMeters / 2) / metersPerDegLon;

  return {
    topLeft: [centerLon - dLon, centerLat + dLat],
    topRight: [centerLon + dLon, centerLat + dLat],
    bottomRight: [centerLon + dLon, centerLat - dLat],
    bottomLeft: [centerLon - dLon, centerLat - dLat],
  };
}
// 转换偏移米到经纬度
function offsetToLonLat(center, offset) {
  const metersPerDegreeLat = 110540;
  const metersPerDegreeLon = 111320 * Math.cos(Cesium.Math.toRadians(center.lat));
  return [
    center.lon + offset.x / metersPerDegreeLon,
    center.lat + offset.y / metersPerDegreeLat
  ];
}
function addPolygon(key,width, size_height,corners) {
  // 清除旧的
  if (lcLayerEntity.value) {
    _viewer.entities.remove(lcLayerEntity.value);
  }
  if(xyEntitys.length){
     xyEntitys.forEach(item=>{
      _viewer.entities.remove(item);
    })
    xyEntitys = []
  }
  let lcentity = _viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        corners.topLeft[0], corners.topLeft[1],
        corners.topRight[0], corners.topRight[1],
        corners.bottomRight[0], corners.bottomRight[1],
        corners.bottomLeft[0], corners.bottomLeft[1],
      ]),
      material: Cesium.Color.fromCssColorString('#4d7fff').withAlpha(0.5),
      height: loucengNum.value * 3, // 高度 = 楼层数 * 每层高度
      disableDepthTestDistance:Number.POSITIVE_INFINITY,
    }
  });
   flyToNode({key})
   lcLayerEntity.value = lcentity
  
        // 假设 corners 是楼层四角经纬度
    const center = {
      lon: corners.bottomLeft[0],
      lat: corners.bottomLeft[1]
    };

// 楼层高度
const height = loucengNum.value * 3;
// X 轴 (红色) : 东方向
const xEnd = offsetToLonLat(center, { x: width, y: 0 });
// X 轴 (红色) : 东方向
 let xline = _viewer.entities.add({
  name:key,
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      center.lon, center.lat, height,
      xEnd[0], xEnd[1], height
    ]),
    width: 2,
    material: Cesium.Color.RED
  }
});

// Y 轴 (绿色) : 北方向
const yEnd = offsetToLonLat(center, { x: 0, y: size_height });
let yline = _viewer.entities.add({
  name:key,
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      center.lon, center.lat, height,
      yEnd[0], yEnd[1], height
    ]),
    width: 2,
    material: Cesium.Color.GREEN
  }
});

// 可选：添加文字标注
let xlabel =_viewer.entities.add({
  name:key,
  position: Cesium.Cartesian3.fromDegrees(xEnd[0], xEnd[1], height),
  label: {
    text: width + "米",
    fillColor: Cesium.Color.RED,
    font: "16px sans-serif",
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
  }
});

let ylabel = _viewer.entities.add({
  name:key,
  position: Cesium.Cartesian3.fromDegrees(yEnd[0], yEnd[1], height),
  label: {
    text: size_height + "米",
    fillColor: Cesium.Color.GREEN,
    font: "16px sans-serif",
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
  }
});
xyEntitys.push(xline,yline,xlabel,ylabel)
// console.log(`output->`,xyEntitys)
}
// 清空楼层
function clearLcEntity(){
  if(activeLou.value && activeLou.value.model){
    activeLou.value.model.show = true
  }
  _viewer.entities.remove(lcLayerEntity.value);
  lcPointsEntity.forEach(item=>{
     _viewer.entities.remove(item.point);
  })
  lcLayerEntity.value = null;
  lcPointsEntity = new Map()
}
function localToLonLat(center, offset) {
  const { lon, lat } = center; // 楼栋中心点
  const { x, y } = offset;     // 局部点位 (米)

  const metersPerDegreeLat = 110540; 
  const metersPerDegreeLon = 111320 * Math.cos(Cesium.Math.toRadians(lat));

  const newLon = lon + Number(x) / metersPerDegreeLon;
  const newLat = lat + Number(y) / metersPerDegreeLat;

  return [newLon, newLat];
}

// ✅ 遍历楼层 points 生成点位
function generateFloorPoints(center, points) {
  
  return points.map(p => {
    const [lon, lat] = localToLonLat(center, p.position);
    return {
      ...p,
      id: p.id,
      name: p.name,
      type: p.type,
      lon, 
      lat,
    };
  });
}
// 绘制楼层平面图函数
async function drawFloorPlan(node) {
  const {position,key,id} = activeLou.value.node
  const {floors,size_with,size_height,points} = await getFloorInfo({building_id:id})
  const [lon,lat] = position
  const COLORS = {
      1: Cesium.Color.fromCssColorString('#00ffa3'),
      2:  Cesium.Color.fromCssColorString('#ffd400'),
      3:   Cesium.Color.fromCssColorString('#ff4d4f')
  };
  const corners = computeRectangleCorners(lon, lat, Number(size_with), Number(size_height))
  /**
 * 相机飞到楼栋刻度尺上方并注视楼栋中心
 * @param {building1} id
 * @param {number} lon 楼栋中心经度
 * @param {number} lat 楼栋中心纬度
 * @param {number} baseHeight 楼底高度（米）
 * @param {number} floors 楼层数
 * @param {number} floorHeight 每层高度（米）
 */
  // 绘制楼1并飞过去
  singleRuler.drawRuler('building1', lon,lat, 0, floors.length,3, Number(size_with)/2);
  addPolygon(key,  Number(size_with), Number(size_height),corners)
   // 转换为 Cesium 点位
  const convertedPoints = generateFloorPoints({lon:corners.bottomLeft[0], lat:corners.bottomLeft[1]}, points)
  // ✅ 根据楼层号生成点位
  convertedPoints.forEach(p => {
    // console.log(`output->`,p)
   let lcPoint = _viewer.entities.add({
      id:'point-' + p.id,
      position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat, loucengNum.value * 3),
        point: {
          pixelSize: 16,
          color: COLORS[p.type].withAlpha(0.95),
          outlineColor: Cesium.Color.fromCssColorString('#0b1220'),
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: p.name,
          font: '14px Helvetica, sans-serif',       // 字体大小和类型
          fillColor: Cesium.Color.WHITE,            // 字体颜色
          outlineColor: Cesium.Color.BLACK,         // 字体描边颜色
          outlineWidth: 2,                           // 描边宽度
          backgroundColor: Cesium.Color.fromCssColorString('rgba(0,0,0,0.8)'), // 半透明背景
          showBackground: true,                      // 显示背景
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // 水平对齐
          verticalOrigin: Cesium.VerticalOrigin.TOP,      // 垂直对齐
          pixelOffset: new Cesium.Cartesian2(10, -10),   // 偏移，避免遮挡点位
          // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 紧贴地面
          disableDepthTestDistance: Number.POSITIVE_INFINITY,       // 永远显示在最上层
        },
    })
    lcPointsEntity.set('point-' + p.id, { point:lcPoint, node:p});
  });
}

const toggleTree = () => {
  showTreeBox.value = !showTreeBox.value
}
	onMounted(() => {
	
	})
</script>
<style lang='scss' scoped>

.es-center {
	position: relative;
	width: 100%;
	height:100%;
  .button-panel{
    width:40px;
    height:  150px;
    background: linear-gradient(135deg, #83283a, #da5c60);
    border-radius: 20px;
    // box-shadow:;
    position: absolute;
    bottom: 200px;
    right: 10px;
    // left: 0;
    margin: 0 auto;
    z-index: 1111;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    img{
      width: 30px;
      height: 30px;
      cursor: pointer;
      transition: all .4s;
    }
    img:hover{
      transform: scale(1.1);
    }
    img:active{
      transform: scale(1.1);
    }
  }
  .toggle-btn{
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1111;
  }
  .header{
    position: absolute;
    top: 0;
    left: 0;
    z-index: 111;
    width: 100%;
    height: 60px;
    background: linear-gradient(135deg, #83283a, #da5c60);
    text-align: center;
    line-height: 60px;
    color: white;
    font-size: 30px;
    font-weight: 500;
    border-bottom-right-radius:30px;
    border-bottom-left-radius:30px;
   
  }
}
</style>
