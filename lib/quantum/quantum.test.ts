import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCircuitMetrics } from './analysis';
import { calculateEntropyForCut } from './entropy';
import { parseCircuit } from './parser';
import { GateType, QuantumState } from './simulator';

function closeTo(actual: number, expected: number, tolerance = 1e-9) {
    assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('parses pseudo syntax and safe angle expressions', () => {
    const parsed = parseCircuit('H 0\nCX 0 1\nRZ 1 3*pi/4', 2);

    assert.equal(parsed.diagnostics.length, 0);
    assert.deepEqual(parsed.gates.map((gate) => gate.type), [GateType.H, GateType.CX, GateType.RZ]);
    closeTo(parsed.gates[2].param ?? 0, (3 * Math.PI) / 4);
});

test('parses the supported OpenQASM forms and reports invalid input', () => {
    const parsed = parseCircuit('OPENQASM 2.0;\nqreg q[2];\nh q[0];\ncx q[0], q[1];\nRZ 2 pi/2;', 2);

    assert.equal(parsed.gates.length, 2);
    assert.equal(parsed.diagnostics.length, 1);
    assert.match(parsed.diagnostics[0].message, /outside/);
});

test('Bell state has one e-bit of entropy', () => {
    const state = new QuantumState(2);
    state.applyGate({ type: GateType.H, targets: [0] });
    state.applyGate({ type: GateType.CX, targets: [1], controls: [0] });

    closeTo(state.amplitudes[0], 1 / Math.sqrt(2));
    closeTo(state.amplitudes[6], 1 / Math.sqrt(2));
    closeTo(calculateEntropyForCut(state.amplitudes, 2, 1), 1, 1e-7);
});

test('declared single and two-qubit gates change the state', () => {
    const state = new QuantumState(2);
    state.applyGate({ type: GateType.X, targets: [0] });
    state.applyGate({ type: GateType.SWAP, targets: [0, 1] });

    closeTo(state.amplitudes[4], 1);
});

test('circuit metrics expose an actionable peak location', () => {
    const metrics = calculateCircuitMetrics(
        [
            { type: GateType.H, targets: [0] },
            { type: GateType.H, targets: [1] },
            { type: GateType.CX, targets: [1], controls: [0] },
        ],
        [[0, 0], [0.4, 0.2], [1, 0.3]],
        3,
    );

    assert.equal(metrics.depth, 2);
    assert.equal(metrics.twoQubitGates, 1);
    assert.equal(metrics.peakStep, 3);
    assert.equal(metrics.peakCut, 1);
});
