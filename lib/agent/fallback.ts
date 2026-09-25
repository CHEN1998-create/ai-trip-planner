/**
 * 内置模板降级生成器：LLM 不可用或输出不可解析时，产出结构一致的通用行程
 * 这是 PRD"外部信息源失败时优雅降级"的实现，结果由调用方标记为 degraded
 */
import type { ItineraryDay, PlanRequest, PlanResult } from "@/lib/types";

const DAILY_RATIO = { stay: 0.32, food: 0.24, transit: 0.14, ticket: 0.2, other: 0.1 };

function money(budget: number, ratio: number): number {
  return Math.max(0, Math.round((budget * ratio) / 10) * 10);
}

export function buildFallbackPlan(input: PlanRequest): PlanResult {
  const dayCount = Math.max(
    3,
    Math.min(
      7,
      Math.round(
        (new Date(`${input.endDate}T00:00:00`).getTime() -
          new Date(`${input.startDate}T00:00:00`).getTime()) /
          86_400_000
      ) + 1
    )
  );
  const dailyBudget = Math.round(input.budget / dayCount);
  const prefs = input.preferences.join("、") || "经典路线";
  const days: ItineraryDay[] = [];

  for (let d = 1; d <= dayCount; d++) {
    if (d === 1) {
      days.push({
        dayIndex: 1,
        title: `抵达${input.destination} · 安顿与初见`,
        summary: `从${input.origin}出发，抵达后先安顿住宿，傍晚轻松感受市区氛围。`,
        dayBudget: dailyBudget,
        items: [
          { time: "12:00", title: `${input.origin}出发，抵达${input.destination}`, category: "交通", cost: money(dailyBudget, 0.12), note: "建议选择到达市区便利的交通方式" },
          { time: "15:00", title: "入住酒店，稍作休整", category: "住宿", cost: money(dailyBudget, DAILY_RATIO.stay), note: "建议住在地铁沿线，方便后续出行" },
          { time: "17:30", title: "市中心步行街漫步", category: "休闲", cost: 0, note: "感受当地生活气息，顺路解决晚餐" },
          { time: "19:00", title: "本帮特色晚餐", category: "美食", cost: money(dailyBudget, DAILY_RATIO.food), note: "挑选当地人流量大的餐馆更稳妥" },
        ],
      });
    } else if (d === dayCount) {
      days.push({
        dayIndex: d,
        title: `告别${input.destination} · 收尾返程`,
        summary: "上午安排轻松的收尾游览，午后前往车站/机场返程。",
        dayBudget: dailyBudget,
        items: [
          { time: "09:00", title: "酒店附近早餐", category: "美食", cost: money(dailyBudget, 0.06) },
          { time: "10:00", title: "市区公园或地标打卡", category: "景点", cost: money(dailyBudget, 0.1), note: "预留 2 小时轻松游览" },
          { time: "12:30", title: "午餐与手信采购", category: "美食", cost: money(dailyBudget, 0.1) },
          { time: "15:00", title: `前往车站/机场，返回${input.origin}`, category: "交通", cost: money(dailyBudget, 0.12), note: "预留足够余量，避免误车误机" },
        ],
      });
    } else {
      days.push({
        dayIndex: d,
        title: `${input.destination}深度漫游 · 第 ${d} 天`,
        summary: `围绕${prefs}主题安排全天动线，上午重点游览、下午错峰补漏。`,
        dayBudget: dailyBudget,
        items: [
          { time: "09:00", title: "标志性景点 A（上午光线最佳）", category: "景点", cost: money(dailyBudget, DAILY_RATIO.ticket), note: "热门景点建议提前线上预约" },
          { time: "12:00", title: "本地特色午餐", category: "美食", cost: money(dailyBudget, DAILY_RATIO.food) },
          { time: "14:00", title: "文化场馆或街区 B", category: "文化", cost: money(dailyBudget, 0.1), note: "闭馆时间多为 17:00 前后，注意安排" },
          { time: "16:30", title: "咖啡馆 / 茶馆小憩", category: "休闲", cost: money(dailyBudget, 0.08) },
          { time: "18:30", title: "晚餐与夜游", category: "美食", cost: money(dailyBudget, 0.1), note: "夜间景观通常 19:30 后最佳" },
        ],
      });
    }
  }

  return {
    tagline: `${input.destination} ${dayCount} 日通用框架行程`,
    days,
    budgetBreakdown: [
      { category: "住宿", amount: money(input.budget, DAILY_RATIO.stay) },
      { category: "餐饮", amount: money(input.budget, DAILY_RATIO.food) },
      { category: "交通", amount: money(input.budget, DAILY_RATIO.transit + 0.06) },
      { category: "门票", amount: money(input.budget, DAILY_RATIO.ticket) },
      { category: "娱乐", amount: money(input.budget, DAILY_RATIO.other) },
    ],
    tips: [
      "当前为内置模板行程（未接入真实模型数据），具体 POI 请以实时地图与点评为准",
      "热门景点与餐厅建议提前 1-3 天线上预约或取号",
      `住宿建议选在${input.destination}地铁沿线，通勤效率更高`,
      "行程预留弹性时间，遇到排队过长可灵活调整顺序",
    ],
  };
}
