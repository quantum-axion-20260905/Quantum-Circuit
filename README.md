# EntangleMap — Entanglement-Aware Quantum Circuit Diagnostics

**EntangleMap v0.2.0** is a privacy-first, browser-based workspace for understanding small quantum circuits. It helps a learner or early-stage developer answer:

> Where does entanglement appear in my circuit, and what should I inspect next?

EntangleMap runs the analysis locally in your browser. Circuit source and simulated state are not sent to a backend.

## What EntangleMap does

Paste a small OpenQASM circuit or use one of the built-in examples. EntangleMap then:

- simulates the pure state step by step;
- computes Von Neumann entropy across every contiguous wire cut;
- highlights the peak cut and the step where it occurs;
- reports estimated circuit depth and entangling-gate density;
- shows the most probable final basis states;
- exports the source, metrics, entropy timeline, and final probabilities as JSON.

The result is a diagnostic report, not a production-scale simulator and not a wall-clock runtime prediction.

## Who it is for

- **Students:** connect circuit diagrams to entanglement and measurement probabilities.
- **Educators:** demonstrate Bell, GHZ, QAOA, and variational circuits without a local Python setup.
- **Quantum developers:** locate correlation hotspots before changing an ansatz or adding depth.
- **Open-source contributors:** reproduce a small circuit analysis as a portable JSON report.

## Try it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, choose an example, or open **View / Edit Code**.

Before opening a pull request, run the full validation set:

```bash
npm test
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
```

## Input syntax

EntangleMap supports a documented subset of OpenQASM 2.0 together with a compact pseudo-syntax.

### Compact syntax

```text
H 0
CX 0 1
RZ 1 pi/2
SWAP 2 3
```

### OpenQASM-style syntax

```qasm
OPENQASM 2.0;
include "qelib1.inc";
qreg q[4];

h q[0];
rz(pi/2) q[0];
cx q[0], q[1];
swap q[2], q[3];
```

Supported gates:

| Category | Gates |
| --- | --- |
| Single-qubit | `I`, `H`, `X`, `Y`, `Z` |
| Rotations | `RX`, `RY`, `RZ` with numeric or `pi` expressions |
| Two-qubit | `CX`, `CZ`, `SWAP` |

`OPENQASM`, `include`, `qreg`, and `creg` declarations are accepted as headers. `barrier` is ignored with a warning. `measure` and `reset` are not simulated because the current analysis models the unitary portion of a circuit.

Invalid gates, missing operands, invalid angles, and out-of-range qubits are reported with source line numbers. Valid lines are still analyzed so that one typo does not hide the rest of the circuit.

## How to read the report

### Peak cut and peak step

For an `n`-qubit circuit, a cut such as `2|3` means the first two wires are compared with the remaining three. The peak cut is where the largest contiguous bipartite entropy was observed; the peak step tells you when it happened.

### Entanglement heatmap

Each row is a wire cut and each column is a circuit step. Colors are normalized against the maximum possible entropy for that cut, so cuts of different sizes can be compared visually.

### Estimated depth

Depth is a simple source-order moment schedule. Gates acting on disjoint qubits may share a moment; gates touching the same qubit advance the schedule. This is a hardware-independent structural estimate.

### Complexity pressure

The 0–100 indicator combines:

- normalized peak entropy;
- the fraction of gates that are entangling;
- estimated depth.

It is intentionally transparent and non-rigorous. Use it to compare small circuits in the same context, not to predict the runtime of a particular classical computer.

### Effective Schmidt rank

EntangleMap reports `2^S` at the peak, where `S` is the peak entropy in bits. This is an entropy-derived indicator, not an exact Schmidt-rank calculation.

## Method and architecture

1. The parser converts each valid input line into a typed gate operation.
2. A Web Worker evolves a `Float64Array` statevector so the UI remains responsive.
3. For every step and contiguous cut, EntangleMap constructs a reduced density matrix.
4. A Jacobi eigenvalue routine obtains the density-matrix spectrum.
5. Von Neumann entropy, circuit metrics, final probabilities, and report data are returned to the UI.

The current design is deliberately small and inspectable. Mathematical conventions, limits, and test cases are documented in the in-app [documentation](/docs).

## Limits and known scope

- Maximum selectable width: 10 qubits.
- Intended for small, educational, and early-stage exploratory circuits.
- Statevector memory and entropy calculation both grow exponentially with width.
- Only contiguous wire cuts are analyzed in this release.
- The simulator does not model noise, measurement collapse, hardware connectivity, transpilation, or sampling statistics.

## Development roadmap

The next 3–6 month open-source milestone is **entanglement-aware circuit debugging**:

1. Validate against a larger reference suite and an independent implementation.
2. Add gate-level hotspot explanations around the peak step.
3. Add layer-by-layer comparison and circuit diffing.
4. Publish reproducible Bell/GHZ, QAOA, and ansatz tutorials.
5. Gather educator and developer feedback and stabilize the JSON report format.

See [UNITARY_FOUNDATION_PROPOSAL.md](./UNITARY_FOUNDATION_PROPOSAL.md) for the project thesis, milestones, success measures, budget, and two-minute grant video outline.

## License

EntangleMap is released under the [MIT License](./LICENSE).
