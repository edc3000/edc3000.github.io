---
title: "Function Call、Tool Call 与 MCP"
date: 2026-11-05
description: "三者分属三层:模型会不会输出调用靠训练,function calling / tool calling 规定调用和结果怎么在应用与模型之间交接,MCP 规定工具怎么被发现、调用和鉴权。讲一次工具调用的完整往返与 OpenAI、Anthropic 的字段对照,chat template 如何把工具渲染进提示词、解析器如何提取调用,strict 模式的约束解码,工具调用能力的训练与评测,工程实践与工具过多的解法;MCP 的架构、三种原语、两种传输、两类错误,以及从 2024-11-05 到 2026-07-28 无状态版本的演进;与 A2A、Skills 的区别和安全风险。配约束解码、三层穿透两个交互实验与高频追问。"
tags: ["llm", "agent", "function calling", "tool calling", "mcp", "面试"]
order: 20
embed: "/reports/interview/tool-calling-mcp.html"
---
