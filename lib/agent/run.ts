/**
 * Agent 编排入口：接收输入 → 调用模型（失败重试一次）→ 解析结构化输出
 * 最终失败时降级为内置模板，保证链路可演示（PRD：外部信息源失败时优雅降级）
 */
import type { PlanRequest, PlanResult } from "@/lib/types";
import { chatJSON, isLLMConfigured, LLM_MODEL } from "./llm";
import { buildSystemPrompt, buildUserPrompt, dayDiff } from "./prompt";
import { normalizePlanResult } from "./parse";
import { buildFallbackPlan } from "./fallback";

export type RunStatus = "success" | "degraded" | "failed";

export interface RunOutcome {
  status: RunStatus;
  result: PlanResult | null;
  provider: string;
  latencyMs: number;
  degradedReason?: string;
  error?: string;
}

async function callOnce(input: PlanRequest): Promise<PlanResult> {
  const expectedDays = dayDiff(input.startDate, input.endDate);
  const text = await chatJSON(buildSystemPrompt(), buildUserPrompt(input));
  return normalizePlanResult(text, expectedDays);
}

export async function runPlanner(input: PlanRequest): Promise<RunOutcome> {
  const start = Date.now();
  const elapsed = () => Date.now() - start;

  // 1) 未配置 key：直接内置模板降级
  if (!isLLMConfigured()) {
    return {
      status: "degraded",
      result: buildFallbackPlan(input),
      provider: "fallback-template",
      latencyMs: elapsed(),
      degradedReason: "未配置 DEEPSEEK_API_KEY，已使用内置模板生成行程",
    };
  }

  // 2) 调用模型，失败自动重试一次
  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await callOnce(input);
      return {
        status: "success",
        result,
        provider: LLM_MODEL,
        latencyMs: elapsed(),
      };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.warn(
        `[planner] LLM 第 ${attempt} 次调用失败：${lastError}`
      );
    }
  }

  // 3) 两次均失败：内置模板降级，原因随响应返回
  return {
    status: "degraded",
    result: buildFallbackPlan(input),
    provider: "fallback-template",
    latencyMs: elapsed(),
    degradedReason: `模型调用失败已降级为模板行程：${lastError}`,
  };
}
