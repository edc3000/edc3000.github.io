---
title: "Megatron-LM：张量并行、流水线并行与 5D 并行"
date: 2026-11-06
description: "张量并行为什么先列切后行切、每层几次通信;序列并行与选择性重计算的激活显存公式;流水线并行的气泡、1F1B 与交错式调度;上下文并行的 KV 交换与负载均衡;专家并行的分发器与 MoE 并行折叠;分布式优化器与 Megatron-FSDP;5D 并行怎么组合;2026 年的 HybridModel、广义张量并行与逐位确定性训练;与 DeepSpeed、FSDP 的对比。配流水线调度、并行配置计算器两个交互实验与高频追问。"
tags: ["llm", "megatron", "张量并行", "流水线并行", "分布式训练", "infra", "面试"]
order: 35
embed: "/reports/interview/megatron.html"
---
