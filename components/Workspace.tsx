"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { SimulationRequest, SimulationResponse } from '../lib/quantum/worker';
import { parseCircuit } from '../lib/quantum/parser';
import type { ParseDiagnostic } from '../lib/quantum/parser';

export default function Workspace() {
    const [numQubits, setNumQubits] = useState(5);
    const [code, setCode] = useState<string>('');
    const [showCode, setShowCode] = useState<boolean>(false);
    const [results, setResults] = useState<SimulationResponse | null>(null);
    const [isComputing, setIsComputing] = useState(false);
    const [workerError, setWorkerError] = useState<string | null>(null);

    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize Web Worker
        workerRef.current = new Worker(new URL('../lib/quantum/worker.ts', import.meta.url));
        workerRef.current.onmessage = (e: MessageEvent<SimulationResponse>) => {
            setResults(e.data);
            setIsComputing(false);
        };
        workerRef.current.onerror = () => {
            setWorkerError('Simulation failed. Check the circuit and try again.');
            setIsComputing(false);
        };
        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const parsedCircuit = React.useMemo(() => parseCircuit(code, numQubits), [code, numQubits]);
    const gates = parsedCircuit.gates;
    const diagnostics = parsedCircuit.diagnostics;

    useEffect(() => {
        if (workerRef.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsComputing(true);
            setWorkerError(null);
            workerRef.current.postMessage({ numQubits, gates } as SimulationRequest);
        }
    }, [gates, numQubits]);

    const exportReport = () => {
        if (!results) return;
        const report = {
            format: 'ket-profiler-report/v1',
            generatedAt: new Date().toISOString(),
            numQubits,
            source: code,
            gates,
            diagnostics,
            metrics: results.metrics,
            pressureScore: results.pressureScore,
            entropies: results.entropies,
            finalStateProbabilities: Array.from({ length: 1 << numQubits }, (_, index) => {
                const real = results.amplitudes[index * 2] ?? 0;
                const imaginary = results.amplitudes[index * 2 + 1] ?? 0;
                return real * real + imaginary * imaginary;
            }),
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'ket-profiler-report.json';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const loadTemplate = (name: string) => {
        if (name === 'GHZ') {
            let c = `H 0\n`;
            for (let i = 0; i < numQubits - 1; i++) c += `CX ${i} ${i + 1}\n`;
            setCode(c);
        } else if (name === 'VQE_Ansatz_Layer') {
            let c = ``;
            for (let i = 0; i < numQubits; i++) c += `RY ${i} 0.785\n`;
            for (let i = 0; i < numQubits - 1; i++) c += `CX ${i} ${i + 1}\n`;
            setCode(c);
        } else if (name === 'Random_Circuit') {
            let c = ``;
            for (let i = 0; i < 20; i++) {
                const t = Math.floor(Math.random() * numQubits);
                const type = ['H', 'X', 'RZ'][Math.floor(Math.random() * 3)];
                if (type === 'RZ') {
                    c += `RZ ${t} ${Math.random().toFixed(2)}\n`;
                } else {
                    c += `${type} ${t}\n`;
                }
                if (Math.random() < 0.3 && numQubits > 1) {
                    let cn = Math.floor(Math.random() * numQubits);
                    while (cn === t) cn = Math.floor(Math.random() * numQubits);
                    c += `CX ${cn} ${t}\n`;
                }
            }
            setCode(c);
        } else if (name === 'Bell') {
            if (numQubits >= 2) setCode(`H 0\nCX 0 1\n`);
        } else if (name === 'QAOA_MaxCut') {
            let c = ``;
            for (let i = 0; i < numQubits; i++) c += `H ${i}\n`;
            for (let i = 0; i < numQubits; i++) {
                const next = (i + 1) % numQubits;
                if (numQubits > 1 && i < numQubits - 1) {
                    c += `CX ${i} ${next}\nRZ ${next} 1.047\nCX ${i} ${next}\n`;
                }
            }
            for (let i = 0; i < numQubits; i++) c += `H ${i}\nRZ ${i} -0.785\nH ${i}\n`;
            setCode(c);
        }
    };

    const clearCircuit = () => {
        setCode('');
    };

    // Rendering the circuit
    // Display qubits as rows, steps as columns

    return (
        <div className="workspace animate-fade">
            <div className="panel editor-panel">
                <h2 className="section-title">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Code & Circuit Viewer
                </h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Qubits</label>
                        <select value={numQubits} onChange={(e) => { setNumQubits(parseInt(e.target.value)); setCode(''); }} className="select-box" style={{ width: '80px' }}>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    <button className="btn" onClick={() => loadTemplate('GHZ')}>GHZ</button>
                    <button className="btn" onClick={() => loadTemplate('Bell')}>Bell</button>
                    <button className="btn" onClick={() => loadTemplate('VQE_Ansatz_Layer')}>VQE</button>
                    <button className="btn" onClick={() => loadTemplate('QAOA_MaxCut')}>QAOA</button>
                    <button className="btn" onClick={() => loadTemplate('Random_Circuit')}>Random</button>
                    <button className="btn" onClick={() => setShowCode(!showCode)} style={{ borderColor: showCode ? 'var(--accent-primary)' : 'var(--border-light)' }}>
                        {showCode ? 'Hide Code' : 'View / Edit Code'}
                    </button>
                    <div style={{ flex: 1 }}></div>
                    <button className="btn" onClick={clearCircuit} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Clear</button>
                </div>

                {diagnostics.length > 0 && (
                    <div className="diagnostics-panel" role="status" aria-live="polite">
                        <div className="diagnostics-title">Input diagnostics</div>
                        {diagnostics.map((diagnostic: ParseDiagnostic, index) => (
                            <div key={`${diagnostic.line}-${index}`} className={`diagnostic diagnostic-${diagnostic.severity}`}>
                                <span>Line {diagnostic.line}</span>
                                <span>{diagnostic.message}</span>
                            </div>
                        ))}
                    </div>
                )}

                {numQubits >= 10 && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', color: '#eab308', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Performance Warning: 10+ qubits may cause high memory and CPU usage in the browser.
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    {showCode && (
                        <div className="animate-fade" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2px' }}>
                            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Quantum Assembly (QASM/Pseudo)</span>
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Write pseudo code here... e.g.&#10;H 0&#10;CX 0 1&#10;RZ 1 1.57"
                                style={{ width: '100%', height: '150px', background: 'transparent', color: 'var(--text-primary)', border: 'none', padding: '1rem', fontFamily: 'var(--font-geist-mono), monospace', resize: 'vertical', outline: 'none' }}
                                spellCheck={false}
                            />
                        </div>
                    )}

                    <div className="circuit-grid" style={{ flex: 1, border: '1px solid var(--border-light)', borderRadius: '8px', padding: '1rem', minHeight: '200px' }}>
                        {gates.length === 0 && <div className="empty-circuit">Load an example or enter a gate sequence to begin profiling.</div>}
                        {Array.from({ length: numQubits }).map((_, qIndex) => (
                            <div key={qIndex} className="circuit-wire">
                                <div className="wire-label">q[{qIndex}]</div>
                                {gates.map((g, stepIdx) => {
                                    const isTarget = g.targets.includes(qIndex);
                                    const isControl = g.controls?.includes(qIndex);
                                    const isMulti = isTarget || isControl;

                                    return (
                                        <div key={stepIdx} className="circuit-step" style={{ minWidth: '60px' }}>
                                            {/* Vertical line for multi-qubit gates */}
                                            {isMulti && g.controls && g.targets && (
                                                <div className="vertical-line" style={{
                                                    top: Math.min(g.targets[0], g.controls[0]) < qIndex ? '-30px' : '22px',
                                                    height: Math.abs(g.targets[0] - (g.controls[0] || 0)) >= 1 && (Math.min(g.targets[0], g.controls[0]) < qIndex && Math.max(g.targets[0], g.controls[0]) > qIndex) ? '60px' :
                                                        (qIndex === Math.min(g.targets[0], g.controls[0]) ? '38px' : '0px')
                                                }} />
                                            )}

                                            {isTarget && <div className="placed-gate">{g.type}</div>}
                                            {isControl && <div className="placed-gate control"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="panel metrics-panel">
                <h2 className="section-title">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Profiler Metrics
                </h2>

                {isComputing ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        Simulating Quantum State...
                    </div>
                ) : results ? (
                    <div className="animate-fade">
                        <div className="metrics-toolbar">
                            <span className="result-status">Analysis complete · {results.metrics.totalGates} gates</span>
                            <button className="btn" onClick={exportReport}>Export JSON report</button>
                        </div>

                        <div className="metric-summary-grid">
                            <div className="metric-card compact-card">
                                <div className="metric-header">Estimated depth</div>
                                <div className="metric-value compact-value">{results.metrics.depth}</div>
                                <div className="metric-help">parallel moments</div>
                            </div>
                            <div className="metric-card compact-card">
                                <div className="metric-header">Entangling gates</div>
                                <div className="metric-value compact-value">{results.metrics.twoQubitGates}</div>
                                <div className="metric-help">{(results.metrics.twoQubitDensity * 100).toFixed(0)}% of gates</div>
                            </div>
                            <div className="metric-card compact-card">
                                <div className="metric-header">Peak cut</div>
                                <div className="metric-value compact-value">{results.metrics.peakCut ? `${results.metrics.peakCut}|${numQubits - results.metrics.peakCut}` : '—'}</div>
                                <div className="metric-help">step {results.metrics.peakStep || '—'}</div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">Complexity Pressure (heuristic)</div>
                            <div className="metric-value">
                                {results.pressureScore} <span>/ 100</span>
                            </div>
                            <div className="hardness-bar">
                                <div className="hardness-fill" style={{ width: `${results.pressureScore}%` }}></div>
                            </div>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                A bounded comparison indicator based on normalized entanglement, entangling-gate density, and depth. It is not a runtime prediction.
                            </p>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">Peak Entanglement Entropy</div>
                            <div className="metric-value">
                                {results.peakEntropy.toFixed(3)} <span>e-bits</span>
                            </div>
                        </div>

                        <div>
                            <div className="metric-header" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Entanglement Heatmap</div>
                            <div className="heatmap-legend"><span>low</span><span>high</span></div>
                            {results.entropies.length > 0 && (
                                <div className="entropy-heatmap">
                                    <div className="heatmap-axis">step →</div>
                                    {Array.from({ length: numQubits - 1 }).map((_, cutIdx) => {
                                        return (
                                            <div key={cutIdx} className="heatmap-row" style={{ gridTemplateColumns: `2.7rem repeat(${results.entropies.length}, 0.55rem)` }}>
                                                <div className="heatmap-label">{cutIdx + 1}|{numQubits - cutIdx - 1}</div>
                                                {results.entropies.map((step, stepIdx) => {
                                                    const value = step[cutIdx] ?? 0;
                                                    const maxPossible = Math.min(cutIdx + 1, numQubits - cutIdx - 1) || 1;
                                                    const intensity = Math.min(1, value / maxPossible);
                                                    return <div key={stepIdx} className="heatmap-cell" title={`Step ${stepIdx + 1}, cut ${cutIdx + 1}|${numQubits - cutIdx - 1}: ${value.toFixed(3)} e-bits`} style={{ background: `rgba(124, 58, 237, ${0.08 + intensity * 0.92})` }} />;
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            {results.metrics.peakCut > 0 && <p className="metric-help" style={{ marginTop: '0.75rem' }}>The strongest observed correlation crosses cut {results.metrics.peakCut}|{numQubits - results.metrics.peakCut} at step {results.metrics.peakStep}, reaching {results.peakEntropy.toFixed(3)} e-bits.</p>}
                        </div>

                        <div className="metric-card insight-card">
                            <div className="metric-header">What this suggests</div>
                            <p>
                                {results.metrics.normalizedPeakEntropy >= 0.75
                                    ? 'Entanglement is close to the selected cut’s maximum. Inspect the gates around the peak step before increasing circuit depth.'
                                    : results.metrics.twoQubitDensity >= 0.35
                                        ? 'The circuit is entangling frequently, but the observed cut entropy is moderate. Compare gate placement and layer depth to reduce unnecessary two-qubit work.'
                                        : 'The circuit remains relatively weakly entangled. This is a useful baseline for checking whether later ansatz layers add meaningful correlations.'}
                            </p>
                            <div className="metric-help">Effective Schmidt rank at the peak: {results.metrics.effectiveSchmidtRank.toFixed(2)} (derived from entropy; not an exact rank).</div>
                        </div>

                        {/* State Probabilities Visualization */}
                        {results.amplitudes && results.amplitudes.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <div className="metric-header" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    Final State Probabilities (Top 8)
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                                    {(() => {
                                        const probs: { state: string; p: number }[] = [];
                                        const numStates = 1 << numQubits;
                                        for (let i = 0; i < numStates; i++) {
                                            const r = results.amplitudes[i * 2];
                                            const im = results.amplitudes[i * 2 + 1];
                                            const p = r * r + im * im;
                                            if (p > 0.0001) {
                                                probs.push({ state: '|' + i.toString(2).padStart(numQubits, '0') + '⟩', p });
                                            }
                                        }
                                        return probs.sort((a, b) => b.p - a.p).slice(0, 8).map((st, idx) => (
                                            <div key={idx} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.75rem', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'var(--accent-primary)', width: `${st.p * 100}%` }}></div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)', fontWeight: 'bold' }}>{st.state}</div>
                                                <div style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>{(st.p * 100).toFixed(1)}%</div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                ) : workerError ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
                        {workerError}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        Add gates to see metrics.
                    </div>
                )}
            </div>
        </div>
    );
}
