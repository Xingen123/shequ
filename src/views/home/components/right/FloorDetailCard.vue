<template>
  <div class="floor-detail-container">
    <!-- 如果未选中楼宇，展示三维交互提示与导览 -->
    <div v-if="!currentBuilding" class="empty-tip-box">
      <div class="cube-icon-box">
        <div class="wire-cube">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="tip-title">楼层分层剖析已就绪</div>
      <div class="tip-desc">
        点击三维场景中的<span class="highlight">任意楼宇</span><br/>
        查看逐层业态与企业入驻分布
      </div>
      <button class="quick-view-btn" @click="selectDefault">
        快速透视标杆楼宇 (研发中心 A)
      </button>
    </div>

    <!-- 选中楼宇时，展示楼层分层透视结构 -->
    <div v-else class="floor-info-box">
      <div class="building-summary">
        <div class="building-name">
          <span class="building-tag">{{ currentBuilding.code || 'B' }}</span>
          {{ currentBuilding.name }}
        </div>
        <div class="building-metrics">
          <span>总高 <b>{{ currentBuilding.floors || 18 }}</b>层</span>
          <span>面积 <b>{{ currentBuilding.area || '14.8万㎡' }}</b></span>
          <span class="cyan">入驻 <b>{{ currentBuilding.occupancy || '93.2%' }}</b></span>
        </div>
      </div>

      <!-- 分层列表 -->
      <div class="floor-levels">
        <div
          v-for="(lvl, idx) in floorList"
          :key="idx"
          class="floor-row"
        >
          <div class="floor-badge">{{ lvl.floor }}</div>
          <div class="floor-detail">
            <div class="tenant-name">{{ lvl.tenant }}</div>
            <div class="tenant-sub">
              <span class="type-pill">{{ lvl.type }}</span>
              <span class="people-cnt">在岗 {{ lvl.people }}人</span>
            </div>
          </div>
        </div>
      </div>

      <div class="reset-link" @click="$emit('resetBuilding')">
        ✕ 退出分层，返回园区全域
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  building?: any;
}>();

const emit = defineEmits(['selectBuilding', 'resetBuilding']);

const currentBuilding = computed(() => props.building);

const defaultFloorData = [
  { floor: '15F-18F', tenant: '量子智能算法研究院', type: '核心算法', people: 420 },
  { floor: '11F-14F', tenant: '深蓝云海网络技术', type: '云计算平台', people: 510 },
  { floor: '6F-10F', tenant: '极客数智科技', type: 'AI应用开发', people: 480 },
  { floor: '1F-5F', tenant: '园区创享展厅与生态路演中心', type: '公共服务', people: 240 }
];

const floorList = computed(() => {
  if (currentBuilding.value?.currentCompanies && currentBuilding.value.currentCompanies.length) {
    return currentBuilding.value.currentCompanies;
  }
  return defaultFloorData;
});

const selectDefault = () => {
  emit('selectBuilding', '研发中心 A栋');
};
</script>

<style lang="scss" scoped>
.floor-detail-container {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .empty-tip-box {
    text-align: center;
    padding: 10px 14px;
    background: rgba(4, 18, 38, 0.4);
    border: 1px dashed rgba(0, 240, 255, 0.3);
    border-radius: 4px;

    .cube-icon-box {
      margin-bottom: 6px;

      .wire-cube {
        display: inline-block;
        width: 24px;
        height: 18px;
        border: 1px solid #00f0ff;
        border-radius: 2px;
        position: relative;
        box-shadow: 0 0 8px rgba(0, 240, 255, 0.4);

        span {
          display: block;
          height: 4px;
          border-bottom: 1px dashed rgba(0, 240, 255, 0.5);
        }
      }
    }

    .tip-title {
      font-size: 13px;
      font-weight: 600;
      color: #e0f2fe;
      margin-bottom: 4px;
    }

    .tip-desc {
      font-size: 11px;
      color: rgba(180, 210, 240, 0.65);
      line-height: 1.4;

      .highlight {
        color: #00f0ff;
        font-weight: 500;
      }
    }

    .quick-view-btn {
      margin-top: 8px;
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid rgba(0, 240, 255, 0.4);
      color: #00f0ff;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 240, 255, 0.3);
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
      }
    }
  }

  .floor-info-box {
    display: flex;
    flex-direction: column;
    height: 100%;

    .building-summary {
      background: rgba(0, 240, 255, 0.08);
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 3px;
      padding: 4px 8px;
      margin-bottom: 6px;

      .building-name {
        font-size: 13px;
        font-weight: 600;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 6px;

        .building-tag {
          background: #00f0ff;
          color: #051426;
          font-size: 10px;
          font-weight: bold;
          padding: 1px 5px;
          border-radius: 2px;
        }
      }

      .building-metrics {
        display: flex;
        gap: 10px;
        font-size: 10px;
        color: rgba(200, 225, 250, 0.7);
        margin-top: 2px;

        b {
          color: #ffffff;
        }

        &.cyan b {
          color: #00f0ff;
        }
      }
    }

    .floor-levels {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-right: 2px;

      &::-webkit-scrollbar {
        width: 3px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 240, 255, 0.3);
      }

      .floor-row {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(10, 30, 56, 0.5);
        border: 1px solid rgba(0, 240, 255, 0.1);
        border-radius: 2px;
        padding: 3px 6px;

        .floor-badge {
          font-family: 'Consolas', monospace;
          font-size: 10px;
          font-weight: bold;
          color: #00f0ff;
          background: rgba(0, 240, 255, 0.15);
          padding: 2px 4px;
          border-radius: 2px;
          min-width: 52px;
          text-align: center;
        }

        .floor-detail {
          flex: 1;
          min-width: 0;

          .tenant-name {
            font-size: 11px;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .tenant-sub {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 9px;
            color: rgba(180, 210, 240, 0.6);

            .type-pill {
              color: #38ef7d;
            }
          }
        }
      }
    }

    .reset-link {
      font-size: 10px;
      color: rgba(0, 240, 255, 0.7);
      text-align: right;
      cursor: pointer;
      margin-top: 4px;

      &:hover {
        color: #00f0ff;
        text-decoration: underline;
      }
    }
  }
}
</style>

