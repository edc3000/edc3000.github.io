---
title: "KV Cache：显存账、访存瓶颈与压缩"
date: 2026-11-05
description: "因果 mask 让过去的 K、V 不变,所以能缓存、不必存 Q;每 token 2·L·g·d_h·b 字节,Llama-3.1-8B 128 KiB、32K 一条 4 GiB,对比 MHA、GQA、MLA。decode 是访存瓶颈:线性层靠 batch 摊薄,注意力算术强度约 h/g、与 batch 无关;手算 H100 跑 Llama-3.1-8B 能放几条、每步多久、FP8 为什么让吞吐翻倍。按公式逐项压缩:GQA、MLA 与解耦 RoPE、KIVI 量化、滑动窗口与 StreamingLLM、跨层共享与混合线性注意力。配显存与 decode 速度计算器、代码与高频追问;引擎层面的 PagedAttention、前缀缓存与调度见 vLLM 篇。"
tags: ["llm", "kv cache", "推理", "gqa", "mla", "面试"]
order: 10
embed: "/reports/interview/kv-cache.html"
---
