// 地段对比页(Bukit Jalil、KLCC、Bangsar…)怎么认领项目。
// 区域内容档里二选一:
//   locality: "Bukit Jalil"   → 项目地点里出现这个名字的都算
//   matchRegion: "klcc"       → 项目的筛选分组是这个的都算(地点写法不统一的地段用这个)
type AreaData = { locality?: string; matchRegion?: string };
type Prop = { data: { location: string; region?: string } };

export const isComparePage = (a: AreaData) => !!(a.locality || a.matchRegion);

export function inCompareArea(a: AreaData, p: Prop): boolean {
  if (a.matchRegion) return p.data.region === a.matchRegion;
  if (a.locality) return p.data.location.toLowerCase().includes(a.locality.toLowerCase());
  return false;
}
