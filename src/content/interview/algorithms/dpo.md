---
title: "DPO：从 RLHF 推到一个分类损失"
date: 2026-11-03
description: "四步推导:RLHF 目标的最优策略闭式解、反解奖励、代入 Bradley-Terry 消掉配分函数,得到 -log σ(β·对数比之差)。手算一对样本:序列 log 概率由 token 求和、隐式奖励、margin、损失与梯度权重;梯度如何落到每个 token、公共前缀抵消。讲清似然位移、off-policy、长度偏差及 cDPO/IPO/SimPO/KTO/ORPO,并与 PPO、GRPO 对比。"
tags: ["llm", "dpo", "强化学习", "rlhf", "偏好对齐", "面试"]
order: 20
embed: "/reports/interview/dpo.html"
---
