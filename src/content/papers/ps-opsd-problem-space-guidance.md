---
title: "PS-OPSD:从完整解答转向问题求解结构"
date: 2026-08-18
description: "同样是给 teacher 塞特权信息,塞完整参考解答还是塞问题空间结构,结果不一样。这篇把 OPSD 的教师输入换成初始状态、目标条件、约束和一条状态迁移路径,学生显式引用不可见答案的比例从 3.0% 降到 0.5%,Qwen3 三个规模的三项 benchmark 平均准确率都高于所有比较方法。"
tags: ["llm", "post-training", "distillation", "OPSD", "特权幻觉", "论文精读"]
paperTitle: "Is More Privileged Information Better? From Solution Traces to Problem-Solving Structure in Self-Distilled Reasoning"
authors: ["Xuyang Zhao", "Liting Zhang", "Zichen Xu", "Zhihu Wang", "Xu Caiyue", "Shiwan Zhao", "Qicheng Li"]
venue: "arXiv preprint"
year: 2026
arxivUrl: "https://arxiv.org/abs/2608.01589"
verdict: "特权信息该比的不是信息量,而是有多少能被学生自己的输入重建出来——完整解答把通用关系和这一题的答案、顺序、措辞绑死了,问题空间指导没有。"
richReport: "/reports/papers/ps-opsd-problem-space-guidance.html"
---
