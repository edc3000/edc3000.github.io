---
title: "多模态大模型基础：视觉编码、模态对齐、动态分辨率与原生多模态"
date: 2026-11-24
description: "多模态大模型（MLLM / VLM）基础八股：四种架构范式（Encoder+MLP 拼接、Cross-Attention 注入、原生早期融合、理解与生成解耦）；从原始 RGB 图片到 ViT 输出的 6 步端到端链路与张量形状（预处理、Conv2d Patchify 等价性、Sequence Packing 与 cu_seqlens、2D-RoPE、ViT 取层与原位替换进 LLM）；CLIP InfoNCE 与 SigLIP Sigmoid 损失对比（含初始负偏置原理）；MLP、Q-Former 与 2×2 Pixel Shuffle / Patch Merger 连接器；Fixed Resize、AnyRes 动态切图与 NaViT 原生动态分辨率；MRoPE / Interleaved-MRoPE 位置编码与 Attention/Loss Mask；视频 3D 压缩与音频 Omni（Thinker-Talker）；四阶段训练与防语言遗忘；多下游任务统一范式（VQA、OCR、Grounding 归一化/绝对坐标、GUI Agent、视频定位、LISA 分割与多任务混训 Loss 平衡）；离散 VQ 与连续扩散统一架构（MoT）；视觉幻觉、FastV 剪枝与多模态推理引擎 Prefix Caching。配原图→ViT 交互步进演示、CLIP vs SigLIP 梯度实验、视觉 Token 与 KV Cache 计算器、手撕代码与 13 道高频追问。"
tags: ["llm", "multimodal", "vlm", "vit", "clip", "面试"]
order: 20
embed: "/reports/interview/multimodal.html"
---
