---
title: "线性注意力：从核技巧到 Gated DeltaNet"
date: 2026-11-04
description: "线性注意力怎么把 softmax 注意力的平方复杂度降到线性:相似度换成特征内积、改变乘法顺序;因果形式就是以矩阵为状态的 RNN,推理不再有随长度增长的 KV cache;训练用分块并行;容量有限、检索弱的原因;RetNet、Mamba2、GLA、DeltaNet、Gated DeltaNet、KDA 的状态更新对比与 delta rule 的在线回归解释;Qwen3-Next、Kimi Linear、MiniMax 的混合架构与 MiniMax-M2 回到全注意力的反例。配手算、开销与记忆容量两个交互实验、PyTorch 代码与高频追问。"
tags: ["llm", "线性注意力", "deltanet", "mamba", "长上下文", "架构", "面试"]
order: 13
embed: "/reports/interview/linear-attention.html"
---
