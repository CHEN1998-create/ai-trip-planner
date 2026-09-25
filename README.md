# 漫游 AI · 智能旅游规划 Agent 平台

基于 LLM Agent 的智能旅游行程规划平台：输入出发地、目的地、日期与预算，由 AI Agent 自动生成按天结构化行程、预算拆分与出行建议。

**线上演示**：https://ai-trip-planner-seven-beta.vercel.app

> 国内直连 `vercel.app` 不稳定，建议开启代理访问。演示账号：`e2e-planner@test.local` / `e2e123456`（名下含多条演示行程与管理后台数据），也可自行注册。管理员后台需数据库白名单账号。

## 功能特性

- **智能规划**：7 字段结构化输入（出发地 / 目的地 / 出行日期 / 总预算 / 兴趣偏好 / 旅行节奏），单目的地、3-7 天实时校验拦截
- **Agent 编排**：DeepSeek 驱动，强制 JSON 结构化输出 + 容错解析 + 强校验（天数不符 / 缺条目即拒绝）；调用失败自动重试并优雅降级为内置模板行程，前端全程四阶段状态反馈（解析需求 → 检索 POI → 编排日程 → 核算预算）
- **行程展示**：Day by Day 时间线（时段 / 地点 / 类别 / 费用）、预算分类拆分（彩色占比条）、出行建议
- **历史管理**：行程自动落库、按原条件一键重新生成（新行程另存）、导出 Markdown、1-5 星评分与留言
- **任务状态**：成功 / 降级 / 失败三态管理，每次生成记录提供方、耗时与错误信息，失败任务提供重新生成入口
- **管理后台**：近 7/30 天任务统计（任务数 / 成功率 / 平均耗时）、热门目的地排行、任务日志（含错误记录）、用户反馈列表
- **安全**：Supabase Auth 邮箱注册登录 + Postgres RLS 行级隔离（用户仅能访问自己的数据）；管理员权限由数据库白名单 + `security definer` RPC 控制

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14（App Router）· React 18 · Tailwind CSS · TypeScript |
| 后端 | Next.js Route Handlers（Node Runtime）· LLM Agent 编排层 |
| 数据库 | Supabase Postgres（RLS 行级安全）|
| 鉴权 | Supabase Auth（邮箱 + 密码，SSR 会话） |
| LLM | DeepSeek Chat API（`response_format: json_object`） |
| 部署 | Vercel（Git 集成，push 自动部署） |

## 快速开始

```bash
git clone https://github.com/CHEN1998-create/ai-trip-planner.git
cd ai-trip-planner
npm install
cp .env.local.example .env.local   # 填入 Supabase 配置
npm run dev                        # http://localhost:3000
```

### 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase anon public key |
| `DEEPSEEK_API_KEY` | 否 | DeepSeek API key；未配置时自动降级为内置模板行程 |
| `DEEPSEEK_BASE_URL` | 否 | 默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 否 | 默认 `deepseek-chat` |

> 国内开发注意：`npm run dev` 脚本内置本地代理（`HTTPS_PROXY=http://127.0.0.1:10808`，v2rayN 默认端口）用于服务器端访问 Supabase，请按本机代理端口调整；海外环境可移除这些变量。

### 数据库初始化

在 Supabase SQL Editor 中依次执行：

1. `supabase/schema.sql` —— 五张核心表 + 索引 + RLS 策略（trip_plans / itinerary_days / itinerary_items / planner_runs / trip_feedback）
2. `supabase/admin.sql` —— 管理后台增量（admin_emails 白名单表、`is_admin()` / `admin_dashboard()` RPC、导出时间戳列）

管理员配置：`insert into admin_emails (email) values ('your@email.com');`

## 架构说明

```
浏览器（React 表单/展示）
   │  POST /api/trips/plan（7 字段 JSON）
   ▼
Next.js Route Handler ── Agent 编排层（lib/agent/）
   │  prompt 构建 → DeepSeek 调用（重试 1 次）→ JSON 解析强校验
   │  失败 → 内置模板降级（degraded）
   ▼
Supabase Postgres（RLS 隔离）
   trip_plans → itinerary_days → itinerary_items
   planner_runs（任务日志）· trip_feedback（用户反馈）
```

## 相关文档

- [PRD.md](./PRD.md) —— 产品需求文档（表结构、接口定义、页面与验收标准）
