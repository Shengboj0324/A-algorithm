export type NodeType = 'EMPTY' | 'WALL' | 'START' | 'END';

export interface GridNode {
  row: number;
  col: number;
  type: NodeType;
  isVisited: boolean;
  isPath: boolean;
  distance: number; // g-cost
  heuristic: number; // h-cost
  totalCost: number; // f-cost
  parent: GridNode | null;
}

export interface AlgorithmVariables {
  current?: GridNode | null;
  neighbors?: GridNode[];
  open_set_size?: number;
  closed_set_size?: number;
  message?: string;
}

export interface AlgorithmStep {
  // gridState removed or optional if we don't send it
  grid_snapshot?: GridNode[][];

  code_line: number;
  explanation: string;
  variables: AlgorithmVariables;
}
