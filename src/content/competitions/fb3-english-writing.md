---
title: "FB3 英语写作评分:铜牌复盘"
date: 2026-06-09
description: "Kaggle Feedback Prize - English Language Learning 铜牌方案复盘,282/2655。六维度作文评分任务的建模思路与提交策略。"
tags: ["kaggle", "nlp", "回归", "教育"]
platform: kaggle
medal: bronze
rank: 282
totalTeams: 2655
rankNote: "公开榜名次"
metric: MCRMSE
publicLB: 0.437237
competitionUrl: "https://www.kaggle.com/competitions/feedback-prize-english-language-learning"
---

生成日期：2026-06-09  
Kaggle 账号：[liangyan0322](https://www.kaggle.com/liangyan0322)  
比赛：[Feedback Prize - English Language Learning](https://www.kaggle.com/competitions/feedback-prize-english-language-learning)

## 1. 成绩摘要

| 项目 | 结果 |
|---|---|
| 队伍 | `big-ikun` |
| 队友 | `daveivan`, `kylechennn`, `pengxiyang` |
| 公开榜名次 | 282 / 2655 |
| 公开榜分数 | 0.437237 |
| 提交数 | 35 |
| 最后提交时间 | 2022-11-29 13:41:46 |
| 奖牌 | 铜牌 |

口径说明：公开榜名次来自 Kaggle leaderboard；提交历史中的 public/private score 与 leaderboard 展示口径不同，本报告分开记录。

## 2. 比赛任务

这是一个英语学习者作文自动评分任务。输入是一篇学生英文作文，输出 6 个维度的写作质量分数：

- `cohesion`
- `syntax`
- `vocabulary`
- `phraseology`
- `grammar`
- `conventions`

6 个标签都是连续数值，训练集中取值从 1.0 到 5.0，步长多为 0.5。因此这是 **多输出文本回归**，不是分类。

指标是 **MCRMSE**：对 6 个目标分别计算 RMSE，再取平均。分数越低越好。

## 3. 输入输出细节

数据文件来自 `/tmp/kaggle_report_data/fb3`。

| 文件 | 行列 | 字段 | 说明 |
|---|---:|---|---|
| `train.csv` | 3911 x 8 | `text_id`, `full_text`, 6 个目标列 | 训练作文和 6 维人工评分 |
| `test.csv` | 3 x 2 | `text_id`, `full_text` | Kaggle sample test；真实隐藏测试集更大 |
| `sample_submission.csv` | 3 x 7 | `text_id`, 6 个目标列 | 每篇作文输出 6 个预测分数 |

提交格式：

```csv
text_id,cohesion,syntax,vocabulary,phraseology,grammar,conventions
0000C359D63E,3.0,3.0,3.0,3.0,3.0,3.0
```

训练集目标分布：

| 目标 | mean | std | min | median | max |
|---|---:|---:|---:|---:|---:|
| `cohesion` | 3.1271 | 0.6625 | 1.0 | 3.0 | 5.0 |
| `syntax` | 3.0283 | 0.6444 | 1.0 | 3.0 | 5.0 |
| `vocabulary` | 3.2357 | 0.5831 | 1.0 | 3.0 | 5.0 |
| `phraseology` | 3.1168 | 0.6560 | 1.0 | 3.0 | 5.0 |
| `grammar` | 3.0329 | 0.6998 | 1.0 | 3.0 | 5.0 |
| `conventions` | 3.0811 | 0.6715 | 1.0 | 3.0 | 5.0 |

## 4. 你的提交记录

关键高分提交：

| ref | 时间 | publicScore | privateScore | 备注 |
|---:|---|---:|---:|---|
| 29105537 | 2022-11-27 05:47:16 | 0.437319 | 0.436337 | 提交历史中 private score 最低 |
| 29127345 | 2022-11-28 15:03:43 | 0.437299 | 0.436395 | 接近最优 |
| 29143605 | 2022-11-29 13:41:46 | 0.437413 | 0.436433 | 与公开榜最后提交时间一致 |
| 28683293 | 2022-10-30 07:29:08 | 0.437237 | 0.436469 | publicScore 与公开榜展示 score 一致 |

说明：最终提交描述有些为空，所以只能根据提交时间、分数和你名下 notebook 推断方法链路。最稳妥说法是“最终是 DeBERTa family ensemble 这一类方案”。

## 5. 你的方案方法

主要 notebook：

- 本地：`/tmp/kaggle_report_notebooks/fb3/fb3-deberta-family-inference-weight-tune/fb3-deberta-family-inference-weight-tune.ipynb`
- Kaggle：[FB3 Deberta Family Inference weight tune](https://www.kaggle.com/code/liangyan0322/fb3-deberta-family-inference-weight-tune)

一句话概括：

> 把作文作为长文本输入，用多个 DeBERTa 系列 transformer 做 6 维回归；每个模型做 10-fold 平均，最后再对多个模型族做加权平均。

模型族：

| 配置 | backbone | fold | ensemble weight |
|---|---|---:|---:|
| CFG1 | `microsoft/deberta-v3-base` | 10 | 1.0 |
| CFG2 | `microsoft/deberta-v3-large` | 10 | 1.0 |
| CFG3 | `microsoft/deberta-v2-xlarge` | 10 | 1.0 |
| CFG4 | `microsoft/deberta-v3-base` + FGM 版本 | 10 | 1.0 |
| CFG5 | `microsoft/deberta-v3-large` + FGM 版本 | 10 | 1.0 |
| CFG6 | `microsoft/deberta-v2-xlarge` | 10 | 2.0 |
| CFG7 | `microsoft/deberta-v2-xlarge-mnli` | 10 | 3.0 |
| CFG8 | `microsoft/deberta-v3-large` | 10 | 3.0 |
| CFG9 | `microsoft/deberta-v3-large` | 10 | 3.0 |
| CFG10 | `microsoft/deberta-v3-large` | 10 | 3.0 |

单模型结构：

```text
full_text
  -> DeBERTa tokenizer
  -> AutoModel
  -> MeanPooling
  -> Linear(hidden_size, 6)
  -> cohesion/syntax/vocabulary/phraseology/grammar/conventions
```

推理和融合：

- 按 token 长度排序 test，减少 padding，提高推理效率。
- 每个配置加载 10 个 fold 的 `*_fold{fold}_best.pth`。
- 每个配置先做 fold 平均。
- 10 个配置再按权重加权平均。
- 最终写出 `submission.csv`。

你还尝试过：

- DeBERTa + SVR embedding ensemble
- DeBERTa + LightGBM / XGBoost / CatBoost stacking
- BERT baseline
- model mean

## 6. 金牌方案

一手来源：

- Kaggle discussion：[1st Place Solution](https://www.kaggle.com/competitions/feedback-prize-english-language-learning/discussion/369457)
- 训练代码：[GitHub](https://github.com/rohitsingh02/kaggle-feedback-english-language-learning-1st-place-solution)

金牌方案核心：

- 多模型、多 pooling、多 max length 的大规模 ensemble。
- 交叉验证使用 `MultilabelStratifiedKFold`。
- 主模型包括 `deberta-v3-base`、`deberta-v3-large`、`deberta-v2-xlarge`、`roberta-large`、`distilbert-base-uncased`。
- pooling 包括 MeanPooling、ConcatPooling、WeightedLayerPooling、GeM Pooling、LSTM Pooling。
- 训练技巧包括不同 max length、冻结部分层、顶层 re-init、differential learning rate、AWP、pseudo label。
- 额外用 `facebook/bart-large`、`all_datasets_v3_roberta-large`、`facebook/bart-large-mnli` 抽 embedding，再训练 SVR 加入 ensemble。
- ensemble 权重用 Optuna 基于 OOF 调参，而且按 6 个目标分别调权重。

金牌报告给出的 Final Ensemble：

| CV | Public LB | Private LB |
|---:|---:|---:|
| 0.44096 | 0.433821 | 0.433356 |

你和金牌的主要差距：

| 维度 | 你的方案 | 金牌方案 |
|---|---|---|
| 主体模型 | DeBERTa family | DeBERTa + RoBERTa + DistilBERT + embedding/SVR |
| pooling | 主要 MeanPooling | 多 pooling |
| 融合 | 固定权重加权平均 | Optuna target-wise OOF 权重优化 |
| 训练技巧 | FGM/多模型版本 | AWP、PL、re-init、differential LR |
| 特征多样性 | transformer regression 为主 | transformer + embedding + SVR |

## 7. 面试话术

30 秒版本：

> 这场是英语作文 6 维评分任务，指标是 MCRMSE。我把它做成多输出文本回归，用 DeBERTa-v3-base/large、DeBERTa-v2-xlarge 等模型，结构是 transformer + mean pooling + 6 维 regression head。每个模型做 10-fold 平均，再做模型级 weighted average，最终拿到 public rank 282/2655 的铜牌。

2 分钟版本：

> 数据只有 3911 篇作文，但每篇有 6 个连续评分维度，所以 CV 和 ensemble 稳定性很重要。我用 DeBERTa family 作为主模型，每个模型输出 6 个分数，推理时先 fold average，再模型加权平均。相比金牌，我的方案更多是同类强模型集成；金牌进一步通过多 pooling、AWP、pseudo label、SVR embedding 和 target-wise OOF 权重调参降低模型相关性，这是后续可以提升的方向。

被追问时可以展开：

- MCRMSE 如何计算。
- 为什么这是回归不是分类。
- 为什么 DeBERTa 适合长文本评分。
- MeanPooling 和 CLS pooling 的区别。
- 为什么 OOF 对 ensemble weight tuning 很重要。
- public/private leaderboard shake 的风险。

## 8. 后续优化建议

- 重建统一 CV 框架，保存每个模型 OOF。
- 加入 `WeightedLayerPooling`、`ConcatPooling`，与 MeanPooling 对比。
- 用 Optuna / hill climbing 做 target-wise ensemble weight。
- 加入 SVR on embeddings，提供低相关性模型。
- 记录 per-target RMSE，分别优化 grammar、conventions 等弱项。
- 准备 ablation 表，面试时展示你理解“为什么涨分”。

