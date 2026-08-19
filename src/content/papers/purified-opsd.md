---
title: "Purified OPSD:从 teacher 信号中减去参考答案捷径"
date: 2026-08-19
description: "标准 OPSD 用在 long-CoT 模型上会把反思能力训坏:teacher 手里有参考答案,它给出的 token 级监督主要在教「照着答案往下写」。这篇多跑一次 reference-only forward,把只靠参考答案就能预测的那部分减掉,只留问题带来的增量,再重整成可蒸馏的 PMI target。八种 model × dataset 组合全部超过 base,最大 +4.2。"
tags: ["llm", "post-training", "distillation", "OPSD", "特权幻觉", "论文精读"]
paperTitle: "Purified OPSD: On-Policy Self-Distillation Without Losing How to Think"
authors: ["Zhanming Shen", "Jintao Tong", "Shaotian Yan", "Chen Shen", "Hao Chen", "Wentao Ye", "Xiaomeng Hu", "Rui Miao", "Haobo Wang", "Junbo Zhao", "Gang Chen", "Jieping Ye"]
venue: "arXiv preprint"
year: 2026
arxivUrl: "https://arxiv.org/abs/2607.02234"
verdict: "teacher 多看到的东西不止让它更强,还让它把「照着答案往下写」当成了要教的内容——这部分不减掉,蒸馏越久,模型越不会自己想。"
richReport: "/reports/papers/purified-opsd.html"
---
