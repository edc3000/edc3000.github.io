---
title: "Pi、Codex、Claude Code：三种 Coding Agent 的设计取舍"
date: 2026-11-04
description: "三个 coding agent 的骨架是同一个 agent loop,循环细节有差别:每次发完整历史与保住缓存前缀、一次多个工具调用的执行方式、两种插话队列、压缩时机、Stop hook 否决结束。harness 的取舍:Pi 只有四个工具、不弹审批、靠容器隔离、用 TypeScript 扩展;Codex 用系统沙箱加审批策略,默认工作区可写、断网;Claude Code 内置工具多,权限是规则加模式,auto 模式由分类器审查,沙箱可选。对比默认工具、改文件方式、指令文件、长会话压缩、MCP 的延迟加载与 codemode、skills、hooks、子 agent。配 MCP 上下文开销的交互实验、最小 agent 代码与高频追问。"
tags: ["llm", "agent", "coding agent", "claude code", "codex", "pi", "面试"]
order: 10
embed: "/reports/interview/coding-agents.html"
---
