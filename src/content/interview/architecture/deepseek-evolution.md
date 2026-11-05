---
title: "DeepSeek 架构演进：从 V2 到 V4.1"
date: 2026-11-05
description: "按 MoE、注意力、残差与训练、后训练几条线梳理 DeepSeek:DeepSeekMoE 的细粒度专家与共享专家,V2 的辅助损失到 V3 的无辅助损失偏置均衡,V4 的哈希路由与 sqrt(softplus) 打分;MLA 缓存潜向量、V3.2 的 DSA 闪电索引器只读 top-2048、V4 的 CSA(压缩 4 倍再稀疏)与 HCA(压缩 128 倍)交替加滑动窗口,1M 上下文 KV cache 为 V3.2 的 10%;V4 的 mHC(双随机矩阵约束的多通道残差)与 Muon;MTP、FP8、DualPipe;R1-Zero 与 R1、V3.1 混合思考、V4 专家模型加 on-policy 蒸馏;V4.1-Flash 的因果编码器-解码器、CSA2 跨层共享、Engram 条件记忆与 FP4 KV。配时间线、示意图、注意力读取量交互实验与高频追问。"
tags: ["llm", "deepseek", "架构", "moe", "mla", "稀疏注意力", "面试"]
order: 11
embed: "/reports/interview/deepseek-evolution.html"
---
