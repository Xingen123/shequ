import { postAction, getAction } from './index'

// 社区/园区树形数据与地理坐标
export const getShequTreeData = (param?: any) => getAction('/api/equipment.Equipment/community', param)

// 天气数据
export const getWeather = (param?: any) => getAction('/api/equipment.Equipment/weather', param)

// 智慧园区数字孪生扩展数据
export const getParkOverview = () => getAction('/api/park/overview')
export const getParkEnergy = () => getAction('/api/park/energy')
export const getParkOccupancy = () => getAction('/api/park/occupancy')
export const getParkAlarms = () => getAction('/api/park/alarms')
export const getParkSpaceMix = () => getAction('/api/park/space-mix')
export const getParkTraffic = () => getAction('/api/park/traffic')
export const getBuildingFloors = (name?: string) => getAction('/api/park/building-floors', { name })
