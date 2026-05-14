# Gemini Instructions

<!-- AAC-V1.1-OB-RETRIEVAL-GATE:START -->
## AAC v1.1 OB Retrieval Gate (Agent Automation Creator)

Status: repo-level pointer for MyBCAT AI-workflow guardrails.

Canonical source: OB_mybcat. Search for `AAC v1.1 rubric` or the current AAC rubric before applying this gate. If OB_mybcat has a newer AAC version, use the newer OB version.

Scope: MyBCAT AI workflow, agent, agentic automation, and AI-workflow-standard work only. This gate does not fire for ordinary coding, generic explanation, personal drafting, or non-AI workflow tasks.

Trigger: for any task involving design, evaluation, modification, diagnosis, acceptance, or onboarding of an AI workflow, agent, agentic automation, workflow automation, autonomous process, AI workflow standard, or vendor/builder AI-workflow deliverable.

Required action: retrieve AAC from OB_mybcat before responding, cite AAC v1.1 or the current OB version explicitly, and apply the 57-item rubric to the workflow being discussed when making readiness, acceptance, design, or modification claims.

Readiness rule: do not declare any AI workflow, agent, or agentic automation `ready`, `production-ready`, `acceptable`, or `good to ship` without an AAC rubric pass. If OB_mybcat is unavailable, say AAC cannot be applied and do not issue a readiness verdict.

Failure handling: if a workflow fails AAC, state the failing sections or item numbers, then offer either a fix path or an explicit exception-capture path in OB_mybcat. Do not silently approve.

Canonical-source enforcement: never paste the AAC rubric body, framework body, 16-section spec, or worked examples into this file or any other surface instructions. Surface files may contain only this pointer, trigger logic, and readiness rule. OB_mybcat is the source of truth.
<!-- AAC-V1.1-OB-RETRIEVAL-GATE:END -->
