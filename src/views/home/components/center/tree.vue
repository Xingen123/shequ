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
// 原始楼层数据
const baseFloors = [
  {
    "floorIndex": 1,
    "floorName": "1层",
    "size": { "width": 20, "height": 15 }, 
    "points": [
      {
        "id": "H101",
        "type": "household",
        "name": "1-101",
        "position": { "x": 3, "y": 4 },
        "detail": { "owner": "张三", "area": "85㎡", "status": "已入住" }
      },
      {
        "id": "H102",
        "type": "household",
        "name": "1-102",
        "position": { "x": 9, "y": 4 },
        "detail": { "owner": "李四", "area": "90㎡", "status": "空置" }
      }
    ]
  }
];

const emit = defineEmits(['onChange','clickTarget'])
// -------------------- 工具函数 --------------------
function generateKey() {
  return `key-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// 生成 30 层
function generateFloors(baseFloors, totalFloors = 30) {
  const floors = [];
  const template = baseFloors[0]; // 假设只用第一层模板

  for (let i = 1; i <= totalFloors; i++) {
    // 克隆点位
    const points = template.points.map(p => ({
      id: p.id + "_" + i,           // 保证每层点位 id 唯一
      type: p.type,
      name: `${i}-${p.name.split('-')[1]}`, // 例如 "1-101" → "2-101"
      position: { ...p.position },
      detail: { ...p.detail }
    }));

    floors.push({
      floorIndex: i,
      floorName: `${i}层`,
      size: { ...template.size },
      points
    });
  }

  return floors;
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
// 模拟数据生成函数
function generateCommunities() {
  let arrLd = [
    [
        117.18138379196839,
        35.116156417386954
    ],
    [
        117.18083873442897,
        35.116922377166176
    ],
    [
        117.1808352022465,
        35.11759717250895
    ],
    [
        117.18089254503998,
        35.11845154555728
    ],
    [
        117.18140126534416,
        35.11913200248226
    ],
    [
        117.18211782072909,
        35.116143452218815
    ],
    [
        117.18163070603416,
        35.11689265515556
    ],
    [
        117.18152607263971,
        35.117594319067194
    ],
    [
        117.18148741747477,
        35.11846387672875
    ],
    [
        117.18218173668399,
        35.11904803262037
    ],
    [
        117.18256466297835,
        35.116892792079966
    ],
    [
        117.18219861459531,
        35.11722163845497
    ],
    [
       117.18226622859144,
        35.11816398234803
       
    ],
    [
        117.18284708621164,
        35.11845187774314
    ],
    [
        117.18314591955182,
        35.11688402455284
    ],
    [
        117.18351028251364,
        35.117217386798366
    ],
    [
        117.18350435864072,
        35.11817752691405
    ],
    [
        117.18347727858689,
        35.116144364679876
    ],
    [
        117.184313163463,
        35.11688263248285
    ],
    [
        117.18434479722737,
        35.11760556193642
    ],
    [
        117.18436207378191,
        35.11843360920699
    ],
    [
        117.183455565737,
        35.11902049581154
    ],
    [
        117.1842220750769,
        35.11615226950418
    ],
    [
        117.18493689188617,
        35.11688656255918
    ],
    [
        117.18497828166514,
        35.117599700821714
    ],
    [
        117.18498728854212,
        35.11843149367004
    ],
    [
        117.18419161845686,
        35.11910039019295
    ]
]

  const communities = [
   {
    title: "奥体华府",
    type: 2,
    key: '0',
    position: [117.18038527541411, 35.11945002346846, 117.18538852492566, 35.11948295085823,117.18569710795235, 35.119261532559875, 117.18559019166669, 35.11609046736943, 117.18530570633511, 35.115937037767644, 117.18061379377212, 35.11590903626022, 117.18036201811995, 35.11604431651273, 117.18038008376351, 35.119447510794316],
    leaders: ["王总", "李经理"],
    address: "山东滕州奥体大道 88 号",
    children: Array.from({ length: 26 }).map((_, i) => ({
      title: `奥体华府 ${i + 1} 号楼`,
      type: 3,
      "size": { "width": 20, "height": 15 }, 
      floors:generateFloors(baseFloors, 30),
      position: [arrLd[i][0],arrLd[i][1]],
      leaders: [`楼长${i + 1}`],
      address: `1层\n101号：户主 张三`,
      key: `0-${i}` // 子集 key = 父索引 + '-' + 子索引
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
  const transformed =  generateCommunities() 
  //  const transformed =  transformCommunityTreeAutoKey3D(data);
  // tableData.value = data.communityVillage
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
