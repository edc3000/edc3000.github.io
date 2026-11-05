---
title: "vLLM：从 PagedAttention 到 V1 引擎与 Model Runner V2"
date: 2026-11-05
description: "vLLM 从 v0.1(2023.06)到 v0.32(2026.10)的四个阶段:PagedAttention 起家;V0 补齐多 LoRA、自动前缀缓存、FP8、投机解码、多步调度;V1 重写(进程拆分、不分 prefill 与 decode 的统一 token 调度、torch.compile 与分段 CUDA graph),v0.11 删光 V0;异步调度默认、Model Runner V2 全面默认、多层 KV 卸载、v0.25 删除旧 PagedAttention kernel。讲清 PagedAttention 的块表与写时复制、前缀缓存的块哈希与 LRU 淘汰、调度器怎么分 token 预算与抢占、FULL_AND_PIECEWISE、DP/EP/PD 分离与 KV connector、关键参数与 KV cache 大小怎么定。配调度器模拟实验、带前缀缓存的块管理器代码与高频追问。"
tags: ["llm", "vllm", "推理", "pagedattention", "prefix caching", "面试"]
order: 20
embed: "/reports/interview/vllm.html"
---
