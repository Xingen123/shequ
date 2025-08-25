<template>
	<div class="es-center">
		<CesiumTree v-if="showTree" @onChange="onCheckedChange" @clickTarget="clickTarget"></CesiumTree>
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
	 <vc-navigation ref="navigation" :offset="[35, 35]"></vc-navigation>
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
let titleLabelList = []
	const showTree = ref(false)
	const onViewerReady = ({viewer,Cesium}) =>{
		_viewer = viewer
		showTree.value = true
		addClickHandler()
	}
	const onCheckedChange = (data) => {
		console.log(`output->`,data)
		traverseAndRender(data)
	}
	
// function traverseAndRender( nodes) {
//   let lastPosition  = null;

//   nodes.forEach(node => {
//     if (node.type === 3) {
//       // 楼栋 → 加载模型
//       const [lon, lat] = node.position;
//       lastPosition = Cesium.Cartesian3.fromDegrees(lon, lat, 1);
//       _viewer.scene.primitives.add(
//         Cesium.Model.fromGltf({
//           url: node.glbUrl || './lou.glb',
//           modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(lastPosition),
//            scale: 2.0,                // 放大一倍
//  					 minimumPixelSize: 128      // 保证最小像素大小
//         })
//       );
//     } else {
//       // 社区/小区 → 不规则区域
//       const hierarchy = Cesium.Cartesian3.fromDegreesArray(node.position);
//       _viewer.entities.add({
//         name: node.title,
//         polygon: {
//           hierarchy,
//           material: Cesium.Color.BLUE.withAlpha(0.3),
//           outline: true,
//           outlineColor: Cesium.Color.BLUE
//         }
//       });
//     }
//   });
// }

function traverseAndRender(nodes) {
  nodes.forEach(node => {
    if (node.type === 3) {
      const [lon, lat] = node.position;
      const height = 1;
      const lastPosition = Cesium.Cartesian3.fromDegrees(lon, lat, height);

      const model = Cesium.Model.fromGltf({
        url: node.glbUrl || './lou.glb',
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(lastPosition),
        scale: 1.0
      });

      // ✅ 绑定节点 key，用于 Tree 点击高亮
      model.id = node.key;
      _viewer.scene.primitives.add(model);

      // 默认标题 label
      const titleLabel = _viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, height + 20),
        label: {
          text: node.title,
					distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 80000),
          font: "14px sans-serif",
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });

      titleLabelList.push(titleLabel);
    }
  });
}
// 获取当前相机角度
function getCameraHeadingPitchRoll() {
  if (!_viewer) return null;
  const camera = _viewer.camera;
  const hpr = {
    heading: camera.heading, // 水平角，弧度
    pitch: camera.pitch,     // 俯仰角，弧度
    roll: camera.roll        // 翻滚角，弧度
  };
	console.log(`output->`,hpr)
  return hpr;
}
function flyToModel(model, distance = 1000, heightOffset = 500) {
  if (!model || !_viewer) return;

  model.readyPromise.then(() => {
    // 获取模型中心位置
    const modelPosition = new Cesium.Cartesian3();
    Cesium.Matrix4.getTranslation(model.modelMatrix, modelPosition);

    // 提升高度
    const offsetPosition = new Cesium.Cartesian3(
      modelPosition.x,
      modelPosition.y,
      modelPosition.z + heightOffset
    );

    // 固定角度
    const heading = Cesium.Math.toRadians(45); // 水平角 45°
    const pitch = Cesium.Math.toRadians(-30);  // 俯视角 -30°
    const roll = 0;

    _viewer.camera.flyTo({
      destination: offsetPosition,
      orientation: {
        heading,
        pitch,
        roll
      },
      duration: 1.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_OUT
    });
  });
}



// Tree 点击触发
function clickTarget({ key, position }) {
	getCameraHeadingPitchRoll()
  if (!_viewer || !position.length) return;
  // 查找对应模型
let targetModel = null;
console.log(`output->`,_viewer.scene.primitives)
_viewer.scene.primitives._primitives.forEach(primitive => {
  if (primitive instanceof Cesium.Model && primitive.id === key) {
    targetModel = primitive;
  }
});
flyToModel(targetModel)
  // 高亮处理
  if (highlightedModel) {
    highlightedModel.color = Cesium.Color.WHITE;
  }
  if (targetModel) {
    targetModel.color = Cesium.Color.RED.withAlpha(0.8);
    highlightedModel = targetModel;
  }
}


// viewer 就绪时挂载点击 handler
function addClickHandler() {
  const handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);

  handler.setInputAction(function (movement) {
    const picked = _viewer.scene.pick(movement.position);
    if (Cesium.defined(picked) && picked.primitive instanceof Cesium.Model) {
      // 取消之前的高亮
      if (highlightedModel) {
        highlightedModel.color = Cesium.Color.WHITE; 
      }
      // 设置新的高亮
      highlightedModel = picked.primitive;
      highlightedModel.color = Cesium.Color.YELLOW.withAlpha(0.9);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


	onMounted(() => {
	
	})
</script>
<style lang='scss' scoped>
.es-center {
	position: relative;
	width: 100%;
	height:100%;
}
</style>
