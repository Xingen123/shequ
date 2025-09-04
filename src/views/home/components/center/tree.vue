<template>
<div>

<div class="tree-box">
 <a-input
      v-model:value="searchValue"
      placeholder="支持搜索社区/小区/楼栋"
      style="margin-bottom: 10px"
      allow-clear
    />

  <div class="my-tree">
    <!-- 搜索输入框 -->
    <!-- 树组件 -->
    <a-tree
      :tree-data="filteredTreeData"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      :field-names="{ children: 'children', title: 'title' }"
      @select="handleSelect"
    >
      <template #title="{ title }">
        <span v-html="highlightText(title)"></span>
      </template>
    </a-tree>

    <!-- 节点信息显示
    <div class="info">
      <h4>点击节点信息：</h4>
      <pre>{{ selectedNodeJSON }}</pre>
    </div> -->
  </div>
</div>
<div class="bottom-table">
  <a-table size="small" class="custom-table" :scroll="{ x: 1000, y: 120 }"  :columns="columns" :pagination="false" :data-source="tableData" bordered>
  </a-table>
</div>
</div>

</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { getShequTreeData } from '@/api/apiList.ts';
import coordtransform from 'coordtransform';
import type { TableColumnType } from 'ant-design-vue';
import {generateCommunities} from './lou.js'
// -------------------- 数据 & 状态 --------------------
const treeData = ref<TreeProps['treeData']>([]);
const originalTreeData = ref<TreeProps['treeData']>([]); // 原始数据保留
const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
const checkedKeys =ref<string[]>([]);
const selectedNodeJSON = ref<string>('');
const searchValue = ref('');
const tableData = ref([]);
const columns = [
   { title: '小区名称', dataIndex: 'village_name', width: 150,align: "center"},
  { title: '小区地址', dataIndex: 'address', width: 500,align: "center",ellipsis: true },
  { title: '是否拆迁', dataIndex: 'is_relocation', width: 100, customRender: ({ text }) => (text === 1 ? "是" : "否"),align: "center"},
  { title: '常住人口', dataIndex: 'permanent_population', width: 120,align: "center"},
  { title: '流动人口', dataIndex: 'mobile_population', width: 120,align: "center"},
  { title: '奖扶人口数', dataIndex: 'key_population', width: 120,align: "center"},
  { title: '负责人', dataIndex: 'manager_name', width: 100,align: "center"},
  { title: '负责人电话', dataIndex: 'manager_phone', width: 150,align: "center"},
  { title: '建筑面积', dataIndex: 'building_area', width: 120,align: "center"},
  { title: '楼栋数', dataIndex: 'building_count', width: 100,align: "center"},
  { title: '户数', dataIndex: 'household_count', width: 100,align: "center"},
];

