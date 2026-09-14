# KET: Entanglement-Aware Quantum Circuit Diagnostics

## One-sentence summary

KET is a privacy-first, browser-based open-source tool that helps quantum learners and early-stage developers find where entanglement grows in a circuit, understand the resulting bottleneck, and export a reproducible analysis report without installing a Python stack or sending circuit data to a server.

## The problem

Quantum circuit diagrams show gates and wires, but they do not show when a circuit becomes strongly correlated or which contiguous cut is responsible for the growth. This makes it difficult for a student to connect an abstract algorithm to the underlying physics, and difficult for an early-stage developer to decide which layer or two-qubit gate to inspect.

Existing SDKs and simulators are valuable, but they generally assume a local programming environment and expose raw state or execution results rather than a small, visual, explanation-oriented diagnostic report.

## The proposed project

KET turns a small circuit into an actionable diagnostic:

- parse a documented subset of OpenQASM 2.0 with line-level errors;
- simulate the pure state locally in a Web Worker;
- compute Von Neumann entropy for every contiguous bipartition at every step;
- identify the peak cut and peak step;
- report estimated depth and entangling-gate density;
- provide an explicitly non-rigorous comparison indicator for small circuits;
- export the source, metrics, entropy timeline, and final-state probabilities as JSON.

The tool is intentionally not positioned as a replacement for a production simulator or as a wall-clock runtime predictor. Its value is interpretability: helping a person decide what to inspect next.

## Current starting point

The repository already contains a working browser prototype with:

- a client-side statevector simulator;
- a Web Worker compute path;
- entropy heatmap visualization;
- GHZ, Bell, VQE, QAOA, and random examples;
- support for `I`, `H`, `X`, `Y`, `Z`, `RX`, `RY`, `RZ`, `CX`, `CZ`, and `SWAP`;
- OpenQASM/pseudo-syntax parsing and diagnostics;
- JSON report export;
- regression tests for parser behavior, Bell-state entropy, SWAP, and circuit metrics.

## 3–6 month milestones

### Month 1: correctness and reproducibility

- Expand the validation suite with product, Bell, GHZ, cluster, and ansatz circuits.
- Compare selected outputs against an independent reference implementation.
- Document qubit ordering, entropy conventions, numerical tolerances, and simulator limits.

### Months 2–3: practical diagnostics

- Add gate-level hotspot explanations around the peak step.
- Add layer-by-layer comparison so users can see whether a new ansatz layer adds useful correlation.
- Add circuit diffing and a compact report view suitable for an issue, lesson, or lab notebook.

### Months 4–6: community and education

- Publish three short, reproducible tutorials: Bell/GHZ intuition, QAOA ansatz inspection, and debugging unnecessary entangling layers.
- Run a small feedback round with quantum educators and early-stage developers.
- Incorporate feedback, improve accessibility, and publish a release with a stable report format.

## Success measures

- At least 20 reference circuits covered by automated tests.
- At least 3 public tutorials with downloadable circuit/report examples.
- At least 10 external user feedback responses, with documented changes made from that feedback.
- A stable, documented JSON report format that can be attached to educational or research workflows.
- No circuit source required to leave the browser for the core workflow.

## Open-source and ecosystem impact

The project is MIT-licensed and designed to be useful without a paid service, account, or cloud backend. The report format and reference circuits will make it easier for educators and contributors to share reproducible examples. The implementation is deliberately small enough for new contributors to understand, while the documentation will make the mathematical assumptions visible instead of hiding them behind a single score.

KET complements general-purpose simulators and SDKs: those tools execute and optimize circuits; KET explains where a small circuit becomes correlated and gives a learner or developer a concrete next question.

## Proposed use of a $4,000 microgrant

- **$2,600 — developer time:** correctness work, diagnostics, report format, and issue response.
- **$700 — validation and benchmarking:** independent cross-checks, reference circuits, and reproducible examples.
- **$500 — education and documentation:** tutorials, diagrams, accessibility improvements, and video production.
- **$200 — distribution and community:** hosting, release materials, and feedback outreach.

The grant would fund a focused 3–6 month milestone rather than the whole long-term roadmap.

## Two-minute video outline

1. **0:00–0:20 — the problem:** show a circuit diagram and ask “where does the entanglement actually appear?”
2. **0:20–0:55 — the workflow:** paste OpenQASM, show the circuit and step-by-step heatmap.
3. **0:55–1:25 — the useful result:** show the peak cut, peak step, depth, entangling-gate density, and the plain-language suggestion.
4. **1:25–1:45 — trust and accessibility:** show that the computation runs locally, errors are explicit, and the report is exportable.
5. **1:45–2:00 — the ask:** explain that the microgrant will turn the prototype into a validated, documented, community-tested open tool.

## Application references

Unitary Foundation currently describes its microgrant program as a $4,000 cash grant for quantum technology projects, with applications accepted on a rolling basis. Its FAQ recommends projects that can be completed in 3–6 months and encourages open-source work. See the [program page](https://unitary.foundation/) and [FAQ](https://unitary.foundation/faqs/) for the current requirements.
