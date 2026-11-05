---
title: "FlashAttention：IO 感知、online softmax 与四代演进"
date: 2026-11-05
description: "标准注意力把 N×N 的 S、P 写进 HBM 再读出,是访存瓶颈;FlashAttention 分块进 SRAM,用 online softmax 边扫边修正最大值和分母,只写回 O 和 logsumexp,反向用 L 重算 P;IO 从 Θ(Nd+N²) 降到 Θ(N²d²/M)。手算 4 个 key 分两块的 online softmax。FA2 调换循环顺序、沿序列并行、Q 切给 warp、减少非矩阵乘运算;FA3 在 H100 上用 warp 专门化、乒乓调度和 FP8;FA4 在 B200 上用多项式模拟 exp、条件重缩放、TMEM 与 2-CTA。推理侧的 Flash-Decoding、分页 KV、FlashInfer、FlashMLA。配 online softmax 交互实验、分块前向代码与高频追问。"
tags: ["llm", "flashattention", "注意力", "gpu", "推理", "面试"]
order: 15
embed: "/reports/interview/flash-attention.html"
---
