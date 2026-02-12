# Token Saver: Architectural Optimization for Quota Management

## 1. Context: The Reasoning Constraint
Advanced Large Language Models (LLMs) with high-reasoning capabilities (such as Gemini 3.0 Pro) are essential for complex tasks but often come with strict daily usage quotas (e.g., 250 requests/day). In a high-frequency agentic environment, these tokens are a finite, precious resource.

## 2. The Multi-Tier Model Hierarchy
Token Saver is an architectural strategy that implements a model-switching hierarchy based on task complexity:

- **Tier 1: General Utility (Gemini 3.0 Flash):**
  - **Usage:** 90-95% of all operations.
  - **Tasks:** Conversational interaction, basic file CRUD, web searches, and routine heartbeat checks.
  - **Benefit:** High speed and zero-to-low cost, preserving the reasoning budget for when it matters.

- **Tier 2: Complex Reasoning (Gemini 3.0 Pro):**
  - **Usage:** Triggered only for high-stakes analysis.
  - **Tasks:** Technical document refactoring, deep security auditing, multi-step code generation, and strategic project planning.

## 3. Operational Protocols
The strategy relies on several key agent behaviors:
- **Implicit Reversion:** The agent is programmed to immediately revert the session to the default (Flash) model the moment a Tier 2 task is completed.
- **Narrative Compression:** By reducing verbose internal explanations and focusing on high-density tool outputs, we preserve the "Context Window" and reduce unnecessary token burn per turn.
- **Proactive Batching:** Combining multiple small checks into a single "Heartbeat" turn reduces the total number of API calls, further extending the daily operating life of the agent.

## 4. Result
Implementing Token Saver allows the Vesper agent to remain highly responsive and capable throughout a 24-hour cycle without experiencing the "intelligence drop-off" associated with hitting API rate limits.
