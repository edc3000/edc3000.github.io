---
title: "StartLux-Decision:只在没把握时才思考的决策模型"
date: 2026-10-21
description: "决策模型用一次前向在最后一个 prompt 位置读出选项字母的概率。StartLux-Decision 在这个接口上分出两个变体:Instant 给全注意力层换成双向注意力;AutoThink 只在最高概率低于 0.9 时生成推理,再按 1:3 融合推理前后两次读出。推理先 SFT 教会生成和结束,再用 RLCD² 以「推理让概率质量提升多少」为奖励、加软长度惩罚,9B 推理正常结束率 45.9%→93.9%、长度 −65%。另附置信度经 best-of-N 或路由后失真的策略感知校准。"
tags: ["llm", "post-training", "rl", "calibration", "decision-model", "论文精读"]
paperTitle: "StartLux-Decision: AutoThink Decision Models with Reinforcement Learning for Calibrated Deliberative Decisions"
authors: ["Xialie Zhuang", "Zunhai Su", "Jia Pan", "Ngai Wong", "Guanhua Chen", "Chuan-Wei Kuo"]
venue: "arXiv preprint"
year: 2026
arxivUrl: "https://arxiv.org/abs/2610.17309"
codeUrl: "https://github.com/StartLuxLabs/StartLux-Decision"
verdict: "给决策模型接上推理,奖励该给「想完之后概率变好了多少」而不是「答对没有」;而同一个置信度,换了下游的挑选或路由策略就得重新校准。"
richReport: "/reports/papers/startlux-decision.html"
---
