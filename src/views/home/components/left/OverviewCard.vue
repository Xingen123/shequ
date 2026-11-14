<template>
  <div class="overview-grid">
    <!-- 楼宇总数 -->
    <div class="grid-item">
      <div class="item-title">楼宇总数</div>
      <div class="item-val-group">
        <span class="num highlight">{{ data.buildingCount || 8 }}</span>
        <span class="unit">栋</span>
      </div>
      <div class="item-sub">总建筑面积 {{ data.buildingArea || '68.4万㎡' }}</div>
    </div>

    <!-- 入驻企业 -->
    <div class="grid-item">
      <div class="item-title">入驻企业</div>
      <div class="item-val-group">
        <span class="num highlight">{{ data.enterprises || 268 }}</span>
        <span class="unit">家</span>
      </div>
      <div class="item-sub success-txt">
        本月新增 {{ data.newEnterprisesThisMonth || 12 }} 家 ↑
      </div>
    </div>

    <!-- 整体入驻率 -->
    <div class="grid-item">
      <div class="item-title">整体入驻率</div>
      <div class="item-val-group">
        <span class="num cyan">{{ data.occupancyRate || '87.6%' }}</span>
      </div>
      <div class="item-sub">环比 <span class="cyan">{{ data.occupancyGrowth || '+2.4%' }}</span></div>
    </div>

    <!-- 在岗人数 -->
    <div class="grid-item">
      <div class="item-title">在岗人数</div>
      <div class="item-val-group">
        <span class="num">{{ data.activeStaff || '6,840' }}</span>
        <span class="unit">人</span>
      </div>
      <div class="item-sub">今日入园 {{ data.todayVisitors || '12,480人次' }}</div>
    </div>

    <!-- 今日能耗 -->
    <div class="grid-item">
      <div class="item-title">今日能耗</div>
      <div class="item-val-group">
        <span class="num warning-txt">{{ data.todayEnergy || '48,620' }}</span>
        <span class="unit">kWh</span>
      </div>
      <div class="item-sub success-txt">同比 {{ data.energyComparison || '-3.2%' }} ↓</div>
    </div>

    <!-- 车位占用 -->
    <div class="grid-item">
      <div class="item-title">车位占用</div>
      <div class="item-val-group">
        <span class="num">{{ data.parkingOccupied || 1032 }}</span>
        <span class="unit">/ {{ data.parkingTotal || 1200 }}个</span>
      </div>
      <div class="item-sub">占用率 {{ data.parkingRate || '86.0%' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data?: any;
}>();
</script>

<style lang="scss" scoped>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  .grid-item {
    background: rgba(10, 32, 60, 0.45);
    border: 1px solid rgba(0, 240, 255, 0.12);
    border-radius: 4px;
    padding: 6px 10px;
    position: relative;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(10, 36, 70, 0.65);
      border-color: rgba(0, 240, 255, 0.3);
    }

    .item-title {
      font-size: 11px;
      color: rgba(190, 220, 245, 0.7);
      margin-bottom: 2px;
    }

    .item-val-group {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .num {
        font-size: 19px;
        font-family: 'DIN Alternate', 'Helvetica Neue', 'Arial', sans-serif;
        font-weight: 700;
        color: #ffffff;

        &.highlight {
          color: #00f0ff;
          text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
        }

        &.cyan {
          color: #38ef7d;
        }

        &.warning-txt {
          color: #ffb800;
        }
      }

      .unit {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .item-sub {
      font-size: 10px;
      color: rgba(160, 190, 220, 0.6);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.success-txt {
        color: #38ef7d;
      }

      .cyan {
        color: #00f0ff;
      }
    }
  }
}
</style>

