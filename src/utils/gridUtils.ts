import type { GridNode } from '../types';

export const createInitialGrid = (rows: number, cols: number): GridNode[][] => {
    const grid: GridNode[][] = [];
    for (let r = 0; r < rows; r++) {
        const currentRow: GridNode[] = [];
        for (let c = 0; c < cols; c++) {
            currentRow.push({
                row: r,
                col: c,
                type: 'EMPTY',
                isVisited: false,
                isPath: false,
                distance: Infinity,
                heuristic: Infinity,
                totalCost: Infinity,
                parent: null,
            });
        }
        grid.push(currentRow);
    }
    return grid;
};
