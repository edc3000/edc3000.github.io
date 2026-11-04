---
title: "MTP：多 token 预测怎么训练、怎么加速推理"
date: 2026-11-04
description: "MTP 让每个位置额外预测后面几个 token:Meta 的并行多头与 DeepSeek-V3 的串行模块有何不同,DeepSeek MTP 模块的输入(上一深度表示 + 真实 token 的 embedding)、序列对齐与损失(D=1,λ 0.3→0.1);推理时作为投机解码草稿,接受率 85%–90%、约 1.8 倍加速及其估算;与 Medusa、EAGLE 的关系。配手算对齐表、对齐与加速比两个交互实验、PyTorch 代码与高频追问。"
tags: ["llm", "mtp", "deepseek", "投机解码", "架构", "面试"]
order: 15
embed: "/reports/interview/mtp.html"
---
