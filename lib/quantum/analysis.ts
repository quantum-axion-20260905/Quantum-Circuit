import type { Gate } from './simulator';

export type CutMetric = {
    cut: number;
    maxEntropy: number;
    peakStep: number;
    finalEntropy: number;
    normalizedPeakEntropy: number;
};

export type CircuitMetrics = {
    totalGates: number;
    singleQubitGates: number;
    twoQubitGates: number;
    depth: number;
    twoQubitDensity: number;
    peakEntropy: number;
    peakStep: number;
    peakCut: number;
    normalizedPeakEntropy: number;
    effectiveSchmidtRank: number;
    cutMetrics: CutMetric[];
};

function isTwoQubitGate(gate: Gate): boolean {
    return gate.targets.length > 1 || Boolean(gate.controls?.length);
}

/** Calculate a hardware-independent moment/depth estimate in source order. */
function calculateDepth(gates: Gate[]): number {
    const nextAvailableLayer: number[] = [];
    let depth = 0;

    gates.forEach((gate) => {
        const qubits = [...(gate.controls ?? []), ...gate.targets];
        const layer = qubits.reduce((latest, qubit) => Math.max(latest, nextAvailableLayer[qubit] ?? 0), 0);
        qubits.forEach((qubit) => {
            nextAvailableLayer[qubit] = layer + 1;
        });
        depth = Math.max(depth, layer + 1);
    });

    return depth;
}

export function calculateCircuitMetrics(
    gates: Gate[],
    entropies: number[][],
    numQubits: number,
): CircuitMetrics {
    const cutMetrics: CutMetric[] = Array.from({ length: Math.max(0, numQubits - 1) }, (_, cutIndex) => {
        const cut = cutIndex + 1;
        let maxEntropy = 0;
        let peakStep = 0;
        entropies.forEach((step, stepIndex) => {
            const entropy = step[cutIndex] ?? 0;
            if (entropy > maxEntropy) {
                maxEntropy = entropy;
                peakStep = stepIndex + 1;
            }
        });
        const maxPossibleEntropy = Math.min(cut, numQubits - cut) || 1;
        return {
            cut,
            maxEntropy,
            peakStep,
            finalEntropy: entropies.at(-1)?.[cutIndex] ?? 0,
            normalizedPeakEntropy: Math.min(1, maxEntropy / maxPossibleEntropy),
        };
    });

    let peakEntropy = 0;
    let peakStep = 0;
    let peakCut = 0;
    entropies.forEach((step, stepIndex) => {
        step.forEach((entropy, cutIndex) => {
            if (entropy > peakEntropy) {
                peakEntropy = entropy;
                peakStep = stepIndex + 1;
                peakCut = cutIndex + 1;
            }
        });
    });

    const maxPossibleEntropy = peakCut > 0 ? Math.min(peakCut, numQubits - peakCut) : 1;
    const normalizedPeakEntropy = Math.min(1, peakEntropy / maxPossibleEntropy);
    const twoQubitGates = gates.filter(isTwoQubitGate).length;

    return {
        totalGates: gates.length,
        singleQubitGates: gates.length - twoQubitGates,
        twoQubitGates,
        depth: calculateDepth(gates),
        twoQubitDensity: gates.length === 0 ? 0 : twoQubitGates / gates.length,
        peakEntropy,
        peakStep,
        peakCut,
        normalizedPeakEntropy,
        effectiveSchmidtRank: Math.pow(2, peakEntropy),
        cutMetrics,
    };
}

/**
 * A transparent, bounded indicator for classroom-scale comparisons. It is not
 * a runtime prediction and should never be presented as one.
 */
export function calculatePressureScore(metrics: CircuitMetrics): number {
    const entropyComponent = metrics.normalizedPeakEntropy * 55;
    const entanglingGateComponent = metrics.twoQubitDensity * 25;
    const depthComponent = Math.min(20, Math.log2(metrics.depth + 1) * 5);
    return Math.min(100, Math.round(entropyComponent + entanglingGateComponent + depthComponent));
}
