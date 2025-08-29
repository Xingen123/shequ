export default class SingleBuildingRuler {
  constructor(viewer) {
    this.viewer = viewer;
    this.currentRuler = null; // 当前楼栋的实体数组
    this.currentId = null;    // 当前楼栋id
  }

  // 绘制新的楼栋刻度尺（旧的自动删除）
  drawRuler(id, lon, lat, baseHeight, floors, floorHeight = 3.0, tickLen = 5.0) {
    // 删除旧的
    this.clear();

    const entities = [];
    const centerCartesian = Cesium.Cartesian3.fromDegrees(lon, lat, baseHeight);
    const enu = Cesium.Transforms.eastNorthUpToFixedFrame(centerCartesian);

    const east4 = Cesium.Matrix4.getColumn(enu, 0, new Cesium.Cartesian4());
    const up4 = Cesium.Matrix4.getColumn(enu, 2, new Cesium.Cartesian4());
    const east = Cesium.Cartesian3.normalize(new Cesium.Cartesian3(east4.x, east4.y, east4.z), new Cesium.Cartesian3());
    const up = Cesium.Cartesian3.normalize(new Cesium.Cartesian3(up4.x, up4.y, up4.z), new Cesium.Cartesian3());

    // 主竖线
    const start = centerCartesian;
    const upScaled = Cesium.Cartesian3.multiplyByScalar(up, floors * floorHeight, new Cesium.Cartesian3());
    const end = Cesium.Cartesian3.add(centerCartesian, upScaled, new Cesium.Cartesian3());

    const mainLine = this.viewer.entities.add({
      name: `ruler-main-${id}`,
      polyline: { positions: [start, end], width: 3, material: Cesium.Color.YELLOW.withAlpha(0.9) }
    });
    entities.push(mainLine);

    // 每层刻度 + 层号
    for (let i = 1; i <= floors; i++) {
      const h = i * floorHeight;
      const upVec = Cesium.Cartesian3.multiplyByScalar(up, h, new Cesium.Cartesian3());
      const posAtHeight = Cesium.Cartesian3.add(centerCartesian, upVec, new Cesium.Cartesian3());

      const eastVec = Cesium.Cartesian3.multiplyByScalar(east, tickLen, new Cesium.Cartesian3());
      const tickEnd = Cesium.Cartesian3.add(posAtHeight, eastVec, new Cesium.Cartesian3());

      const tickLine = this.viewer.entities.add({
        name: `ruler-tick-${id}-${i}`,
        polyline: { positions: [posAtHeight, tickEnd], width: 2, material: Cesium.Color.ORANGE }
      });
      entities.push(tickLine);

      const label = this.viewer.entities.add({
        position: tickEnd,
        label: {
          text: `${i}F`,
          font: '14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
          pixelOffset: new Cesium.Cartesian2(10, 0),
          scaleByDistance: new Cesium.NearFarScalar(200.0, 1.0, 2000.0, 0.5)
        }
      });
      entities.push(label);
    }

    this.currentRuler = entities;
    this.currentId = id;
  }

  // 相机飞过去
  flyTo(lon, lat, baseHeight, floors, floorHeight) {
    const totalHeight = floors * floorHeight;
    const targetHeight = baseHeight + totalHeight / 2;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, targetHeight + totalHeight * 2),
      orientation: { heading: Cesium.Math.toRadians(0), pitch: Cesium.Math.toRadians(-20), roll: 0 },
      duration: 3.0
    });
  }

  // 隐藏当前楼
  hide() {
    if (!this.currentRuler) return;
    this.currentRuler.forEach(e => e.show = false);
  }

  // 显示当前楼
  show() {
    if (!this.currentRuler) return;
    this.currentRuler.forEach(e => e.show = true);
  }

  // 删除当前楼
  clear() {
    if (!this.currentRuler) return;
    this.currentRuler.forEach(e => this.viewer.entities.remove(e));
    this.currentRuler = null;
    this.currentId = null;
  }
}
