---
title: "MAP 数学误解识别:铜牌复盘"
date: 2026-06-09
description: "Kaggle MAP - Charting Student Math Misunderstandings 铜牌方案复盘,94/1857。教育 NLP 分类排序任务的方案与 91 次提交的迭代过程。"
tags: ["kaggle", "nlp", "分类", "教育"]
platform: kaggle
medal: bronze
rank: 94
totalTeams: 1857
rankNote: "公开榜名次"
metric: "MAP@3"
publicLB: 0.94980
competitionUrl: "https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings"
---

生成日期：2026-06-09  
Kaggle 账号：[liangyan0322](https://www.kaggle.com/liangyan0322)  
比赛：[MAP - Charting Student Math Misunderstandings](https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings)

## 1. 成绩摘要

| 项目 | 结果 |
|---|---|
| 队伍 | `liangyan0322` |
| 队友 | `yzy2023301147` |
| 公开榜名次 | 94 / 1857 |
| 公开榜分数 | 0.94980 |
| 提交数 | 91 |
| 最后提交时间 | 2025-10-15 06:17:20 |
| 奖牌 | 铜牌 |

口径说明：公开榜名次来自 Kaggle leaderboard；提交历史中的 public/private score 与 leaderboard 展示口径不同，本报告分开记录。

## 2. 比赛任务

这是一个教育 NLP 分类/排序任务。输入是：

- 数学题题干 `QuestionText`
- 学生选择的多选答案 `MC_Answer`
- 学生写的解释 `StudentExplanation`

输出是每行最可能的 3 个 `Category:Misconception` 组合标签，按可能性从高到低排列。

`Category` 表示学生答案和解释的大类，例如：

- `True_Correct`
- `False_Misconception`
- `False_Neither`
- `True_Neither`
- `True_Misconception`
- `False_Correct`

`Misconception` 表示具体数学误解；没有具体误解时填 `NA`。

指标是 **MAP@3**：正确组合标签排第 1 得 1 分，排第 2 得 1/2，排第 3 得 1/3，没进前三得 0。分数越高越好。

## 3. 输入输出细节

数据文件来自 `/tmp/kaggle_report_data/map`。

| 文件 | 行列 | 字段 | 说明 |
|---|---:|---|---|
| `train.csv` | 36696 x 7 | `row_id`, `QuestionId`, `QuestionText`, `MC_Answer`, `StudentExplanation`, `Category`, `Misconception` | 训练样本 |
| `test.csv` | 3 x 5 | `row_id`, `QuestionId`, `QuestionText`, `MC_Answer`, `StudentExplanation` | Kaggle sample test；真实隐藏测试集更大 |
| `sample_submission.csv` | 3 x 2 | `row_id`, `Category:Misconception` | 每行输出 3 个空格分隔标签 |

训练集特征：

- 样本数：36696
- `QuestionId`：15 个
- `QuestionText`：15 个
- `MC_Answer`：49 个
- `Category`：6 类
- `Misconception`：36 个取值，包括缺失；缺失填 `NA`
- `Category:Misconception` 组合标签：65 类

提交格式：

```csv
row_id,Category:Misconception
36696,True_Correct:NA False_Neither:NA False_Misconception:Incomplete
```

这不是分别输出 `Category top3` 和 `Misconception top3`，而是输出 **组合标签 top3**。

## 4. 你的提交记录

关键高分提交：

| ref | 时间 | publicScore | privateScore | 备注 |
|---:|---|---:|---:|---|
| 47411232 | 2025-10-15 06:17:20 | 0.94980 | 0.94615 | 最后提交，与公开榜时间一致 |
| 47365921 | 2025-10-13 10:29:49 | 0.94980 | 0.94615 | 同分 |
| 47235561 | 2025-10-07 09:32:59 | 0.94972 | 0.94634 | 提交历史中 private score 最高 |
| 47144818 | 2025-10-02 11:29:19 | 0.94945 | 0.94634 | 同最高 private score |

说明：最后提交 description 为空，所以只能根据你名下 notebook、提交时间和分数推断方法。最稳妥说法是“与 `LB 0.946 The Art of Ensemble V2` notebook 方法一致的多模型 rank ensemble”。

## 5. 你的方案方法

主要 notebook：

- 本地：`/tmp/kaggle_report_notebooks/map/lb-0-946-the-art-of-ensemble-v2/lb-0-946-the-art-of-ensemble-v2.ipynb`
- Kaggle：[LB 0.946 The Art of Ensemble V2](https://www.kaggle.com/code/liangyan0322/lb-0-946-the-art-of-ensemble-v2)

一句话概括：

> 把 `Category` 和 `Misconception` 拼成 65 类组合标签；把题目、学生选项、答案是否正确、学生解释拼成 prompt；用多个 transformer/LLM classifier 输出 65 类概率；最后做加权 rank ensemble，输出 top3 组合标签。

### 5.1 标签构造

训练集原本有两列：

```text
Category
Misconception
```

你先把缺失的 `Misconception` 填成 `NA`，再拼成目标：

```python
target = Category + ":" + Misconception
```

例如：

```text
True_Correct + NA -> True_Correct:NA
False_Misconception + Incomplete -> False_Misconception:Incomplete
```

再用 `LabelEncoder` 编码成 65 类分类标签。

### 5.2 测试时 prompt 如何组成

原始 test 一行：

```text
QuestionId
QuestionText
MC_Answer
StudentExplanation
```

你额外构造 `Correct?`。这个字段不是 test 自带的，而是从训练集推断：

```text
对每个 QuestionId，找 Category 以 True 开头的样本；
按 MC_Answer 统计；
出现最多的 MC_Answer 当作该题正确答案；
测试时 MC_Answer 等于正确答案就是 Correct? Yes，否则 No。
```

实际 prompt 模板：

```text
Question: {QuestionText}
Answer: {MC_Answer}
Correct? {Yes/No}
Student Explanation: {StudentExplanation}
```

例子：

```text
Question: What fraction of the shape is not shaded? Give your answer in its simplest form. [Image: A triangle split into 9 equal smaller triangles. 6 of them are shaded.]
Answer: \( \frac{3}{6} \)
Correct? No
Student Explanation: i think this answer is because 3 triangles are white and 6 triangle are blue.
```

然后 tokenizer 截断到 `max_length=256`，送入模型。

### 5.3 模型结构

单模型结构：

```text
prompt
  -> tokenizer
  -> Transformer / LLM backbone
  -> sequence classification head
  -> 65 类 Category:Misconception logits
```

你的 notebook 中核心结构是：

```python
AutoModelForSequenceClassification.from_pretrained(
    model_path,
    num_labels=n_classes
)
```

其中 `n_classes = 65`。

使用的子模型：

| 模型 | 结构角色 |
|---|---|
| Gemma2-9B-it + LoRA | LLM backbone + classification head |
| Ettin Encoder 1B | encoder backbone + classification head |
| ModernBERT Large | encoder backbone + classification head |
| DeepSeek Math 7B | math-oriented LLM classifier |

Gemma2 等 LoRA 模型通过 `PeftModel.from_pretrained` 加载 adapter。

### 5.4 模型输出和 ensemble

单个模型原始输出是 65 类 logits：

```text
[logit_0, logit_1, ..., logit_64]
```

softmax 后得到每个组合标签的概率，再按概率排序：

```text
False_Misconception:Incomplete
False_Neither:NA
True_Correct:NA
...
```

你的方案有 4 个模型，每个模型输出一份排序。最后用加权 rank ensemble：

```python
weights = [1, 1, 1, 1.75]
```

排名越靠前的标签得分越高，DeepSeek 权重大一些。最终总分最高的 3 个组合标签写入 submission。

最终 pipeline：

```text
QuestionText + MC_Answer + Correct? + StudentExplanation
  -> prompt
  -> Gemma2 / Ettin / ModernBERT / DeepSeek classifiers
  -> each model label ranking
  -> weighted rank ensemble
  -> top3 Category:Misconception
```

## 6. 金牌方案

一手来源：

- Kaggle discussion：[1st Place Solution](https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings/discussion/612268)
- 训练代码：[GitHub](https://github.com/tascj/kaggle-map-charting-student-math-misunderstandings)
- 提交 notebook：[map-submit](https://www.kaggle.com/code/tascj0/map-submit/notebook)

金牌核心不是简单换更大的模型，而是 **任务重构**。

你的方案：

```text
prompt -> 模型 -> 全局 65 类 logits
```

金牌方案：

```text
prefix/context + 每道题的候选 suffix labels
  -> 模型给每个候选标签打分
  -> 候选标签排序
  -> top3
```

### 6.1 如何缩小到每题 8-12 个候选

这场比赛只有 15 个 `QuestionId`。每道题可能出现的 misconception 很有限，不需要在全局 65 个组合标签里盲选。

金牌公开代码维护了 `QuestionId -> misconception list`：

```python
QID2MISCONCEPTIONS = {
    31772: ["Incomplete", "WNB"],
    31774: ["FlipChange", "Mult", "SwapDividend"],
    32835: [
        "Ignores_zeroes",
        "Longer_is_bigger",
        "Shorter_is_bigger",
        "Whole_numbers_larger",
    ],
    ...
}
```

然后每道题生成候选组合标签：

```python
def misconceptions2candidates(misconceptions):
    ret = [
        "False_Correct:NA",
        "False_Neither:NA",
        "True_Correct:NA",
        "True_Neither:NA",
    ]
    for misconception in misconceptions:
        ret.append(f"False_Misconception:{misconception}")
        ret.append(f"True_Misconception:{misconception}")
    return ret
```

候选数量：

```text
4 个基础 NA 类 + 2 * 该题 misconception 数量
```

所以：

- 2 个 misconception -> 8 个候选
- 3 个 misconception -> 10 个候选
- 4 个 misconception -> 12 个候选

例子：`QuestionId = 31772` 的 misconception 是 `Incomplete` 和 `WNB`，候选就是：

```text
False_Correct:NA
False_Neither:NA
True_Correct:NA
True_Neither:NA
False_Misconception:Incomplete
True_Misconception:Incomplete
False_Misconception:WNB
True_Misconception:WNB
```

测试时就是：

```text
拿到 test row
-> 看 QuestionId
-> 查该题 misconception list
-> 生成 8/10/12 个候选组合标签
-> 模型给每个候选打分
-> 排序取 top3
```

### 6.2 suffix classification

金牌把每个候选标签当成 suffix。模型输入不是一个固定 65 类分类头，而是：

```text
prefix + suffix_candidate
```

模型对每个候选 suffix 抽 last-token hidden state，再接：

```text
Linear(hidden_size, 1)
```

得到每个候选标签的一个 scalar logit：

```text
False_Misconception:Incomplete -> 2.31
False_Misconception:Additive   -> 0.84
True_Correct:NA                -> -0.12
```

然后只在同一道题的候选集合内做 softmax/cross entropy。

### 6.3 prefix sharing + FlexAttention

如果每个候选都单独跑：

```text
prefix + suffix0
prefix + suffix1
prefix + suffix2
```

prefix 会重复计算，非常浪费。

金牌把它们拼成：

```text
prefix ++ suffix0 ++ suffix1 ++ suffix2 ++ ...
```

再用自定义 attention mask：

- suffix 可以看 prefix。
- suffix 可以看自己内部 token。
- suffix 不能看其他候选 suffix。

这样既共享 prefix 计算，又避免候选之间泄露答案。

### 6.4 模型、训练和推理

主要模型：

- `Qwen/Qwen3-32B`
- `zai-org/GLM-Z1-32B-0414`

训练：

- 去重后约 35960 条样本。
- 5-fold，按 `Category` stratify。
- full-parameter training。
- 常用超参：`epoch=1`, `batch_size=32`, `learning_rate=1e-5`。
- 因为标签噪声较大，尤其 `Neither`，单 seed validation 不稳定，所以用 multi-seed ensemble。
- final submission 用 full dataset 训练 Qwen3-32B 和 GLM-Z1-32B，每个多个 seed / 不同数据格式。

推理：

- LMDeploy W8A8 INT8。
- SmoothQuant `alpha=0.75`。
- layer-wise inference，让 32B 模型能在 Kaggle T4 上跑。
- 当前层计算和下一层从磁盘加载重叠。
- T4 x 2 推理 16000 样本约 65 分钟。

## 7. 其他高分思路

3rd place discussion：[3rd place solution](https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings/discussion/612059)

可借鉴点：

- prompt 中加入全部 `Choices` 和学生 `Selected`，不只是学生选择的答案。
- 加每道题常见 misconception hints。
- LoRA SFT + multi-task learning：
  - 主任务：65 类 `Category:Misconception`
  - 辅助任务：True/False
  - 辅助任务：Correct/Misconception/Neither
  - 辅助任务：Misconception 36 类
- 用 R-Drop、AWP、EMA 提升泛化。
- 对低置信度样本用更强模型二阶段重跑。
- T4 上使用 `float16`，避免 `bfloat16` 转换开销。
- `padding=False` 比 `padding=max_length` 更快。

## 8. 面试话术

30 秒版本：

> 这场是学生数学解释的误解识别，输出 top3 `Category:Misconception` 组合标签，指标是 MAP@3。我把它转成 65 类组合标签分类任务，用题目、学生选项、答案是否正确和学生解释构造 prompt，再用 Gemma2、Ettin、ModernBERT、DeepSeek Math 多模型输出排序，最后做加权 rank ensemble，拿到 public rank 94/1857 的铜牌。

2 分钟版本：

> 我的方案先把 `Misconception` 缺失填成 `NA`，构造 `Category:Misconception` 组合标签，共 65 类。测试时我从训练集推断每道题正确选项，给每条样本加 `Correct? Yes/No`，再把题干、学生答案、是否答对、学生解释拼成 prompt。单模型层面是端到端 sequence classification，输出 65 类 logits；完整方案还包括 prompt engineering 和多模型 rank ensemble。金牌方案比我们强的关键是把全局 65 类分类改成每道题候选 suffix ranking，只在每题 8-12 个合理候选里排序，并用 32B Qwen/GLM multi-seed full training 和高效推理工程。

被追问时可以展开：

- MAP@3 如何计算。
- 为什么输出组合标签 top3。
- `Correct?` 特征如何从训练集推断。
- 模型实际输入 prompt 和输出 logits 是什么。
- 你的模型是端到端分类器，但完整 pipeline 不是完全端到端。
- 金牌 suffix classification 如何缩小候选空间。

## 9. 后续优化建议

- prompt 从 `Answer` 升级成 `Choices + Selected`。
- 为每个 `QuestionId` 建候选 misconception list，做 candidate reranking。
- 增加 auxiliary heads：True/False、Correct/Misconception/Neither、Misconception。
- 加 R-Drop、EMA、AWP。
- 用 OOF 调 ensemble 权重，而不是手设 `[1, 1, 1, 1.75]`。
- 对低置信度样本二阶段重跑更强模型。
- 面试深入准备时，可以实现小版 suffix classification，不必直接上 32B。

