import { GateType } from './simulator';
import type { Gate } from './simulator';

export type ParseDiagnostic = {
    line: number;
    severity: 'error' | 'warning';
    message: string;
};

export type ParsedCircuit = {
    gates: Gate[];
    diagnostics: ParseDiagnostic[];
};

const SINGLE_QUBIT_GATES = new Set<string>(['I', 'H', 'X', 'Y', 'Z', 'RX', 'RY', 'RZ']);
const TWO_QUBIT_GATES = new Set<string>(['CX', 'CZ', 'SWAP']);

function parseAngleExpression(source: string): number | null {
    const input = source.replace(/π/gi, 'pi').replace(/\s+/g, '').toLowerCase();
    if (!input) return null;

    let cursor = 0;

    const peek = () => input[cursor] ?? '';
    const consume = (value: string) => {
        if (input.slice(cursor, cursor + value.length) === value) {
            cursor += value.length;
            return true;
        }
        return false;
    };

    const parseExpression = (): number | null => {
        let value = parseTerm();
        if (value === null) return null;

        while (peek() === '+' || peek() === '-') {
            const operator = peek();
            cursor += 1;
            const right = parseTerm();
            if (right === null) return null;
            value = operator === '+' ? value + right : value - right;
        }
        return value;
    };

    const parseTerm = (): number | null => {
        let value = parseFactor();
        if (value === null) return null;

        while (peek() === '*' || peek() === '/') {
            const operator = peek();
            cursor += 1;
            const right = parseFactor();
            if (right === null || (operator === '/' && right === 0)) return null;
            value = operator === '*' ? value * right : value / right;
        }
        return value;
    };

    const parseFactor = (): number | null => {
        if (consume('+')) return parseFactor();
        if (consume('-')) {
            const value = parseFactor();
            return value === null ? null : -value;
        }
        if (consume('(')) {
            const value = parseExpression();
            if (!consume(')')) return null;
            return value;
        }
        if (consume('pi')) return Math.PI;

        const match = input.slice(cursor).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
        if (!match) return null;
        cursor += match[0].length;
        const value = Number(match[0]);
        return Number.isFinite(value) ? value : null;
    };

    const value = parseExpression();
    return value !== null && cursor === input.length ? value : null;
}

function extractQubitIndex(token: string): number | null {
    const qasmMatch = token.match(/^(?:[a-z_][a-z0-9_]*)?\s*\[\s*(\d+)\s*\]$/i);
    if (qasmMatch) return Number(qasmMatch[1]);

    const bareMatch = token.match(/^\d+$/);
    return bareMatch ? Number(bareMatch[0]) : null;
}

function splitTokens(source: string): string[] {
    return source
        .replace(/,/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

function stripComments(line: string): string {
    return line.replace(/\/\/.*$/, '').replace(/#.*/, '').trim();
}

/**
 * Parse the small, intentionally documented subset of OpenQASM 2.0 used by the
 * profiler. The parser also accepts the compact pseudo syntax used by the demo:
 * `H 0`, `CX 0 1`, and `RZ 1 pi/2`.
 */
export function parseCircuit(source: string, numQubits: number): ParsedCircuit {
    const gates: Gate[] = [];
    const diagnostics: ParseDiagnostic[] = [];

    source.split('\n').forEach((rawLine, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const line = stripComments(rawLine).replace(/;\s*$/, '').trim();
        if (!line) return;

        const lower = line.toLowerCase();
        if (/^(openqasm|include|qreg|creg)\b/.test(lower)) return;
        if (/^barrier\b/.test(lower)) {
            diagnostics.push({ line: lineNumber, severity: 'warning', message: 'Barrier is ignored during statevector analysis.' });
            return;
        }
        if (/^(measure|reset)\b/.test(lower)) {
            diagnostics.push({ line: lineNumber, severity: 'warning', message: 'Measurement/reset is not simulated; the profiler analyzes the unitary portion only.' });
            return;
        }

        // OpenQASM commonly writes rotations as `rz(pi/2) q[0]`.
        const qasmParameterMatch = line.match(/^([a-z][a-z0-9_]*)\s*\(([^)]*)\)\s+(.+)$/i);
        const qasmOperation = qasmParameterMatch?.[1];
        const parameterSource = qasmParameterMatch?.[2];
        const operandSource = qasmParameterMatch?.[3] ?? line;
        const tokens = splitTokens(operandSource);
        const operation = (qasmOperation ?? tokens.shift() ?? '').toUpperCase();

        if (!SINGLE_QUBIT_GATES.has(operation) && !TWO_QUBIT_GATES.has(operation)) {
            diagnostics.push({ line: lineNumber, severity: 'error', message: `Unsupported gate “${operation || '(missing)'}”.` });
            return;
        }

        const qubits = tokens
            .map(extractQubitIndex)
            .filter((index): index is number => index !== null);

        const expectedQubits = TWO_QUBIT_GATES.has(operation) ? 2 : 1;
        if (qubits.length !== expectedQubits) {
            diagnostics.push({
                line: lineNumber,
                severity: 'error',
                message: `${operation} expects ${expectedQubits} qubit operand${expectedQubits === 1 ? '' : 's'}; found ${qubits.length}.`,
            });
            return;
        }

        const invalidQubit = qubits.find((qubit) => qubit < 0 || qubit >= numQubits);
        if (invalidQubit !== undefined) {
            diagnostics.push({ line: lineNumber, severity: 'error', message: `Qubit q[${invalidQubit}] is outside the selected ${numQubits}-qubit register.` });
            return;
        }

        const isRotation = operation === 'RX' || operation === 'RY' || operation === 'RZ';
        let param: number | undefined;
        if (isRotation) {
            const pseudoParameter = tokens[1];
            const rawParameter = parameterSource ?? pseudoParameter;
            if (!rawParameter) {
                diagnostics.push({ line: lineNumber, severity: 'error', message: `${operation} requires an angle, for example pi/2 or 1.57.` });
                return;
            }
            const parsedParameter = parseAngleExpression(rawParameter);
            if (parsedParameter === null) {
                diagnostics.push({ line: lineNumber, severity: 'error', message: `Could not parse angle “${rawParameter}”.` });
                return;
            }
            param = parsedParameter;
        }

        const type = operation as GateType;
        if (operation === 'CX' || operation === 'CZ') {
            gates.push({ type, targets: [qubits[1]], controls: [qubits[0]], line: lineNumber });
        } else if (operation === 'SWAP') {
            gates.push({ type, targets: qubits, line: lineNumber });
        } else {
            gates.push({ type, targets: [qubits[0]], ...(param === undefined ? {} : { param }), line: lineNumber });
        }
    });

    return { gates, diagnostics };
}
