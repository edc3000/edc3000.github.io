---
title: "ROGII 井眼地质预测:银牌方案完整解读"
date: 2026-08-10
description: "Kaggle ROGII Wellbore Geology Prediction 银牌方案复盘,私榜 177/6125。粒子滤波父模型加前缀门控修正,以及公私榜最优方案不一致的成因分析。"
tags: ["kaggle", "时序预测", "粒子滤波", "地质建模"]
platform: kaggle
medal: silver
rank: 177
totalTeams: 6125
rankNote: "私榜最终名次;公开榜为 101/6125"
metric: RMSE
publicLB: 6.100
privateLB: 8.074
competitionUrl: "https://www.kaggle.com/competitions/rogii-wellbore-geology-prediction"
richReport: "/reports/competitions/rogii-wellbore-geology.html"
---

报告日期：2026-08-10  
团队：`ikun`  
Kaggle 用户：`liangyan0322`

## 1. 最终结论

本账号最终提交中，**私榜最好的方案是 `exp214_prefixgate_q85_z025_w425_v1`**：

- Submission ref：`55259561`
- Public LB：`6.100`
- Private LB：**`8.074`**
- 最终 Private 排名：**177 / 6125**，约为 **Top 2.89%**
- 最终 Public 排名：**101 / 6125**，团队 Public 最佳分为 `6.088`
- Private 第 50 名分数：`7.017`，本方案距离前 50 尚差 `1.057 RMSE`

比赛指标为 RMSE，**分数越低越好**。最终团队 Public 分数来自 `exp213`，最终
Private 分数来自 `exp214`，因此“公开榜最好方案”和“私榜最好方案”并不是同一份提交。

### 最后五次提交结果

| 实验 | 关键参数 | Submission ref | Public LB | Private LB | 结论 |
|---|---|---:|---:|---:|---|
| `exp210` | `alpha=0.450`，高分歧井不修正 | 55259510 | 6.119 | 8.185 | 已计分 |
| `exp211` | `alpha=0.450`，高分歧井保留 25% 修正 | 55259526 | - | - | Kaggle API 未返回分数，不作估算 |
| `exp212` | `alpha=0.475`，高分歧井不修正 | 55259537 | 6.183 | 8.159 | 已计分 |
| `exp213` | `alpha=0.425`，高分歧井不修正 | 55259557 | **6.088** | 8.204 | Public 最好 |
| `exp214` | `alpha=0.425`，高分歧井保留 25% 修正 | 55259561 | 6.100 | **8.074** | **Private 最好** |

`exp214` 相比相同 `alpha`、但高分歧井完全不修正的 `exp213`，Public 差
`0.012`，Private 却好 `0.130`。这与“不确定井应保守修正”的设计方向一致；但两份
Notebook 都会独立重跑随机粒子滤波父模型，因此不能把全部差异严格归因于门控参数。

## 2. 比赛简介

