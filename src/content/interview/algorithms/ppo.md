---
title: "PPO：从策略梯度到 RLHF 里的四个模型"
date: 2026-11-05
description: "从策略梯度、baseline、重要性采样、TRPO 一步步推到裁剪目标 min(ρA, clip(ρ)A):六种情况哪些有梯度、裁剪不是硬约束、Dual-clip。GAE:TD 误差、k 步估计的指数加权、倒序递推,λ 与 γ 各管什么。RLHF 落地:actor、critic、ref、RM 四个模型,每个 token 扣 β·KL、末尾加 RM 分数,γ=1、λ=0.95,critic 由 RM 初始化与价值裁剪。手算一条 4 token 回答的 GAE,配 GAE 与裁剪曲线两个交互实验、PyTorch 代码、工程细节与高频追问,并与 GRPO、DPO 对比。"
tags: ["llm", "ppo", "强化学习", "rlhf", "gae", "面试"]
order: 8
embed: "/reports/interview/ppo.html"
---
