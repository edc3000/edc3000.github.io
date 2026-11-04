---
title: "LoRA：低秩适配怎么省、怎么训、怎么部署"
date: 2026-11-04
description: "冻结 W0、旁路训练低秩增量 ΔW=(α/r)BA:参数从 dk 降到 r(d+k);从线性代数解释为什么低秩够用(秩的几何含义、SVD 与 Eckart–Young、自由度与有效秩、梯度是秩 1 外积的累加、反例);A 随机、B 为 0 的初始化与梯度推导;α/r 缩放、r 与学习率怎么取、加在哪些层;省的是梯度和优化器状态,激活基本没省(LLaMA-7B 全参约 100 GiB、LoRA 约 13 GiB、QLoRA 约 4 GiB);QLoRA 的 NF4、双重量化与分页优化器;合并部署与多 adapter;DoRA、LoRA+、rsLoRA、PiSSA 等变体及与 Adapter、Prefix Tuning 的对比。配手算秩 1 例子、显存计算器与低秩近似两个交互实验。"
tags: ["llm", "lora", "peft", "微调", "面试"]
order: 5
embed: "/reports/interview/lora.html"
---