[ROGII - Wellbore Geology Prediction](https://www.kaggle.com/competitions/rogii-wellbore-geology-prediction/overview)
是一个奖金为 50,000 美元的 Featured Code Competition。任务目标是：在水平井钻进到
Prediction Start 之后，根据井眼轨迹、随钻伽马射线日志和配套直井参考日志，预测水平井
后续每一个 MD 采样点对应的 `TVT`（True Vertical Thickness，地层垂向厚度坐标）。

这不是普通的独立行表格回归，更接近一个地球物理序列反演问题：

1. `GR(MD)` 给出水平井沿程穿过地层时观测到的伽马射线信号。
2. typewell 提供 `GR(TVT)` 的垂向参考模板。
3. 模型需要从存在噪声、缺失和重复层段的 GR 模式中，恢复整条后缀 `TVT(MD)` 轨迹。
4. 地层倾角和井眼轨迹会持续改变 TVT，因此不能只预测一个常数偏移。

评分指标是所有隐藏测试行汇总后的 pooled RMSE：

\[
\mathrm{RMSE}=\sqrt{\frac{1}{N}\sum_{i=1}^{N}(\hat{y}_i-y_i)^2}
\]

比赛采用 Notebook Code Submission。公开 `test/` 中的 3 口井只是运行模板；正式评分时
Kaggle 会用约 200 口隐藏井替换测试数据并重新运行 Notebook，所以代码不能依赖固定井号、
固定井数或公开样例的 14,151 行。

## 3. 数据格式

本地完整训练数据包含 773 口井，每口井由一份水平井 CSV 和一份 typewell CSV 组成：

```text
train/
  <well_id>__horizontal_well.csv
  <well_id>__typewell.csv
test/
  <well_id>__horizontal_well.csv
  <well_id>__typewell.csv
sample_submission.csv
```

### 3.1 数据规模

| 数据 | 井数 | 行数 | 说明 |
|---|---:|---:|---|
| 训练水平井 | 773 | 5,092,255 | 其中 3,783,989 行属于预测后缀 |
| 训练 typewell | 773 | 1,567,045 | 垂向 `GR(TVT)` 参考曲线 |
| 公开测试水平井 | 3 | 19,221 | 仅为 Notebook 模板 |
| 公开测试待预测行 | 3 | 14,151 | 对应 `sample_submission.csv` |

### 3.2 水平井文件

训练水平井列为：

| 字段 | 含义 | 推理时是否可用 |
|---|---|---|
| `MD` | Measured Depth，沿井眼测量深度，约每 1 ft 一行 | 是 |
| `X`, `Y`, `Z` | 三维井眼轨迹坐标 | 是 |
| `GR` | 水平井伽马射线日志，部分行缺失 | 是 |
| `TVT_input` | Prediction Start 之前已知的 TVT，之后为 NaN | 是 |
| `TVT` | 训练目标，即完整真实 TVT | 仅训练集 |
| `ANCC`, `ASTNU`, `ASTNL`, `EGFDU`, `EGFDL`, `BUDA` | 训练集地层界面辅助信息 | 否，测试集不存在 |

测试水平井严格只有 `MD, X, Y, Z, GR, TVT_input`。最终方案不会使用训练专有的地层界面列，
也不会读取查询井隐藏后缀的 `TVT`。

### 3.3 Typewell 文件

| 字段 | 含义 |
|---|---|
| `TVT` | 垂向参考曲线的深度坐标，通常约 0.5 ft 间隔 |
| `GR` | 对应深度的伽马射线值 |
| `Geology` | 训练文件中可见的稀疏地层标签；测试文件不提供 |

### 3.4 提交文件

```csv
id,tvt
000d7d20_1442,11234.56
000d7d20_1443,11234.61
```

`id` 由 `<well_id>_<水平井零基行号>` 组成，`tvt` 是该后缀行的预测值。提交必须严格保持
`sample_submission.csv` 的 ID 顺序，并保证 ID 唯一、预测为有限浮点数。

## 4. 最终方案思路

最终方案由一个强父模型和一个自研的低相关后处理分支组成：

```text
随机粒子滤波/树模型父堆栈 exp181
                 |
                 v
训练水平井邻井参考 + 目标井可见前缀参考
                 |
                 v
STRIDE-lite 分段束搜索 -> posterior consensus / MAP
                 |
                 v
按井分歧 q85 门控 + 逐行 40 ft 截断 + alpha=0.425
                 |
                 v
最终 submission.csv
```

### 4.1 强父模型：`exp181`

父模型来自此前验证最稳定的 geosteering 堆栈，核心包含随机粒子滤波、GR/typewell 对齐、
树模型残差、投影与接触面/可见前缀校正。最终锁定的粒子滤波 GR 噪声系数为 `1.30`，
branch strength/cap 为 `2.40/4.50 ft`。它在比赛进行时取得 Public LB `6.440`，因此被用作
最终五个候选的共同父轨迹。

父模型负责给出总体稳定、物理连续的 TVT 轨迹；新增 STRIDE 分支只做有界修正，避免独立
解码器在 GR 重复层段发生 cycle skip 时完全覆盖主模型。

### 4.2 用训练水平井建立更高分辨率参考

官方 typewell 是重要参考，但它与目标水平井可能存在局部相变、噪声尺度和空间偏移。
最终方案额外使用 773 口训练水平井的真实 `TVT` 与 `GR`：

1. 每口训练井按 0.5 ft TVT 分箱，对同一 bin 的 GR 取中位数，形成水平井 `GR(TVT)` 曲线。
2. 按目标井中心 `X/Y` 距离选择最近 32 口候选井，并强制排除与查询井相同的 well ID。
3. 只用目标井 Prediction Start 之前的 `TVT_input/GR` 对候选曲线做稳健仿射校准。
4. 按前缀归一化 RMSE、空间距离和覆盖率排序，选择最佳 3 口邻井进行软权重融合。
5. 邻井参考与目标井自带 typewell 各占 50%，减少单一邻井失配风险。

这部分借鉴了公开方案对“空间参考”和“GR 匹配”的重视，但具体的 32 选 3、前缀校准、
同井排除和回退逻辑是本项目独立实现。

### 4.3 叠加目标井自身可见前缀

目标井的已钻前缀是最接近隐藏后缀的数据。方案将前缀中同时存在 `TVT_input` 与 `GR` 的行
聚合成目标井自己的 `GR(TVT)` 曲线。在参考网格满足以下条件时，使用 50% 自身前缀和 50%
邻井/typewell 回退参考：

- 目标 TVT 位于前缀覆盖范围内；
- 距离最近的前缀 TVT bin 不超过 2 ft。

范围之外完全回退，不进行长距离外插。本地 256 井中，约 62.4% 的隐藏评分行落在前缀 TVT
覆盖范围内，这是该分支有效的主要原因。

### 4.4 STRIDE-lite 分段后验解码

受公开 [STRIDE 工作笔记](https://www.kaggle.com/writeups/shreygandhi/stride-a-joint-posterior-over-depth-and-distance)
启发，项目实现了一个轻量级、无泄漏的分段束搜索：

- 状态使用 `U = TVT + Z` 与变化率 `dU/dMD`；
- 每 120 行为一个解码段，beam width 为 192；
- 每 4 行使用一次可见 GR 似然，缺失 GR 自动跳过；
- GR 残差使用 Cauchy 型代价，降低异常点影响；
- 对相邻段变化率加入持续性惩罚，避免轨迹无物理意义地跳变；
- 保留后验前 32 条轨迹，得到 posterior consensus 和 MAP 两种预测；
- STRIDE 输出为 `0.75 * consensus + 0.25 * MAP`。

它与父粒子滤波的搜索机制不同，单模不一定强，但误差相关性较低，因此更适合作为混合腿。

### 4.5 无标签不确定性门控与最终混合

对每口测试井计算：

\[
u_w=\mathrm{RMS}(\hat y_{consensus}-\hat y_{MAP})
\]

在当前测试井集合内取 `u_w` 的 q85 作为阈值。最终修正为：

\[
\hat y_{final}=\hat y_{parent}+0.425\cdot g_w\cdot
\mathrm{clip}(\hat y_{stride}-\hat y_{parent},-40,40)
\]

其中普通井 `g_w=1.0`，q85 以上高分歧井 `g_w=0.25`。该门控只依赖两条可见预测的分歧，
不需要隐藏标签。

## 5. 验证与候选选择

### 5.1 本地验证

在 256 口训练井、1,254,392 个模拟后缀行上进行按井切分验证，查询井的隐藏 TVT 和隐藏 GR
不会进入参考构造。主要结果如下：

| 阶段 | 结果 |
|---|---|
| 邻井 + 目标前缀 reference | discovery 32 井约 5.48；holdout 96 井约 5.77；lockbox 128 井约 5.72 |
| 胜负井统计 | lockbox 中 93 井改善、35 井退化 |
| q85 门控外层四折 | pooled RMSE `5.395577`，四折均优于代理基线 |
| `exp214` 全量代理 | RMSE `5.326922` |
| 200 井 bootstrap | 进入当时前 50 分数线的估计概率 `90.87%` |

bootstrap 概率只是基于代理验证的风险估计，不是榜单保证。实际 Private 结果证明该估计明显
偏乐观，因此不能把它解释为真实进入前 50 的概率。

### 5.2 隐藏安全与云端审计

正式 `exp214` Notebook 在 Kaggle T4 v1 上完成，审计结果为：

- 46 个代码单元的远端源码 SHA 与本地一致；
- 父输出 SHA：`e423f5e3...`；
- 最终输出 SHA：`120ecec6...`；
- 公开模板输出 14,151 行、3 口井，ID 与样例严格同序；
- TVT 全部为有限值，无 Traceback/RuntimeError；
- q85 阈值 `0.209302`，公开 3 井中 1 井被衰减；
- 最大绝对修正 `3.9208 ft`；
- 云端审计状态为 `PASS`。

## 6. 核心代码

完整比赛 Notebook 见
[`kernels/exp214_prefixgate_q85_z025_w425/main.ipynb`](kernels/exp214_prefixgate_q85_z025_w425/main.ipynb)，
其中包含父模型全部 45 个代码单元和最终追加的 STRIDE 单元。为了便于阅读和复用，另将新增
分支整理为带中文注释的可运行脚本
[`scripts/final_exp214_core.py`](scripts/final_exp214_core.py)。该脚本接收已经生成的父模型
`submission.csv`，复现最终 `exp214` 的邻井/前缀 STRIDE 后处理。下面是核心逻辑：

```python
import numpy as np
import pandas as pd

from rogii_horizontal_reference import (
    HorizontalReferenceConfig,
    build_horizontal_reference,
    build_reference_index,
    overlay_prefix_reference,
)
from rogii_stride_lite import StrideLiteConfig, decode_well_tail

# exp214 最终锁定参数
ALPHA = 0.425
GATE_QUANTILE = 0.85
GATE_ATTENUATION = 0.25
ROW_CLIP_FT = 40.0

# 1. 将 773 口训练水平井构造成 0.5 ft 分辨率的 GR(TVT) 曲线索引
curves = build_reference_index(train_dir, curve_step_ft=0.5)
reference_cfg = HorizontalReferenceConfig(
    max_candidates=32,
    blend_neighbors=3,
    neighbor_weight=0.50,
)
stride_cfg = StrideLiteConfig(
    segment_rows=120,
    beam_width=192,
    gr_stride_rows=4,
    smooth_weight=0.0,
)

frames = []
uncertainty = {}
for hw_path in sorted(test_dir.glob("*__horizontal_well.csv")):
    well_id = hw_path.name.replace("__horizontal_well.csv", "")
    horizontal = pd.read_csv(hw_path)
    typewell = pd.read_csv(test_dir / f"{well_id}__typewell.csv")

    # 2. 从空间最近的 32 口井中，按目标井可见前缀选 3 口并与 typewell 融合
    reference, _ = build_horizontal_reference(
        horizontal,
        typewell,
        curves,
        query_well_id=well_id,
        config=reference_cfg,
    )

    # 3. 在有可靠 TVT/GR 支持的区间叠加目标井自身前缀，区间外自动回退
    reference, _ = overlay_prefix_reference(
        horizontal,
        reference,
        prefix_weight=0.50,
        curve_step_ft=0.5,
        maximum_gap_ft=2.0,
    )

    # 4. 分段束搜索，同时保留 posterior consensus 与 MAP 轨迹
    decoded = decode_well_tail(horizontal, reference, stride_cfg)
    consensus = np.asarray(decoded["prediction_tvt"], dtype=float)
    map_pred = np.asarray(decoded["map_prediction_tvt"], dtype=float)
    stride_pred = 0.75 * consensus + 0.25 * map_pred

    # 5. 两条后验轨迹的分歧作为无标签不确定性
    uncertainty[well_id] = float(np.sqrt(np.mean((consensus - map_pred) ** 2)))
    target_rows = np.flatnonzero(horizontal["TVT_input"].isna().to_numpy())
    frames.append(pd.DataFrame({
        "id": [f"{well_id}_{row}" for row in target_rows],
        "well": well_id,
        "tvt_stride": stride_pred,
    }))

# 6. q85 以上的高不确定井只保留 25% 修正
threshold = float(np.quantile(list(uncertainty.values()), GATE_QUANTILE))
stride = pd.concat(frames, ignore_index=True)
joined = parent.merge(stride, on="id", how="left", validate="one_to_one")
joined["delta"] = joined["tvt_stride"] - joined["tvt"]

for well_id, group in joined.groupby("well"):
    gate = GATE_ATTENUATION if uncertainty[well_id] > threshold else 1.0
    move = ALPHA * gate * np.clip(group["delta"].to_numpy(), -ROW_CLIP_FT, ROW_CLIP_FT)
    joined.loc[group.index, "tvt"] += move

# 7. 严格按 sample_submission.csv 的 id 顺序输出
submission = sample[["id"]].merge(joined[["id", "tvt"]], on="id", validate="one_to_one")
assert np.isfinite(submission["tvt"]).all()
submission.to_csv("submission.csv", index=False)
```

本地复现命令：

```bash
python scripts/final_exp214_core.py \
  --data-root data/full_raw \
  --parent-submission runs/exp181_gs130_bh240_cap450_v1/submission.csv \
  --output /tmp/submission_exp214.csv \
  --policy-report /tmp/exp214_policy_report.csv
```

公开三井复现输出为 14,151 行、3 口井、1 口井触发衰减，最大修正 `3.9208 ft`；与正式
`exp214` 云端输出的最大逐值差约 `5.46e-12 ft`，差异只来自运行环境浮点舍入。

## 7. 私榜结果分析

### 7.1 有效提升

最终方案虽然没有进入前 50，但相对父模型和上一阶段最佳方案仍有明显改善：

| 对比 | Public 改善 | Private 改善 |
|---|---:|---:|
| `exp214` vs `exp181` | 6.440 -> 6.100，改善 0.340 | 9.431 -> 8.074，改善 1.357 |
| `exp214` vs `exp198` | 6.225 -> 6.100，改善 0.125 | 9.203 -> 8.074，改善 1.129 |

这说明邻井/前缀 STRIDE 分支并非只拟合 Public 榜，它在 Private 数据上也显著改善了系统级
结果。`exp214` 最终排名 177，已处于 Top 2.89%，但距离 Private 前 50 仍有较大差距。

### 7.2 为什么本地验证比私榜乐观

1. **强父模型代理不够真实。** 本地策略搜索将 OOF 误差方向缩放到 RMSE 6.44，无法完整
   复现线上随机 PF、树模型和多层后处理在新井上的联合错误分布。
2. **空间近邻并不等于地层近邻。** 邻井 GR 参考在同一区域通常有效，但相变、断层、重复
   层段和局部 datum 偏移会让最近井成为错误模板。
3. **不确定性指标覆盖不完整。** consensus 与 MAP 接近只表示 STRIDE 自身后验集中，不能
   识别“两个解一致但都匹配到错误层段”的 cycle skip。
4. **q85 是相对阈值。** 无论测试集整体是否可靠，它都会把大约 15% 的井视为高风险；当
   Private 井群整体分布发生变化时，固定分位数不一定对应固定真实风险。
5. **逐井门控与逐行指标不完全一致。** 比赛按所有行 pooled RMSE 计分，长井和大误差井对
   总 SSE 的影响更大，而 q85 门控对每口井只计一个不确定性值。
6. **父模型存在随机重跑方差。** 五份 Notebook 会独立运行随机 PF，因此小参数差异与随机
   差异混在一起，增加了本地选型和线上归因难度。
7. **Public 反馈使用过多。** 比赛后期积累了大量 Public LB 迭代，即使单次实验合理，整体
   选型仍可能逐步适配 Public 子集而削弱 Private 泛化。

四份已计分的最终候选从 Public 到 Private 都恶化约 `1.974-2.116 RMSE`，说明主要问题是
Public/Private 分布差异和验证体系的系统性乐观，而不是 `exp214` 某一个参数单独失效。

## 8. 总结

最终私榜最佳方案是 `exp214`，Private RMSE 为 **8.074**，最终排名 **177/6125**。方案的
核心价值不是继续调粒子滤波参数，而是给强父模型增加一条错误机制不同的推理腿：

- 用训练水平井补充比 typewell 更贴近目标区域的 GR(TVT) 参考；
- 用目标井自身已钻前缀完成查询相关校准；
- 用 STRIDE-lite 分段后验搜索恢复连续 TVT 轨迹；
- 用 posterior/MAP 分歧识别不确定井；
- 用 q85 衰减、40 ft 截断和 0.425 权重限制失败时的破坏范围。

赛后结果表明，这条路线相对父模型在 Private 榜改善了 `1.357 RMSE`，方向有效；但本地代理
和 bootstrap 对前 50 的判断过于乐观。下一次同类比赛应优先建立可完整复现线上父模型的
严格 spatial grouped OOF，并使用按行 SSE 贡献校准的不确定性模型，而不是仅依赖逐井后验
分歧和 Public LB 反馈。

## 参考资料

- [Kaggle 比赛主页](https://www.kaggle.com/competitions/rogii-wellbore-geology-prediction/overview)
- [公开数据与问题知识库](https://storage.googleapis.com/kaggle-forum-message-attachments/3459176/42961/index.html)
- [STRIDE: A Joint Posterior over Depth and Distance](https://www.kaggle.com/writeups/shreygandhi/stride-a-joint-posterior-over-depth-and-distance)
- [Daulet Toibazar：方案与失败分析](https://www.kaggle.com/writeups/daulettoibazar/working-note-our-solution-the-failures-behind-it)
- [Bayesian Geosteering for ROGII](https://www.kaggle.com/writeups/rameshln/bayesian-geosteering-for-rogii-particle-filters-a)
