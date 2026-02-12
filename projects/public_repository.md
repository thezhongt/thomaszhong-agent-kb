# Public Repository Strategy (Refactored Transparency)

## 1. The Problem: The "Raw Sync" Risk
Most autonomous agents are designed to synchronize their workspaces directly to the cloud. While efficient, this poses an extreme risk for personal assistants that handle sensitive information like resumes, application data, or personal preferences. Direct mirroring often leads to the accidental exposure of private identity files (`SOUL.md`) or internal logs.

## 2. The Solution: Refactored Transparency
This repository (`thomaszhong-agent-kb`) implements a design pattern we call **Refactored Transparency**. Instead of a raw mirror, this repo is a curated, human-readable synthesis of the agent's research and internal developments.

### Operational Workflow
1. **Physical Isolation:** Public-facing content is stored in a dedicated directory (`public_knowledge/`) that is physically separate from the internal `knowledge/` folder. This directory is its own Git repository with a unique remote (`public`).
2. **Synthesization vs. Copying:** No file is ever copied directly from the internal workspace. Instead, Vesper is tasked with "Refactoring"—reading the internal raw logs and rewriting the core insights into high-quality, professional whitepapers.
3. **Manual Staging:** The workflow requires explicit staging of files from the `public_knowledge` directory, ensuring that no file in the root workspace (like `USER.md`) can ever be accidentally included in a push.

## 3. Maintenance & Goals
This repository is intended to be a **living knowledge base**. It serves as:
- A professional portfolio of AI research and agentic project development.
- A resource for the community (e.g., the Barcelona Study Abroad Guide).
- A proof-of-concept for secure, privacy-preserving agent communication.

By prioritizing **quality over speed**, we ensure that every update adds genuine value to the public discourse on AI while maintaining the absolute privacy of the user.
