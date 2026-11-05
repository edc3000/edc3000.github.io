---
title: "FP32、FP16、BF16、FP8、FP4：数值精度与混合精度训练"
date: 2026-11-05
description: "浮点数的符号、指数、尾数,指数位管范围、尾数位管精度;FP32、TF32、FP16、BF16、FP8 E4M3/E5M2、FP4 E2M1、E8M0 的速查表;FP16 与 BF16 怎么选,TF32 是什么;混合精度训练的 FP32 主权重、loss scaling、FP32 累加与每参数 16 字节;FP8 训练的缩放因子、delayed 与 current scaling、DeepSeek-V3 的细粒度方案;MXFP8、MXFP4、NVFP4 微缩放格式与 NVFP4 预训练;推理量化(W4A16、W8A8、KV cache)与常见数值坑。配编码、累加、缩放粒度三个交互实验与高频追问。"
tags: ["llm", "fp16", "bf16", "fp8", "混合精度", "量化", "面试"]
order: 15
embed: "/reports/interview/numeric-precision.html"
---
