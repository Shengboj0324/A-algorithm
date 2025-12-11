import React, { useRef } from 'react';
import type { GridNode } from '../types';
import clsx from 'clsx';

interface GridProps {
    grid: GridNode[][];
    onNodeClick?: (row: number, col: number) => void;
    onNodeDrag?: (row: number, col: number) => void;
    onNodeDragStart?: (row: number, col: number) => void;
    onNodeDragEnd?: () => void;
}

export const Grid: React.FC<GridProps> = ({ grid, onNodeClick, onNodeDrag, onNodeDragStart, onNodeDragEnd }) => {
    const isMouseDown = useRef(false);

    const handleMouseDown = (r: number, c: number) => {
        isMouseDown.current = true;
        onNodeDragStart?.(r, c);
        onNodeClick?.(r, c);
    };

    const handleMouseEnter = (r: number, c: number) => {
        if (isMouseDown.current) {
            onNodeDrag?.(r, c);
        }
    };

    const handleMouseUp = () => {
        isMouseDown.current = false;
        onNodeDragEnd?.();
    };

    return (
        <div
            className="grid gap-[1px] bg-gray-800 p-4 rounded-lg select-none"
            style={{
                gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`
            }}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
        >
            {grid.map((row) =>
                row.map((node) => (
                    <div
                        key={`${node.row}-${node.col}`}
                        onMouseDown={() => handleMouseDown(node.row, node.col)}
                        onMouseEnter={() => handleMouseEnter(node.row, node.col)}
                        className={clsx(
                            'w-6 h-6 border transition-all duration-200',
                            'border-gray-700',
                            {
                                'bg-gray-900': node.type === 'EMPTY',
                                'bg-gray-400': node.type === 'WALL',
                                'bg-green-500': node.type === 'START',
                                'bg-red-500': node.type === 'END',
                                'bg-blue-400': node.isVisited && node.type === 'EMPTY',
                                'bg-yellow-400': node.isPath && node.type !== 'START' && node.type !== 'END',
                            }
                        )}
                    />
                ))
            )}
        </div>
    );
};