const emit = defineEmits(['onChange','clickTarget'])
// -------------------- 工具函数 --------------------
function generateKey() {
  return `key-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}


// 高德 GCJ-02 坐标 → WGS-84
function gcj02ToWgs84(lon: number, lat: number): [number, number] {
  return coordtransform.gcj02towgs84(lon, lat);
}
function flattenCoordinates(coords: number[][]) {
  return coords.flat();
}
function transformCommunityTreeAutoKey3D(data: any) {
  if (!data) return [];
  const community = data;
  const communityNode = {
    title: community.title,
    key: generateKey(),
    type: 1,
    position: flattenCoordinates(
      community.coordinates.map(([lon, lat]: [number, number]) => gcj02ToWgs84(lon, lat))
    ),
    leaders: community.leaders || [],
    address: community.address,
    children: [],
  };

  if (community.communityVillage && community.communityVillage.length > 0) {
    communityNode.children = community.communityVillage.map(village => {
      const villageNode = {
        title: village.village_name,
        key: generateKey(),
        type: 2,
        position: flattenCoordinates(
          village.coordinates.map(([lon, lat]: [number, number]) => gcj02ToWgs84(lon, lat))
        ),
        leaders: village.leaders || [],
        address: village.address,
        children: [],
      };
      if (village.communityBuilding && village.communityBuilding.length > 0) {
        villageNode.children = village.communityBuilding.map(building => {
          const [lon, lat] = building.lnglat.split(',').map(Number);
          const [wgsLon, wgsLat] = gcj02ToWgs84(lon, lat);
          return {
            title: building.building_name,
            key: generateKey(),
            type: 3,
            id:building.building_id,
            position: [wgsLon, wgsLat, 0], // 加上高度
            leaders: building.leaders || [],
            address: building.address,
          };
        });
      }

      return villageNode;
    });
  }

  return [communityNode];
}

// 获取所有节点 key
function getAllKeys(nodes: any[]): string[] {
  let keys: string[] = [];
  nodes.forEach(node => {
    keys.push(node.key);
    if (node.children && node.children.length) {
      keys = keys.concat(getAllKeys(node.children));
    }
  });
  return keys;
}

// -------------------- 搜索 & 高亮 --------------------
// 过滤树并保留层级
function filterTreeWithHierarchy(nodes: any[], keyword: string): any[] {
  const filtered: any[] = [];

  nodes.forEach(node => {
    const match = node.title.includes(keyword);
    let newNode: any = { ...node };

    if (node.children && node.children.length) {
      const filteredChildren = filterTreeWithHierarchy(node.children, keyword);
      if (filteredChildren.length > 0 || match) {
        newNode.children = filteredChildren;
        filtered.push(newNode);
      }
    } else if (match) {
      filtered.push(newNode);
    }
  });

  return filtered;
}



// 根据搜索生成树
const filteredTreeData = computed(() => {
  if (!searchValue.value) return originalTreeData.value;
  return filterTreeWithHierarchy(originalTreeData.value, searchValue.value);
});

// -------------------- 点击节点 --------------------
function handleSelect(selectedKeysValue: string[], info: any) {
  if (!info.node) return;
  const { title, position, leaders, address, type, key } = info.node;
  const safeNode = { title, key, type, position, leaders, address };
  selectedNodeJSON.value = JSON.stringify(safeNode, null, 2);
  emit('clickTarget',info.node)
}
// 计算展开节点 key（匹配节点及其父节点）
function getExpandedKeysForSearch(nodes: any[], keyword: string): string[] {
  const keys: string[] = [];

  const dfs = (node: any): boolean => {
    let match = node.title.includes(keyword);
    if (node.children && node.children.length) {
      const childMatch = node.children.some(dfs);
      match = match || childMatch;
    }
    if (match) keys.push(node.key);
    return match;
  };

  nodes.forEach(dfs);
  return keys;
}

// 高亮匹配文字（不改变原始树结构）
function highlightText(title: string) {
  if (!searchValue.value) return title;
  const reg = new RegExp(`(${searchValue.value})`, 'gi');
  return title.replace(reg, `<span style="color: red;">$1</span>`);
}
/**
 * 根据 key 数组查找树中对应节点对象
 * @param tree 树数组
 * @param keys key 数组
 * @returns 对应节点对象数组
 */
function getNodesByKeys(tree: any[], keys: string[]): any[] {
  const result: any[] = [];

  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      if (keys.includes(node.key)) {
        result.push(node);
      }
      if (node.children && node.children.length) {
        traverse(node.children);
      }
    });
  };

  traverse(tree);
  return result;
}

// 监听搜索
watch(searchValue, (val) => {
  if (!val) {
    expandedKeys.value = getAllKeys(originalTreeData.value);
  } else {
    expandedKeys.value = getExpandedKeysForSearch(originalTreeData.value, val);
  }
});
watch(checkedKeys, (val) => {
    emit('onChange',getNodesByKeys(treeData.value, val));
});

// -------------------- 初始化 --------------------
onMounted(async () => {
  const data = await getShequTreeData();
  // 生成唯一key
  // const transformed =  generateCommunities() 
   const transformed =  transformCommunityTreeAutoKey3D(data);
  tableData.value = data.communityVillage
  treeData.value = transformed;
  originalTreeData.value = transformed; // 保存原始树数据
  expandedKeys.value = getAllKeys(transformed);
  checkedKeys.value = getAllKeys(transformed);
  // console.log(`output->`,expandedKeys.value)
});


</script>

<style scoped>
.tree-box {
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 1;
  /* background: #7595a2; */
  padding: 10px;
  border-radius: 10px;
  width: 300px;
  height: 300px;
  overflow: hidden;
}
.bottom-table{
  position: fixed;
  bottom: 10px;
  left: 0px;
  z-index: 1;
  /* background: white; */
  padding: 10px;
  width: 100%;
  height: 180px;
}
.my-tree {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.info {
  margin-top: 20px;
  max-height: 300px;
  overflow: auto;
  font-size: 12px;
  background: #f9f9f9;
  padding: 10px;
}
</style>
