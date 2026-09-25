/**
 * Agent 提示词：把结构化输入转译为约束明确的 JSON 生成任务
 */
import type { PlanRequest } from "@/lib/types";

const PACE_TEXT: Record<PlanRequest["pace"], string> = {
  relaxed: "轻松：每天 2-3 个活动点，节奏留白充足，不安排早于 09:30 出发",
  standard: "标准：每天 3-5 个活动点，节奏均衡，覆盖经典路线",
  compact: "紧凑：每天 5-7 个活动点，可早出晚归，尽量多打卡",
};

const SYSTEM_PROMPT = `你是一名资深旅行规划 Agent，擅长为中国国内目的地编排"Day by Day"行程。

你必须只输出一个 JSON 对象（不要输出 markdown 围栏或任何解释文字），结构如下：
{
  "tagline": "一句话行程主题，15 字以内，突出目的地特色",
  "days": [
    {
      "dayIndex": 1,
      "title": "当日主题，10 字以内",
      "summary": "当日一句话概览，20-40 字",
      "dayBudget": 760,
      "items": [
        {
          "time": "14:00",
          "title": "具体地点或活动名（真实存在的 POI）",
          "category": "交通|美食|景点|文化|休闲|住宿 六选一",
          "cost": 60,
          "note": "实用贴士，可省略"
        }
      ]
    }
  ],
  "budgetBreakdown": [
    { "category": "餐饮", "amount": 1120 },
    { "category": "住宿", "amount": 1200 },
    { "category": "交通", "amount": 620 },
    { "category": "门票", "amount": 385 }
  ],
  "tips": ["3-5 条实用建议（天气、预约、交通、避坑等）"]
}

硬性规则：
1. days 的数量必须等于指定天数；dayIndex 从 1 开始连续递增
2. 第一天包含抵达交通，最后一天包含返程交通；时间必须单调合理（08:00-22:00）
3. 推荐真实存在、有代表性的餐厅与景点；优先覆盖用户勾选的偏好
4. 每个 cost 为人均预估（单位人民币，整数，免费填 0）；每个 dayBudget 为当天人均合计
5. 所有 dayBudget 之和必须接近指定的人均总预算（误差 ≤10%）
6. budgetBreakdown 的 category 建议从 餐饮/住宿/交通/门票/购物/娱乐 中选取，amount 之和等于预算总和
7. 全部使用简体中文`;

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildUserPrompt(input: PlanRequest): string {
  const dayCount = dayDiff(input.startDate, input.endDate);
  return `请为以下需求生成行程规划 JSON：

- 出发地：${input.origin}
- 目的地：${input.destination}（单目的地）
- 出行日期：${input.startDate} 至 ${input.endDate}（共 ${dayCount} 天，含首尾）
- 人均总预算：${input.budget} 元
- 兴趣偏好：${input.preferences.length ? input.preferences.join("、") : "无特别偏好，按经典路线安排"}
- 旅行节奏：${PACE_TEXT[input.pace]}

再次确认：只输出一个合法 JSON 对象，days 数量必须为 ${dayCount}。`;
}

export function dayDiff(startDate: string, endDate: string): number {
  const s = new Date(`${startDate}T00:00:00`).getTime();
  const e = new Date(`${endDate}T00:00:00`).getTime();
  return Math.round((e - s) / 86_400_000) + 1;
}
