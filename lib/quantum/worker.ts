import { QuantumState } from "./simulator";
import type { Gate } from "./simulator";
import { calculateEntropyForCut } from "./entropy";
import { calculateCircuitMetrics, calculatePressureScore } from "./analysis";
import type { CircuitMetrics } from "./analysis";

export type SimulationRequest = {
    numQubits: number;
    gates: Gate[];
};

export type SimulationResponse = {
    entropies: number[][]; // [step][cut]
    peakEntropy: number;
    pressureScore: number;
    amplitudes: Float64Array; // final state
    metrics: CircuitMetrics;
};

self.onmessage = (e: MessageEvent<SimulationRequest>) => {
    const { numQubits, gates } = e.data;
    const state = new QuantumState(numQubits);

    const entropies: number[][] = [];
    let peakEntropy = 0;

    for (let step = 0; step < gates.length; step++) {
        state.applyGate(gates[step]);

        // Compute entropy for all n-1 cuts
        const stepEntropies: number[] = [];
        for (let cut = 1; cut < numQubits; cut++) {
            const ent = calculateEntropyForCut(state.amplitudes, numQubits, cut);
            stepEntropies.push(ent);
            if (ent > peakEntropy) {
                peakEntropy = ent;
            }
        }
        entropies.push(stepEntropies);
    }

    const metrics = calculateCircuitMetrics(gates, entropies, numQubits);
    const pressure = calculatePressureScore(metrics);

    self.postMessage({
        entropies,
        peakEntropy,
        pressureScore: pressure,
        amplitudes: state.amplitudes,
        metrics,
    } as SimulationResponse);
};
