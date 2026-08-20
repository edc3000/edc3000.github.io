---
title: "DASD:把长 CoT 蒸馏拉回完整回答分布"
date: 2026-08-20
description: "在 teacher 生成的 CoT 上做 SFT,等于拿一条采样轨迹近似 teacher 的完整回答分布。这篇顺着覆盖范围、可学范围、推理状态三处失配,拆成低温→高温的温度调度、按 teacher 与 student 概率差筛句子的 DAS,以及让 student 自己写前缀、teacher 修订后缀的 mixed-policy。448K 样本训出的 4B 模型 AIME25 83.3、LiveCodeBench v5 69.3。"
tags: ["llm", "post-training", "distillation", "论文精读"]
paperTitle: "Distribution-Aligned Sequence Distillation for Superior Long-CoT Reasoning"
authors: ["Shaotian Yan", "Kaiyuan Liu", "Chen Shen", "Bing Wang", "Sinan Fan", "Jun Zhang", "Yue Wu", "Zheng Wang", "Jieping Ye"]
venue: "arXiv preprint"
year: 2026
arxivUrl: "https://arxiv.org/abs/2601.09088"
codeUrl: "https://github.com/D2I-ai/dasd-thinking"
verdict: "同样的损失函数、同样的 teacher,喂进去哪些回答决定了上限——蒸馏的可调空间在数据侧,不在目标函数侧。"
richReport: "/reports/papers/dasd-distribution-aligned-sequence-distillation.html"
---
