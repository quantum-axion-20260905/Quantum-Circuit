import Link from 'next/link';
import type { ReactNode } from 'react';

const codeBlockStyle = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    padding: '1rem',
    overflowX: 'auto' as const,
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: 'var(--text-primary)',
};

const sectionTitleStyle = {
    fontSize: '1.8rem',
    color: 'var(--text-primary)',
    marginTop: '2.75rem',
    marginBottom: '1rem',
};

const paragraphStyle = {
    marginBottom: '1.25rem',
};

function CodeBlock({ children }: { children: string }) {
    return <pre style={codeBlockStyle}><code>{children}</code></pre>;
}

function MetricCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div style={{ background: 'var(--bg-panel)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ color: 'var(--accent-primary)', fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.95rem', marginBottom: 0 }}>{children}</p>
        </div>
    );
}

export default function DocsPage() {
    return (
        <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }} className="animate-fade">
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    KET v0.2.0 · User guide
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Read your circuit’s story
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.7, maxWidth: '720px' }}>
                    KET turns a small quantum circuit into an explainable report: where correlation grows, when it peaks, and which structural properties deserve attention next.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                <MetricCard title="Local by default">The circuit and statevector stay in the browser.</MetricCard>
                <MetricCard title="Step-aware">Entropy is computed after every valid gate.</MetricCard>
                <MetricCard title="Reproducible">Export the source and report as JSON.</MetricCard>
            </div>

            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                <h2 style={sectionTitleStyle}>1. Quick start</h2>
                <p style={paragraphStyle}>
                    Choose <strong>Bell</strong>, <strong>GHZ</strong>, <strong>VQE</strong>, or <strong>QAOA</strong> to load an example. For your own circuit, open <strong>View / Edit Code</strong>, paste the input, and watch the report update as you type.
                </p>
                <p style={paragraphStyle}>
                    A useful first experiment is to compare a Bell state with a product-state circuit. The Bell state is only two gates, but its entropy across the first cut reaches one e-bit. That difference is the kind of physical signal KET is designed to make visible.
                </p>

                <h2 style={sectionTitleStyle}>2. Input format</h2>
                <p style={paragraphStyle}>KET accepts a small, explicit subset of OpenQASM 2.0 and a compact pseudo-syntax.</p>
                <CodeBlock>{`// Compact syntax
H 0
CX 0 1
RZ 1 pi/2
SWAP 2 3`}</CodeBlock>
                <div style={{ height: '0.75rem' }} />
                <CodeBlock>{`OPENQASM 2.0;
include "qelib1.inc";
qreg q[4];

h q[0];
rz(pi/2) q[0];
cx q[0], q[1];
swap q[2], q[3];`}</CodeBlock>

                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '1.75rem', marginBottom: '0.75rem' }}>Supported gates</h3>
                <ul style={{ paddingLeft: '1.4rem', marginBottom: '1.25rem' }}>
                    <li><code>I</code>, <code>H</code>, <code>X</code>, <code>Y</code>, <code>Z</code> — single-qubit gates</li>
                    <li><code>RX</code>, <code>RY</code>, <code>RZ</code> — rotations with numbers or expressions such as <code>pi/2</code></li>
                    <li><code>CX</code>, <code>CZ</code> — controlled two-qubit gates</li>
                    <li><code>SWAP</code> — exchange two qubits</li>
                </ul>
                <p style={paragraphStyle}>
                    Header declarations such as <code>OPENQASM</code>, <code>include</code>, <code>qreg</code>, and <code>creg</code> are accepted. <code>barrier</code> is ignored with a warning. <code>measure</code> and <code>reset</code> are reported but not simulated because this release analyzes the unitary portion of a circuit.
                </p>

                <h2 style={sectionTitleStyle}>3. Input diagnostics</h2>
                <p style={paragraphStyle}>
                    KET does not silently discard a malformed line. Unsupported gates, missing operands, invalid angles, and qubits outside the selected register appear with their source line number. Valid lines continue to run, so you can repair a circuit without losing the rest of the analysis.
                </p>

                <h2 style={sectionTitleStyle}>4. Understanding the report</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <MetricCard title="Peak cut">`2|3` means the first two wires are compared with the remaining three.</MetricCard>
                    <MetricCard title="Peak step">The gate step where the strongest observed correlation occurs.</MetricCard>
                    <MetricCard title="Estimated depth">A source-order moment schedule; disjoint gates may share a moment.</MetricCard>
                    <MetricCard title="Entangling gates">The count and proportion of gates that act across two qubits.</MetricCard>
                </div>
                <p style={paragraphStyle}>
                    The heatmap uses rows for contiguous wire cuts and columns for circuit steps. Each cell is normalized against the maximum possible entropy for its cut, which makes different cuts easier to compare visually. Hover a cell to see the raw e-bit value.
                </p>
                <p style={paragraphStyle}>
                    The <strong>Complexity Pressure</strong> indicator combines normalized peak entropy, entangling-gate density, and estimated depth. It is a transparent comparison aid for small circuits, not a prediction of runtime on a specific classical machine.
                </p>

                <h2 style={sectionTitleStyle}>5. What is being calculated?</h2>
                <p style={paragraphStyle}>
                    For each valid gate, a Web Worker evolves a complex statevector. For each contiguous cut, KET constructs a reduced density matrix by tracing out the complementary subsystem. The eigenvalues of that matrix are used to calculate Von Neumann entropy:
                </p>
                <CodeBlock>{`S(rho) = -sum(p_i * log2(p_i))`}</CodeBlock>
                <p style={{ ...paragraphStyle, marginTop: '1.25rem' }}>
                    The implementation uses a Jacobi eigenvalue routine and reports entropy in bits, or e-bits. The effective Schmidt-rank value shown in the UI is <code>2^S</code>; it is an entropy-derived indicator, not an exact rank calculation.
                </p>

                <h2 style={sectionTitleStyle}>6. Privacy, limits, and scope</h2>
                <p style={paragraphStyle}>
                    There is no backend in the analysis path. However, the application still depends on the browser environment and any hosting layer used to serve the static application. KET itself does not upload circuit source or statevector data.
                </p>
                <ul style={{ paddingLeft: '1.4rem', marginBottom: '1.25rem' }}>
                    <li>Maximum selectable width: 10 qubits.</li>
                    <li>Maximum documented circuit length: 150 steps.</li>
                    <li>Only contiguous wire cuts are analyzed.</li>
                    <li>No noise, measurement collapse, sampling, transpilation, or hardware connectivity model.</li>
                    <li>Statevector and entropy costs grow exponentially with qubit count.</li>
                </ul>

                <h2 style={sectionTitleStyle}>7. Export and reproducibility</h2>
                <p style={paragraphStyle}>
                    Click <strong>Export JSON report</strong> after an analysis completes. The file includes the report version, timestamp, selected width, original source, parsed gates, diagnostics, metrics, entropy timeline, pressure score, and final-state probabilities. This makes it suitable for attaching to a lesson, issue, experiment log, or review.
                </p>

                <h2 style={sectionTitleStyle}>8. Contributing</h2>
                <p style={paragraphStyle}>
                    The most valuable next contributions are independent reference checks, additional educational circuits, accessibility improvements, and feedback from people who teach or develop with quantum circuits. Run <code>npm test</code>, <code>npm run lint</code>, and <code>npm run build</code> before submitting a change.
                </p>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
                        &laquo; Back to Profiler Workspace
                    </Link>
                </div>
            </div>
        </main>
    );
}
