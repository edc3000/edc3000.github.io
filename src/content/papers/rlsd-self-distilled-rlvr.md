---
title: "RLSD:自蒸馏只决定 token 权重,方向交给 verifier"
date: 2026-11-12
description: "OPSD 让看过参考答案的同一个模型当 teacher,学生却永远看不到参考答案:损失里有一块与参数无关的互信息学不掉,单样本梯度里带着不随训练消失的 r 相关偏差,于是验证分数 10–20 步见顶、模型开始引用不存在的参考解,把目标压到 top-1 也挡不住。RLSD 改成用 verifier 的组内 advantage 定方向,用 teacher 与 student 的证据比 P_T/P_S 在同一条回答内分配 credit,裁剪后乘进 advantage、不翻转符号。Qwen3-VL-8B 五个多模态推理 benchmark 平均 56.18,比 GRPO 高 2.32;但按论文超参,teacher 只在前 50 步以至多 ±10% 的幅度起作用。"
tags: ["llm", "post-training", "rl", "distillation", "OPSD", "特权幻觉", "论文精读"]
paperTitle: "Self-Distilled RLVR"
authors: ["Chenxu Yang", "Chuanyu Qin", "Qingyi Si", "Minghui Chen", "Naibin Gu", "Dingyu Yao", "Zheng Lin", "Weiping Wang", "Jiaqi Wang", "Nan Duan"]
venue: "arXiv preprint"
year: 2026
arxivUrl: "https://arxiv.org/abs/2604.03128"
verdict: "特权信息的问题不在它影响多少,而在它能不能决定梯度指向哪里——同一个 P_T/P_S,当蒸馏目标会泄漏,当乘在 advantage 上的有界正数就不会。"
richReport: "/reports/papers/rlsd-self-distilled-rlvr.html"
---
