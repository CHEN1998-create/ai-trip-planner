import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "漫游 AI · 智能旅游规划 Agent 平台",
  description:
    "把旅行想法变成可执行的行程：一次表单提交，生成结构化 Day by Day 计划、预算拆分，并支持保存、调整与导出。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#f7f8fc] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
