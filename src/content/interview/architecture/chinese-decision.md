---
title: "决策模型：推理与训练拆解"
date: 2026-10-28
description: "以 chinese-decision 为例拆解用 LLM 做决策/分类:推理只做一次前向,读末位候选字母的 logits,在候选内做带温度的 softmax,再按 noul/choice/score 组装答案;训练用软标签分布交叉熵、只更新 LoRA,2B 额外加 RLCD,按分布 NLL 选模并事后拟合温度。配 logits、交叉熵与 RLCD 交互实验。"
tags: ["llm", "qwen", "决策模型", "lora", "软标签", "校准", "面试"]
order: 20
group: "决策模型"
embed: "/reports/interview/chinese-decision.html"
---
