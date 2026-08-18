---
title: "DAPD:用 Self 分布消除 OPSD 里的信息不对称"
date: 2026-08-17
description: "On-policy 自蒸馏让模型对着参考答案给自己当 teacher,学生推理时却看不到,于是学会凭空断言答案。这篇论文把病因指向信息不对称,并补了一个既可训练、又和 teacher 信息对等的中间分布当桥。Qwen3-4B 六项基准平均 +2.00,且规模越大优势越明显。"
tags: ["llm", "post-training", "distillation", "OPSD", "特权幻觉", "论文精读"]
paperTitle: "DAPD: Dual-Anchored Policy Distillation"
authors: ["Jianyu Wu", "Yizhou Wang", "Encheng Su", "Chen Tang", "Shixiang Tang"]
venue: "arXiv preprint"
year: 2026
arxivUrl: "https://arxiv.org/abs/2608.01735"
codeUrl: "https://github.com/uanu2002/DAPD"
verdict: "teacher 比学生更强不是问题,teacher 比学生多看到东西才是问题——复现不出来的那部分监督,不会变成能力,只会变成腔调。"
richReport: "/reports/papers/dapd-dual-anchored-policy-distillation.html"
---
