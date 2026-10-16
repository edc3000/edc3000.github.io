---
title: "pi 内部结构:一个 coding agent harness 的分层、循环与会话树"
date: 2026-10-16
description: "拆解 earendil-works/pi:pi-ai 把 10 种模型 API 收敛成一套流式事件,pi-agent-core 只管两层 agent 循环,pi-coding-agent 负责工具、JSONL 会话树、上下文压缩与扩展 hook。以「修复 src/math.ts 里 add 的 bug」一次请求贯穿,逐步对照源码行号与会话文件的增长。"
tags: ["agent", "harness", "coding-agent", "源码解读"]
language: TypeScript
repoUrl: "https://github.com/earendil-works/pi"
richReport: "/reports/algorithms/pi-agent-harness.html"
---
