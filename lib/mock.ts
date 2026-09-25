/**
 * Mock 数据层 —— 前端骨架阶段使用。
 * 领域类型统一定义在 lib/types.ts，此处 re-export 保持既有引用路径兼容。
 */

import type {
  BudgetSlice,
  ItineraryDay,
  ItemCategory,
  ItineraryItem,
  Pace,
  Trip,
  TripStatus,
} from "@/lib/types";

export type {
  BudgetSlice,
  ItineraryDay,
  ItemCategory,
  ItineraryItem,
  Pace,
  Trip,
  TripStatus,
};

export const paceOptions: { value: Pace; label: string; desc: string }[] = [
  { value: "relaxed", label: "轻松", desc: "每天 2-3 个点，留白充足" },
  { value: "standard", label: "标准", desc: "节奏均衡，经典路线" },
  { value: "compact", label: "紧凑", desc: "尽量多打卡，早出晚归" },
];

export const preferenceOptions = [
  "美食",
  "历史文化",
  "自然风光",
  "城市漫步",
  "摄影出片",
  "亲子友好",
  "夜生活",
  "购物",
];

export const paceLabel: Record<Pace, string> = {
  relaxed: "轻松",
  standard: "标准",
  compact: "紧凑",
};

export const statusMeta: Record<
  TripStatus,
  { label: string; className: string }
> = {
  saved: { label: "已保存", className: "bg-indigo-50 text-indigo-600" },
  draft: { label: "草稿", className: "bg-slate-100 text-slate-500" },
  exported: { label: "已导出", className: "bg-emerald-50 text-emerald-600" },
  failed: { label: "生成失败", className: "bg-rose-50 text-rose-600" },
};

export const formatCNY = (n: number) =>
  "¥" + n.toLocaleString("zh-CN", { maximumFractionDigits: 0 });

/* ---------------- 主示例行程：上海 → 成都 4 日 ---------------- */

export const chengduTrip: Trip = {
  id: "trip-chengdu",
  origin: "上海",
  destination: "成都",
  tagline: "慢游烟火成都：火锅、熊猫与古蜀文明",
  startDate: "2026-05-01",
  endDate: "2026-05-04",
  dayCount: 4,
  budget: 3500,
  preferences: ["美食", "历史文化"],
  pace: "standard",
  status: "saved",
  cover: "from-indigo-500 via-violet-500 to-fuchsia-500",
  emoji: "🐼",
  createdAt: "2026-04-20 14:32",
  itinerary: [
    {
      dayIndex: 1,
      title: "抵达成都 · 宽窄巷子夜游",
      summary: "落地安顿后，用一顿火锅和老街夜色开场。",
      dayBudget: 760,
      items: [
        { time: "14:00", title: "抵达天府国际机场，地铁前往酒店", category: "交通", cost: 60, note: "机场线约 50 分钟，建议住春熙路附近" },
        { time: "16:00", title: "宽窄巷子", category: "文化", cost: 0, note: "免费开放，傍晚光线适合拍照" },
        { time: "18:30", title: "小龙翻大江火锅（宽窄店）", category: "美食", cost: 180, note: "建议提前取号，人均 150-180" },
        { time: "21:00", title: "春熙路 · 太古里漫步", category: "休闲", cost: 0 },
      ],
    },
    {
      dayIndex: 2,
      title: "大熊猫基地与金沙遗址",
      summary: "上午看国宝，下午走进三千年古蜀文明。",
      dayBudget: 940,
      items: [
        { time: "08:00", title: "成都大熊猫繁育研究基地", category: "景点", cost: 55, note: "务必早到，上午熊猫最活跃" },
        { time: "12:00", title: "陈麻婆豆腐（青华路店）", category: "美食", cost: 80 },
        { time: "14:30", title: "金沙遗址博物馆", category: "文化", cost: 70, note: "太阳神鸟金饰为镇馆之宝" },
        { time: "18:00", title: "奎星楼街小吃巡礼", category: "美食", cost: 90, note: "推荐冒椒火辣、二孃鸡爪" },
      ],
    },
    {
      dayIndex: 3,
      title: "都江堰一日往返",
      summary: "探访两千年仍在使用的水利奇迹。",
      dayBudget: 860,
      items: [
        { time: "07:30", title: "犀浦站城际列车前往都江堰", category: "交通", cost: 30 },
        { time: "09:00", title: "都江堰景区", category: "景点", cost: 80, note: "鱼嘴 → 飞沙堰 → 宝瓶口" },
        { time: "13:00", title: "尤兔头（灌县老店）", category: "美食", cost: 70 },
        { time: "15:30", title: "南桥 · 灌县古城", category: "休闲", cost: 0 },
        { time: "19:30", title: "返回成都市区", category: "交通", cost: 30 },
      ],
    },
    {
      dayIndex: 4,
      title: "人民公园茶馆与返程",
      summary: "在盖碗茶里收尾，下午轻松返程。",
      dayBudget: 940,
      items: [
        { time: "09:30", title: "鹤鸣茶社 · 人民公园", category: "休闲", cost: 40, note: "体验采耳与盖碗茶" },
        { time: "11:30", title: "武侯祠", category: "文化", cost: 50 },
        { time: "13:00", title: "锦里古街小吃", category: "美食", cost: 80 },
        { time: "15:30", title: "前往机场返程", category: "交通", cost: 60 },
      ],
    },
  ],
  budgetBreakdown: [
    { category: "餐饮", amount: 1120, barClass: "bg-amber-400", textClass: "text-amber-500" },
    { category: "住宿", amount: 1200, barClass: "bg-indigo-500", textClass: "text-indigo-500" },
    { category: "交通", amount: 620, barClass: "bg-cyan-500", textClass: "text-cyan-500" },
    { category: "门票", amount: 385, barClass: "bg-violet-500", textClass: "text-violet-500" },
    { category: "其他", amount: 175, barClass: "bg-slate-300", textClass: "text-slate-400" },
  ],
  tips: [
    "成都 5 月初均温 18-28℃，备一件薄外套应对早晚与雨天",
    "热门火锅与熊猫基地都建议提前线上取号 / 预约",
    "都江堰、青城山可共用一天，体力有限可二选一",
    "市区出行优先地铁，景点之间打车通常不超过 25 元",
  ],
};

