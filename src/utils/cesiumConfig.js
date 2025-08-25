const { MAP_URL } = window.ipConfig
// 离线地图url
const arcUrl = MAP_URL || `http://38.34.8.4:8181/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer`
// 偏移量
const [lonX, latY] = [0.0005,0]

const cesiumInit = (viewer) => {
  // 是否支持图像渲染像素化处理
  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    viewer.resolutionScale = window.devicePixelRatio
  }
  // 开启抗锯齿
  viewer.scene.postProcessStages.fxaa.enabled = true;
}

// 定义一个类来封装Cesium中的点、线和面
class Geometry {
  constructor(viewer) {
    this._viewer = viewer;
    this._entities = [];
    this.canvasCache = {}
  }
  // 创建 Canvas 图标函数
 createCanvasWithPng(imageUrl, callback) {
  const cacheKey = `${imageUrl}`;
  if (this.canvasCache[cacheKey]) {
      // 如果图标已缓存，直接返回
      callback(this.canvasCache[cacheKey]);
      return;
  }

  const canvas = document.createElement('canvas');
  const size = 64; // 图标大小
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'anonymous'; // 防止跨域问题
  img.onload = () => {
      // 绘制 PNG 图标
      ctx.drawImage(img, 0, 0, size, size);
      // 转为 Base64 并缓存
      const dataUrl = canvas.toDataURL();
      this.canvasCache[cacheKey] = dataUrl;
      callback(dataUrl);
  };
  img.onerror = (error) => {
      console.error('Image loading error:', error);
  };
  img.src = imageUrl;
}
  addImg({lon,lat,label,imgUrl}) {
    lon = Number(lon) + lonX
		lat = Number(lat) + latY
    console.log(lon,lat,imgUrl)
    let entity = {
        position: Cesium.Cartesian3.fromDegrees(lon,lat),
        billboard : {
            show: imgUrl,
            clampToGround: true,
            image : imgUrl,
            zIndex: 3,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 300000),
            // pixelOffset: new Cesium.Cartesian2(0, -48), // default: (0, 0)设置图片的偏移，是按屏幕坐标来偏移的
            width:32, // default: undefined
            height:32, // default: undefined
        },
        label: {
          clampToGround: true,
          text:label,
          zIndex: 3,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 80000),
          font: "16px sans-serif",
          showBackground: true,//显示背景
          style: Cesium.LabelStyle.FILL,
        },
      }
    const entitys = this._viewer.entities.add(entity);
    this._entities.push(entitys);
  }
  // 创建点
  addPoint({lon,lat,label,size = 5},color) {
    lon = Number(lon) + lonX
		lat = Number(lat) + latY
    let entity = {
      position: Cesium.Cartesian3.fromDegrees(lon,lat),
      label: {
        clampToGround: true,
        text:label,
        zIndex: 3,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200000),
        font: "16px sans-serif",
        showBackground: true,//显示背景
        style: Cesium.LabelStyle.FILL,
      },
      point:{
        pixelSize: size,
        zIndex: 3,
        clampToGround: true,
        color: new Cesium.Color.fromCssColorString(color || "#ffce30"), // 设置颜色并设置透明度,
      } 
    }
    const entitys = this._viewer.entities.add(entity);
    this._entities.push(entitys);
  }
  // 创建线
  addLine({data,color,alpha}) {
    let line = []
    for(let i = 0;i<data.length;i++){
      let {lon,lat} = data[i]
      lon = Number(lon) + lonX
			lat = Number(lat) + latY
      line.push(lon,lat)
    }
    const material = alpha ? new Cesium.Color.fromCssColorString(color).withAlpha(alpha) : new Cesium.Color.fromCssColorString(color)
    const entity = this._viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(line),
        width: 3.0,
        zIndex: 2,
        arcType: Cesium.ArcType.RHUMB,
        material,
        disableDepthTestDistance:Number.POSITIVE_INFINITY,
      },
    });
    // 创建材质（参数是个对象，里面传颜色）
    this._entities.push(entity);
  }
 
  // 创建面
  addPolygon(data,color) {
    let line = []
    for(let i = 0;i<data.length;i++){
      let {lon,lat} = data[i]
          lon = Number(lon) + lonX
          lat = Number(lat) + latY
      line.push(lon,lat)
  
    }
    const entity = this._viewer.entities.add({
      // id,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(line)
        ),
        arcType: Cesium.ArcType.RHUMB,
        material:  new Cesium.Color.fromCssColorString(color || '#FFD700').withAlpha(0.2),
        disableDepthTestDistance:Number.POSITIVE_INFINITY,
      },
    });
    this._entities.push(entity);
  }
   calculateCirclePoints(lonCenter, latCenter, radius) {  
    let r = 6371000.79
      let phase = 2 * Math.PI / 360
      let point = []
      for (let i = 0; i < 361; i++) {
        let dx = radius * Math.cos(i * phase)
        let dy = radius * Math.sin(i * phase)

        let lng = dx / (r * Math.cos(latCenter * Math.PI / 180) * Math.PI / 180)
        let lat = dy / (r * Math.PI / 180)
        let newLng = lonCenter + lng
        point.push({lon:newLng, lat:latCenter + lat})
      }
      return point
    } 
  // 创建圆
  addCrile({lon,lat,radius},color) {
      lon = Number(lon) + lonX
    	lat = Number(lat) + latY
      const point = this.calculateCirclePoints(lon,lat,radius *1000)
      this.addLine({data:point,color:color || '#FFD700',alpha:0.5})
  }
  // 清除所有创建的实体
  removeAll() {
    this._entities.forEach(entity => {
      this._viewer.entities.remove(entity);
    });
    this._entities = [];
  }
}
 
export { arcUrl, lonX, latY,Geometry, cesiumInit }
