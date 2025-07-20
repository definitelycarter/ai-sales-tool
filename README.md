# Client Assistant for Sales & BI

## Problem Statement

Business and sales teams often work with fragmented tools that lack a holistic view of clients, markets, and opportunities. A solution is needed to build a unified assistant that delivers company insights, financial analysis, industry trends, and real-time sales support to drive informed decision-making and performance.

## Problem

Most tools present sales funnels in a tabular format, which fails to provide a holistic view of an account. As a result, sales associates must spend significant time digging through fragmented data to prepare for calls or emails. This inefficiency leads to excessive time spent on research instead of maximizing productivity.

## Solution

This solution moves away from static, tabular data and introduces an intelligent assistant that can recommend actions, prioritize accounts, and generate client responses based on historical account activity.

Currently, the assistant can:

- Identify and rank accounts using a **value-based priority** system
- Recommend products based on recent account activities
- Snooze accounts for later follow-up
- Reject accounts that are no longer interested
- Add private notes to accounts for internal use

## Architecture

To keep things simple, the system uses a SQLite database for storage and a Next.js frontend. OpenAI tools are integrated to query the database intelligently. These tools are configured using a `JSON Schema` that teaches the language model how to interact with the custom dataset.

When a sales associate requests information about their accounts, the assistant uses these tools to manage and surface insights across the sales funnel.
