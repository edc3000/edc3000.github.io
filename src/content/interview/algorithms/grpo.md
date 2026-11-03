---
title: "GRPO：具体怎么算，怎么落到每个 token"
date: 2026-11-03
description: "从一组数字算到底:同一问题采样 G 个回答,组内标准化得到序列级优势,优势复制到每个 token;每个 token 单独算 π_θ/π_old 比值、clip 取 min、k3 KL,再先句内平均、后组内平均。讲清逐 token 梯度、单步 on-policy 退化为 REINFORCE、长度偏差与 DAPO / Dr. GRPO 的改法。配手算表、交互实验、PyTorch 代码与高频追问。"
tags: ["llm", "grpo", "强化学习", "rlhf", "面试"]
order: 10
embed: "/reports/interview/grpo.html"
---
