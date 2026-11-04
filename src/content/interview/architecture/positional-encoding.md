---
title: "位置编码：从 Sinusoidal 到 RoPE 与长度外推"
date: 2026-11-04
description: "为什么需要位置编码;Sinusoidal、可学习绝对位置、T5 bias、ALiBi、RoPE 的对比;RoPE 用旋转让内积只依赖相对位置的推导、远程衰减、频率与 base;长度外推为何会崩,PI、NTK-aware、YaRN(分段插值 + 温度)怎么修;Partial RoPE、MLA 解耦 RoPE、M-RoPE 等新变体。配手算旋转、二维 RoPE 与外推两个交互实验、rotate_half 实现与高频追问。"
tags: ["llm", "位置编码", "rope", "长上下文", "架构", "面试"]
order: 12
embed: "/reports/interview/positional-encoding.html"
---
