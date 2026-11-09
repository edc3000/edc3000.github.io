---
title: "LangChain 与 LangGraph"
date: 2026-11-06
description: "LangGraph 是底层编排运行时,LangChain 1.x 的 create_agent 编译出来就是一张 LangGraph 图。讲两者的分层关系与从链到图的演进,LCEL 与 Runnable,create_agent 的图结构、六个中间件钩子与执行顺序、结构化输出策略;StateGraph 的状态与 reducer、条件边、Send 与 Command;Pregel 风格的 super-step 执行模型与 recursion limit;checkpointer、时间旅行、Store 与 durable execution;interrupt 人在环中的恢复语义;流式模式;多智能体四种模式与 Deep Agents;2026 年 langgraph 1.1/1.2、langchain 1.4 的新变化。配 super-step 与中断恢复两个对照真库验证的交互实验与高频追问。"
tags: ["llm", "agent", "langchain", "langgraph", "多智能体", "面试"]
order: 30
embed: "/reports/interview/langchain-langgraph.html"
---