/* ---------------- 历史行程库 ---------------- */

export const historyTrips: Trip[] = [
  chengduTrip,
  {
    id: "trip-xian",
    origin: "上海",
    destination: "西安",
    tagline: "盛唐穿越线：城墙、兵马俑与回民街",
    startDate: "2026-04-10",
    endDate: "2026-04-14",
    dayCount: 5,
    budget: 4200,
    preferences: ["历史文化", "美食"],
    pace: "standard",
    status: "exported",
    cover: "from-rose-500 via-orange-400 to-amber-400",
    emoji: "🏯",
    createdAt: "2026-03-28 09:15",
  },
  {
    id: "trip-chongqing",
    origin: "上海",
    destination: "重庆",
    tagline: "8D 魔幻山城周末速通",
    startDate: "2026-06-12",
    endDate: "2026-06-14",
    dayCount: 3,
    budget: 2600,
    preferences: ["美食", "城市漫步", "夜生活"],
    pace: "compact",
    status: "draft",
    cover: "from-cyan-500 via-sky-500 to-indigo-500",
    emoji: "🌶️",
    createdAt: "2026-04-18 20:41",
  },
  {
    id: "trip-xiamen",
    origin: "杭州",
    destination: "厦门",
    tagline: "鼓浪屿与海风咖啡馆",
    startDate: "2026-03-06",
    endDate: "2026-03-08",
    dayCount: 3,
    budget: 2300,
    preferences: ["城市漫步", "摄影出片"],
    pace: "relaxed",
    status: "saved",
    cover: "from-emerald-400 via-teal-400 to-cyan-500",
    emoji: "🌊",
    createdAt: "2026-02-21 11:02",
  },
  {
    id: "trip-lijiang",
    origin: "广州",
    destination: "丽江",
    tagline: "古城、雪山与泸沽湖星光",
    startDate: "2026-02-15",
    endDate: "2026-02-20",
    dayCount: 6,
    budget: 5200,
    preferences: ["自然风光", "摄影出片"],
    pace: "relaxed",
    status: "exported",
    cover: "from-sky-400 via-blue-500 to-indigo-600",
    emoji: "🏔️",
    createdAt: "2026-01-30 16:58",
  },
  {
    id: "trip-hangzhou",
    origin: "上海",
    destination: "杭州",
    tagline: "西湖春色周末行",
    startDate: "2026-03-21",
    endDate: "2026-03-23",
    dayCount: 3,
    budget: 1800,
    preferences: ["自然风光", "美食"],
    pace: "standard",
    status: "failed",
    cover: "from-lime-400 via-emerald-400 to-teal-500",
    emoji: "🍃",
    createdAt: "2026-03-18 22:10",
  },
];

