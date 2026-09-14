# Changelog

All notable changes to KET are documented here.

## [0.2.0] — 2026-09-14

### Added

- OpenQASM-style and compact pseudo-syntax parsing with line-level diagnostics.
- Statevector support for `I`, `H`, `X`, `Y`, `Z`, `RX`, `RY`, `RZ`, `CX`, `CZ`, and `SWAP`.
- Circuit depth, entangling-gate density, peak cut, peak step, and effective Schmidt-rank indicators.
- Step-by-step entanglement heatmap with normalized cut values.
- Actionable “What this suggests” guidance for small-circuit inspection.
- JSON report export containing source, metrics, entropy timeline, and final probabilities.
- Regression tests for parser behavior, Bell-state entropy, SWAP, and circuit metrics.
- Expanded README and in-app documentation.
- Unitary Foundation grant proposal draft and two-minute video outline.

### Changed

- Renamed the user-facing heuristic score to **Complexity Pressure** to clarify that it is not a runtime prediction.
- Updated Next.js to `16.3.5` and verified the production build.

### Validation

- `npm test` — 5 tests passing.
- `npm run lint` — passing.
- `npm run build` — passing.
- `npm audit --omit=dev --audit-level=high` — 0 production vulnerabilities.

## [0.1.0] — Initial prototype

- Browser-based statevector visualization.
- Entanglement entropy heatmap.
- Example circuits and Web Worker computation.
