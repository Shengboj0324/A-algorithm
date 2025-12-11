import type { GridNode, AlgorithmStep } from '../types';

interface SolverConfig {
    algorithm: string;
    heuristic: string;
    weight: number;
    // k: number;
    tie_breaker: string;
}

export const fetchSolution = async (
    grid: GridNode[][],
    start: GridNode,
    end: GridNode,
    config: SolverConfig
): Promise<AlgorithmStep[]> => { // Return the full trace
    const rows = grid.length;
    const cols = grid[0].length;

    // Safe mapping of circular references if any.
    // Actually, GridNode has `parent` which is circular/recursive. We must strip it for JSON.
    const cleanGrid = grid.map(row => row.map(node => ({
        row: node.row,
        col: node.col,
        type: node.type
    })));

    const cleanStart = { row: start.row, col: start.col, type: start.type };
    const cleanEnd = { row: end.row, col: end.col, type: end.type };

    const response = await fetch('http://localhost:8000/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grid: { rows, cols, nodes: cleanGrid },
            start: cleanStart,
            end: cleanEnd,
            config
        })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch solution');
    }

    const data = await response.json();
    return data.steps;
};
