---
title: "Transformer：注意力、结构与参数量"
date: 2026-11-04
description: "缩放点积注意力逐步拆解与手算,为什么除以 √d_k;Mask 全解:注意力 mask、loss mask、BERT 的 [MASK] 三者区别,padding、causal、prefix LM、序列打包、滑动窗口等形状,左填充、整行 NaN、decode 阶段与 API 约定等工程坑;多头注意力的张量形状与 MQA/GQA;FFN 与 SwiGLU、残差与 Norm;三种架构对比及 decoder-only 为何成为主流;参数量(LLaMA-7B 算出 6.74B)、计算量与 KV cache。配注意力热力图、mask 可视化、参数与 KV cache 计算器三个交互实验,手撕 MHA 与高频追问。"
tags: ["llm", "transformer", "attention", "面试"]
order: 5
embed: "/reports/interview/transformer.html"
---
