export enum GateType {
    I = 'I',
    H = 'H',
    X = 'X',
    Y = 'Y',
    Z = 'Z',
    RX = 'RX',
    RY = 'RY',
    RZ = 'RZ',
    CX = 'CX',
    CZ = 'CZ',
    SWAP = 'SWAP',
}

export interface Gate {
    type: GateType;
    targets: number[];
    controls?: number[];
    param?: number; // For rotation gates
    line?: number; // Source line, when parsed from user input
}

export class QuantumState {
    numQubits: number;
    amplitudes: Float64Array; // [real0, imag0, real1, imag1, ...]

    constructor(numQubits: number) {
        this.numQubits = numQubits;
        const numStates = 1 << numQubits;
        this.amplitudes = new Float64Array(numStates * 2);
        // Initial state |0...0>
        this.amplitudes[0] = 1.0;
        this.amplitudes[1] = 0.0;
    }

    applyGate(gate: Gate) {
        const { type, targets, controls = [], param = 0 } = gate;
        const numStates = 1 << this.numQubits;

        if (targets.length === 0 || targets.some((target) => target < 0 || target >= this.numQubits)) {
            throw new Error(`Invalid target for ${type} gate.`);
        }

        // Check controls mask
        let controlMask = 0;
        for (const c of controls) controlMask |= (1 << c);

        const t = targets[0];
        const tMask = 1 << t;

        const newAmplitudes = new Float64Array(this.amplitudes.length);
        newAmplitudes.set(this.amplitudes);

        if (type === GateType.CX) {
            for (let i = 0; i < numStates; i++) {
                if ((i & controlMask) === controlMask) {
                    const pair = i ^ tMask;
                    if (i < pair) {
                        const r1 = this.amplitudes[i * 2];
                        const i1 = this.amplitudes[i * 2 + 1];
                        const r2 = this.amplitudes[pair * 2];
                        const i2 = this.amplitudes[pair * 2 + 1];

                        newAmplitudes[i * 2] = r2;
                        newAmplitudes[i * 2 + 1] = i2;
                        newAmplitudes[pair * 2] = r1;
                        newAmplitudes[pair * 2 + 1] = i1;
                    }
                }
            }
        } else if (type === GateType.CZ) {
            for (let i = 0; i < numStates; i++) {
                if ((i & controlMask) === controlMask && (i & tMask) !== 0) {
                    newAmplitudes[i * 2] = -this.amplitudes[i * 2];
                    newAmplitudes[i * 2 + 1] = -this.amplitudes[i * 2 + 1];
                }
            }
        } else if (type === GateType.SWAP) {
            if (targets.length !== 2) throw new Error('SWAP requires two targets.');
            const firstMask = 1 << targets[0];
            const secondMask = 1 << targets[1];
            for (let i = 0; i < numStates; i++) {
                if ((i & controlMask) === controlMask && (i & firstMask) === 0 && (i & secondMask) !== 0) {
                    const pair = i ^ firstMask ^ secondMask;
                    newAmplitudes[i * 2] = this.amplitudes[pair * 2];
                    newAmplitudes[i * 2 + 1] = this.amplitudes[pair * 2 + 1];
                    newAmplitudes[pair * 2] = this.amplitudes[i * 2];
                    newAmplitudes[pair * 2 + 1] = this.amplitudes[i * 2 + 1];
                }
            }
        } else if (type === GateType.I) {
            return;
        } else {
            const halfTurn = param / 2;
            const cos = Math.cos(halfTurn);
            const sin = Math.sin(halfTurn);
            const invSqrt2 = 1 / Math.sqrt(2);

            switch (type) {
                case GateType.H:
                    this.applySingleQubitMatrix(newAmplitudes, tMask, controlMask, [invSqrt2, 0, invSqrt2, 0, invSqrt2, 0, -invSqrt2, 0]);
                    break;
                case GateType.X:
                    this.applySingleQubitMatrix(newAmplitudes, tMask, controlMask, [0, 0, 1, 0, 1, 0, 0, 0]);
                    break;
                case GateType.Y:
                    this.applySingleQubitMatrix(newAmplitudes, tMask, controlMask, [0, 0, 0, -1, 0, 1, 0, 0]);
                    break;
                case GateType.Z:
                    this.applySingleQubitMatrix(newAmplitudes, tMask, controlMask, [1, 0, 0, 0, 0, 0, -1, 0]);
                    break;
                case GateType.RX:
                    this.applySingleQubitMatrix(newAmplitudes, tMask, controlMask, [cos, 0, 0, -sin, 0, -sin, cos, 0]);
                    break;
                case GateType.RY:
                    this.applySingleQubitMatrix(newAmplitudes, tMask, controlMask, [cos, 0, -sin, 0, sin, 0, cos, 0]);
                    break;
                case GateType.RZ:
                    this.applySingleQubitMatrix(newAmplitudes, tMask, controlMask, [Math.cos(-halfTurn), Math.sin(-halfTurn), 0, 0, 0, 0, Math.cos(halfTurn), Math.sin(halfTurn)]);
                    break;
                default:
                    throw new Error(`Unsupported gate ${type}.`);
            }
        }

        this.amplitudes = newAmplitudes;
    }

    private applySingleQubitMatrix(
        output: Float64Array,
        targetMask: number,
        controlMask: number,
        matrix: [number, number, number, number, number, number, number, number],
    ) {
        const numStates = 1 << this.numQubits;
        const [m00r, m00i, m01r, m01i, m10r, m10i, m11r, m11i] = matrix;

        for (let i = 0; i < numStates; i++) {
            if ((i & targetMask) !== 0 || (i & controlMask) !== controlMask) continue;
            const pair = i | targetMask;
            const r0 = this.amplitudes[i * 2];
            const i0 = this.amplitudes[i * 2 + 1];
            const r1 = this.amplitudes[pair * 2];
            const i1 = this.amplitudes[pair * 2 + 1];

            output[i * 2] = m00r * r0 - m00i * i0 + m01r * r1 - m01i * i1;
            output[i * 2 + 1] = m00r * i0 + m00i * r0 + m01r * i1 + m01i * r1;
            output[pair * 2] = m10r * r0 - m10i * i0 + m11r * r1 - m11i * i1;
            output[pair * 2 + 1] = m10r * i0 + m10i * r0 + m11r * i1 + m11i * r1;
        }
    }

    clone(): QuantumState {
        const s = new QuantumState(this.numQubits);
        s.amplitudes.set(this.amplitudes);
        return s;
    }
}
