<template>
	<div class="es-center">
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
	import CesiumTree from './components/center/tree.vue'
  import { onMounted,ref } from 'vue'
	let _viewer = null
	let highlightedModel = null; // 保存高亮中的模型
  let originalColor = null; // 默认颜色
  let titleLabelList = []
 const positions = []; // 存储经纬度数组

  let highlightedPolygon: any = null;
  const showTreeBox = ref(true)
  const activeShequ = ref('')
// key 就是 node.key
const polygonMap = new Map();
const modelMap = new Map();
const labelMap = new Map();
	const showTree = ref(false)
	const onViewerReady = ({viewer,Cesium}) =>{
		_viewer = viewer
		showTree.value = true
    viewer.scene.globe.enableLighting = true; // 开启光照
		addClickHandler()
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

    // 💡 增加亮度/自发光：使用 colorBlendMode + colorBlendAmount
    model.color = Cesium.Color.WHITE;               // 强制覆盖颜色
    model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT; 
    model.colorBlendAmount = 0.3;                   // 调节亮度感

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
        400                         // 距离 entity 的相机距离
      )
    });
}




// Tree 点击触发
function clickTarget(node) {
  console.log(`output->`,node)
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
/**
 * @param id 固定实体 ID
 */
function addOrUpdateLabelById(id,type) {
   // 如果是社区
  if(type == 1) return 
  let {node} = type == 3 ? modelMap.get(id) : polygonMap.get(id)
  if(!node) return 
  let {position,address} = node
  let [lon, lat]= position
  // 如果已经存在同 ID 的 entity，则先移除
  const existing = _viewer.entities.getById('click-label');
  if (existing) {
    _viewer.entities.remove(existing);
  }
  if (existing && existing.label.text == address) {
    return false
  }
  // 创建新 label
  const labelEntity = _viewer.entities.add({
    id:'click-label', // 固定 ID
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 1),
    label: {
      text:address,
            font: "14px sans-serif",
            fillColor: Cesium.Color.BLACK,
            showBackground: true,
            outlineColor: Cesium.Color.WHITE,     // 白色边框
            outlineWidth: 2,         
            backgroundColor: Cesium.Color.YELLOW.withAlpha(1),
            // Cesium.Color.fromCssColorString("#5475ba"),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 80000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });

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
handler.setInputAction(function (click) {
    // 将屏幕坐标转换为地理坐标
    const cartesian = _viewer.camera.pickEllipsoid(click.position, _viewer.scene.globe.ellipsoid);
    if (cartesian) {
        // 转换为经纬度
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        // 存入数组
        positions.push([longitude, latitude]);

        console.log('点击点：', positions);
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction(function (movement) {
    const picked = _viewer.scene.pick(movement.position);
    if (Cesium.defined(picked) && picked.id && picked.id.polygon) {
      const entity = picked.id;
      // 如果是社区
      if(entity._type == 1) return 
      addOrUpdateLabelById(entity.id,entity._type)
      if(isMobile()) return
      // 如果之前有高亮，恢复原始材质
      if (highlightedPolygon && highlightedPolygon !== entity) {
        highlightedPolygon.polygon.material = highlightedPolygon._originalMaterial;
        highlightedPolygon = null;
      }

      // 如果点击同一个，取消高亮
      if (highlightedPolygon === entity) {
        entity.polygon.material = entity._originalMaterial;
        highlightedPolygon = null;
        return;
      }

      // 设置高亮材质
      entity.polygon.material = new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW.withAlpha(0.5));
      highlightedPolygon = entity;
    }

    if (Cesium.defined(picked) && picked.primitive instanceof Cesium.Model) {
      const model = picked.primitive;
      
      addOrUpdateLabelById(model.id,3)
       if(isMobile()) return
      // ✅ 如果点击的是已经高亮的模型，则取消高亮
      if (highlightedModel === model) {
        highlightedModel.color = originalColor;
        highlightedModel = null;
        return;
      }
      // ✅ 取消之前的高亮
      if (highlightedModel) {
        highlightedModel.color = originalColor;
      }

      // ✅ 设置新的高亮
      highlightedModel = model;
      highlightedModel.color = Cesium.Color.YELLOW.withAlpha(0.9);
    } else {
      // 点击空白区域时，取消高亮
      if (highlightedModel) {
        highlightedModel.color = originalColor;
        highlightedModel = null;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
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
    background: #83283a;
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
