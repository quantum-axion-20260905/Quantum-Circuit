import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }} className="animate-fade">
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                About KET Profiler
            </h1>

            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    Welcome to the <strong>KET (Quantum Entanglement Tracker) Circuit Complexity Profiler</strong>.
                    This tool was built to bridge the gap between abstract quantum circuit design and intuitive physical understanding.
                </p>

                <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginTop: '3rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>The Core Problem</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    When researchers, learners, or developers design quantum algorithms—such as QAOA, VQE, or Shor&apos;s
                    Algorithm—they typically rely on standard circuit diagrams or code. These diagrams display wires and
                    gates, but they <strong>completely hide the most crucial quantum phenomenon: entanglement</strong>.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                    A circuit can look deep and complex, yet generate no entanglement at all (performing merely
                    classical tracking). Conversely, a very shallow circuit might create highly dense entanglement that
                    is exponentially difficult for classical computers to simulate. Without relying on heavy frameworks
                    like Qiskit or Cirq, or submitting jobs to an actual quantum supercomputer, it is incredibly difficult
                    to simply &quot;look&quot; at a circuit and instantly know its true quantum cost.
                </p>

                <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginTop: '3rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Project Intent & Goals</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    The overarching goal of the KET Profiler is to democratize access to <strong>quantum circuit analysis capabilities</strong> through a zero-installation, browser-based environment.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Accessible Analysis</h3>
                        <p style={{ fontSize: '0.95rem' }}>Eliminates the need to install Python toolchains. Anyone can paste a small OpenQASM circuit and get immediate physical insights.</p>
                    </div>
                    <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Educational Clarity</h3>
                        <p style={{ fontSize: '0.95rem' }}>Helps students visualize *when* and *where* quantum entanglement actually occurs step-by-step.</p>
                    </div>
                    <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>High Performance</h3>
                        <p style={{ fontSize: '0.95rem' }}>Leverages Web Workers and complex number arrays to simulate wavefunctions 100% on the client side.</p>
                    </div>
                </div>

                <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginTop: '3rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>How It Benefits the Ecosystem</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    KET Profiler seamlessly integrates real-time physical simulation into an intuitive dashboard:
                </p>
                <ul style={{ listStyle: 'none', paddingLeft: '0', marginBottom: '1.5rem' }}>
                    <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}>✨</span>
                        <div>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Visual Heatmaps for Entanglement Bottlenecks</strong>
                            By computing the Von Neumann Entropy across all bipartite cuts in a circuit, developers can instantly spot which layers of gates cause severe entanglement and which are redundant.
                        </div>
                    </li>
                    <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}>🛡️</span>
                        <div>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Zero Server Architecture (Privacy First)</strong>
                            Your proprietary quantum circuits never leave your laptop. Everything happens in your browser natively.
                        </div>
                    </li>
                    <li style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}>📊</span>
                        <div>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Circuit Pressure Indicator</strong>
                            A transparent comparison aid combining normalized entanglement, entangling-gate density, and estimated depth. It is not a runtime prediction.
                        </div>
                    </li>
                </ul>

                <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginTop: '3rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Support & Future Development</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    This open-source tool was designed and developed by <strong>AxionSoftware Inc</strong>. We strongly believe in the future of the quantum computing community.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                    KET Circuit Profiler is being developed as an open ecosystem tool that prioritizes education, accessibility, and robust visualizations that traditional SDKs often lack out-of-the-box. The next milestone is to make its diagnostics reproducible, testable, and useful in real circuit-design workflows.
                </p>

                <div style={{ marginTop: '4rem', textAlign: 'center', background: 'var(--bg-panel)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Ready to analyze your circuits?</h3>
                    <Link href="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                        Go to Workspace
                    </Link>
                </div>
            </div>
        </main>
    );
}
