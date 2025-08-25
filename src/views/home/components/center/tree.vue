<template>
<div class="tree-box">
 <a-input
      v-model:value="searchValue"
      placeholder="搜索节点"
      style="margin-bottom: 10px"
      allow-clear
    />

  <div class="my-tree">
    <!-- 搜索输入框 -->
   
    <!-- 树组件 -->
    <a-tree
      :tree-data="filteredTreeData"
      checkable
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
       v-model:checkedKeys="checkedKeys"
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

</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { getShequTreeData } from '@/api/apiList.ts';

// -------------------- 数据 & 状态 --------------------
const treeData = ref<TreeProps['treeData']>([]);
const originalTreeData = ref<TreeProps['treeData']>([]); // 原始数据保留
const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
const checkedKeys =ref<string[]>([]);
const selectedNodeJSON = ref<string>('');
const searchValue = ref('');
const emit = defineEmits(['onChange','clickTarget'])
// -------------------- 工具函数 --------------------
function generateKey() {
  return `key-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function flattenCoordinates(coords: number[][]) {
  return coords.flat();
}

// 转换接口数据生成 Tree
function transformCommunityTreeAutoKey(data: any) {
  if (!data) return [];

  const community = data;

  const communityNode = {
    title: community.title,
    key: generateKey(),
    type: 1,
    position: flattenCoordinates(community.coordinates),
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
        position: flattenCoordinates(village.coordinates),
        leaders: village.leaders || [],
        address: village.address,
        children: [],
      };

      if (village.communityBuilding && village.communityBuilding.length > 0) {
        villageNode.children = village.communityBuilding.map(building => {
          const [lon, lat] = building.lnglat.split(',').map(Number);
          return {
            title: building.building_name,
            key: generateKey(),
            type: 3,
            position: [lon, lat],
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
// 模拟数据生成函数
function generateCommunities() {
  const communities = [
    {
      title: "阳光小区",
      type: 2,
      key:'0',
      position: [117.1501, 35.1001, 117.1515, 35.1002, 117.1520, 35.0990, 117.1505, 35.0985],
      leaders: ["张三", "李四"],
      address: "山东滕州阳光大道 88 号",
      children: Array.from({ length: 100 }).map((_, i) => ({
        title: `阳光小区 ${i + 1} 号楼`,
        type: 3,
        position: [117.1505 + Math.random() * 0.01, 35.0990 + Math.random() * 0.01],
        leaders: [`楼长${i + 1}`],
        address: `阳光小区 ${i + 1} 号楼`,
        key: `0-${i}` // 子集 key = 父索引 + '-' + 子索引
      }))
    },
    {
      title: "碧桂园小区",
      type: 2,
        key:'1',
      position: [117.1601, 35.1101, 117.1615, 35.1105, 117.1622, 35.1095, 117.1603, 35.1090],
      leaders: ["王五", "赵六"],
      address: "山东滕州碧桂路 66 号",
      children: Array.from({ length: 100 }).map((_, i) => ({
        title: `碧桂园小区 ${i + 1} 号楼`,
        type: 3,
        position: [117.1605 + Math.random() * 0.01, 35.1090 + Math.random() * 0.01],
        leaders: [`楼长${i + 1}`],
        address: `碧桂园小区 ${i + 1} 号楼`,
        key: `1-${i}` // 子集 key = 父索引 + '-' + 子索引
      }))
    }
  ];
  return communities;
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
  // const data = await getShequTreeData();
  // 生成唯一key
  const transformed = generateCommunities() ||  transformCommunityTreeAutoKey(data);
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
  top: 100px;
  left: 20px;
  z-index: 1;
  background: white;
  padding: 10px;
  border: 1px solid #eee;
  width: 300px;
  height: 300px;
   overflow: hidden;
  
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
