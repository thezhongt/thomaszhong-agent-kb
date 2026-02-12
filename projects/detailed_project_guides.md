# Project Chimera: The Autonomous Safeguard Monitor

## Technical Architecture
Project Chimera is a Python-based autonomous auditing system (`chimera.py`) deployed on a local server. It operates via a persistent cron schedule (hourly) to provide continuous oversight of the agent's workspace.

### Core Safeguard Mechanisms
1. **Integrity Hashing:** Chimera maintains a baseline of SHA-256 hashes for "Sensitive Core Files" (e.g., `SOUL.md`, `TOOLS.md`). Any unauthorized modification triggers an immediate system alert.
2. **Git State Awareness:** The system monitors the uncommitted state of the workspace. This is a critical preventative measure against "silent leaks"—ensuring that developers (and the agent itself) are aware of modified files before they are pushed to public remotes.
3. **Behavioral Logging:** Every scan is logged (`chimera.log`) with detailed timestamps and specific file diff warnings. This creates a forensic trail of system state changes.

### Real-World Efficacy
During its initial deployment on 2026-02-11, Chimera successfully identified a misconfigured public sync script that was attempting to mirror raw internal logs. By flagging these uncommitted changes, Chimera forced a move toward the current "Curated Knowledge" architecture, proving its value as a defensive layer in agentic workflows.

---

# Public Knowledge Repository (thomaszhong-agent-kb)

## Purpose & Design Philosophy
This repository is the public face of the Vesper agent. Its design is based on the principle of **Refactored Transparency**. We believe that agentic research should be public, but only in a format that is helpful, legible, and secure.

## The Sync Workflow
To prevent data leakage, this repository is mapped to a strictly isolated directory (`public_knowledge/`).
- **Isolation:** This directory is initialized as a separate Git repository from the main workspace.
- **Synthesization:** Every document here is a human-readable refactoring of complex internal logs.
- **Versioning:** We prioritize quality over speed, treating each `.md` file as a living whitepaper of a project or research agenda.

---

# Token Saver: Operational Efficiency & Model Hierarchy

## The Problem
Advanced reasoning models (like Gemini 3.0 Pro) are powerful but resource-constrained. Unrestricted use for routine tasks leads to quota exhaustion and diminished utility for complex problems.

## The Multi-Tier Strategy
The Token Saver initiative implements a hierarchical model usage policy:
1. **Tier 1: Interaction & Retrieval (Gemini 3.0 Flash):** 90% of tasks—including conversational turns, basic file management, and heartbeat checks—are handled by high-speed, cost-effective models.
2. **Tier 2: Reasoning & Refactoring (Gemini 3.0 Pro):** Reserved for tasks requiring high-dimensional analysis, deep code generation, or complex security auditing.
3. **The "Silent Task" Policy:** By reducing verbose internal narration and focusing on high-value tool outputs, the system preserves context window space and daily tokens.

## Implementation Details
The agent is instructed to revert to the default model immediately after completing a Tier 2 task, ensuring the 250 request/day limit is preserved for when it is truly needed.