export function getTrip(id: string): Trip {
  return historyTrips.find((t) => t.id === id) ?? chengduTrip;
}

/* ---------------- 管理后台 Mock ---------------- */

export interface AdminMetric {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: "chart" | "check" | "clock" | "alert";
}

export const adminMetrics: AdminMetric[] = [
  { label: "今日规划任务", value: "128", delta: "+12.4%", trend: "up", icon: "chart" },
  { label: "规划成功率", value: "94.2%", delta: "+1.8%", trend: "up", icon: "check" },
  { label: "平均生成耗时", value: "18.6s", delta: "-2.3s", trend: "up", icon: "clock" },
  { label: "失败任务（7 日）", value: "7", delta: "+2", trend: "down", icon: "alert" },
];

export const hotDestinations = [
  { name: "成都", count: 42 },
  { name: "重庆", count: 38 },
  { name: "西安", count: 31 },
  { name: "厦门", count: 27 },
  { name: "杭州", count: 24 },
  { name: "长沙", count: 19 },
];

export const ratingDistribution = [
  { star: 5, pct: 68 },
  { star: 4, pct: 22 },
  { star: 3, pct: 7 },
  { star: 2, pct: 2 },
  { star: 1, pct: 1 },
];

export interface PlannerRun {
  id: string;
  destination: string;
  provider: string;
  latencyMs: number;
  status: "success" | "failed";
  error?: string;
  createdAt: string;
}

export const plannerRuns: PlannerRun[] = [
  { id: "run_1042", destination: "成都", provider: "deepseek-v3", latencyMs: 17240, status: "success", createdAt: "2026-04-22 15:06" },
  { id: "run_1041", destination: "重庆", provider: "qwen-max", latencyMs: 32110, status: "failed", error: "LLM 响应超时（>30s）", createdAt: "2026-04-22 15:01" },
  { id: "run_1040", destination: "西安", provider: "deepseek-v3", latencyMs: 19880, status: "success", createdAt: "2026-04-22 14:48" },
  { id: "run_1038", destination: "杭州", provider: "siliconflow", latencyMs: 14320, status: "failed", error: "结构化 JSON 解析失败：缺少 itinerary 字段", createdAt: "2026-04-22 14:22" },
  { id: "run_1037", destination: "厦门", provider: "qwen-max", latencyMs: 21450, status: "success", createdAt: "2026-04-22 13:57" },
  { id: "run_1035", destination: "丽江", provider: "deepseek-v3", latencyMs: 30020, status: "failed", error: "外部 POI 服务 503，已降级为模型内置数据", createdAt: "2026-04-22 13:12" },
  { id: "run_1034", destination: "长沙", provider: "siliconflow", latencyMs: 16780, status: "success", createdAt: "2026-04-22 12:40" },
];

export interface FeedbackEntry {
  user: string;
  destination: string;
  score: number;
  comment: string;
  createdAt: string;
  status: "open" | "viewed" | "closed";
}

export const feedbackList: FeedbackEntry[] = [
  { user: "林**", destination: "成都", score: 5, comment: "时间安排很合理，火锅店推荐得太准了，预算误差不到 10%！", createdAt: "2026-04-22 14:10", status: "closed" },
  { user: "周**", destination: "重庆", score: 3, comment: "第三天太赶了，鹅岭和南山一棵树放在一起来不及。", createdAt: "2026-04-22 11:32", status: "open" },
  { user: "陈**", destination: "厦门", score: 4, comment: "整体不错，希望能加上雨天备选方案。", createdAt: "2026-04-21 18:05", status: "viewed" },
  { user: "吴**", destination: "西安", score: 5, comment: "兵马俑预约提醒很实用，导出的 PDF 直接打印带走。", createdAt: "2026-04-21 09:44", status: "closed" },
  { user: "赵**", destination: "丽江", score: 2, comment: "泸沽湖车程估短了，实际单程要 4 小时。", createdAt: "2026-04-20 21:18", status: "open" },
];
