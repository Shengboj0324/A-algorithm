import { useState, useEffect, useRef, useCallback } from 'react';
import { Grid } from './components/Grid';
import { ControlPanel } from './components/ControlPanel';
import { CodeAnalyzer } from './components/CodeAnalyzer';
import { createInitialGrid } from './utils/gridUtils';
import { PYTHON_ASTAR_CODE } from './constants/codeSnippets';
import type { AlgorithmStep, GridNode } from './types';
import { fetchSolution } from './api/solver';

function App() {
  const [grid, setGrid] = useState<GridNode[][]>(() => createInitialGrid(20, 30));
  const [currentStep, setCurrentStep] = useState<AlgorithmStep | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [startPos] = useState({ r: 5, c: 5 });
  const [endPos] = useState({ r: 5, c: 20 });
  const [isFinished, setIsFinished] = useState(false);

  const [config, setConfig] = useState({
    algorithm: 'astar',
    heuristic: 'manhattan',
    weight: 1.0,
    tie_breaker: 'none'
  });

  const [trace, setTrace] = useState<AlgorithmStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  // set start and end types
  useEffect(() => {
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(node => ({ ...node })));
      newGrid[startPos.r][startPos.c].type = 'START';
      newGrid[endPos.r][endPos.c].type = 'END';
      return newGrid;
    });
  }, []);

  const resetGrid = useCallback((clearWalls = false) => {
    setIsRunning(false);
    setIsFinished(false);
    setCurrentStep(null);
    setTrace([]); // Clear trace
    setStepIndex(0);
    if (timerRef.current) clearInterval(timerRef.current);

    setGrid(prev => {
      return prev.map(row => row.map(node => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        heuristic: Infinity,
        totalCost: Infinity,
        parent: null,
        type: (clearWalls && node.type === 'WALL') ? 'EMPTY' : node.type
      })).map(node => {
        if (node.row === startPos.r && node.col === startPos.c) return { ...node, type: 'START' };
        if (node.row === endPos.r && node.col === endPos.c) return { ...node, type: 'END' };
        return node;
      }));
    });
  }, [startPos, endPos]);

  useEffect(() => {
    setGrid(g => {
      const newGrid = g.map(row => [...row]);
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[0].length; c++) {
          const node = newGrid[r][c];
          if (node.type === 'START' && (r !== startPos.r || c !== startPos.c)) node.type = 'EMPTY';
          if (node.type === 'END' && (r !== endPos.r || c !== endPos.c)) node.type = 'EMPTY';

          if (r === startPos.r && c === startPos.c) node.type = 'START';
          if (r === endPos.r && c === endPos.c) node.type = 'END';
        }
      }
      return newGrid;
    });
  }, [startPos, endPos]);

  const fetchAndStart = async () => {
    try {
      setIsRunning(true); // Show loading state conceptually
      // 1. Fetch Trace
      const startNode = grid[startPos.r][startPos.c];
      const endNode = grid[endPos.r][endPos.c];
      const steps = await fetchSolution(grid, startNode, endNode, config);
      setTrace(steps);
      setStepIndex(0);
      // Timer will pick up because isRunning is true and trace is not empty
    } catch (e) {
      console.error(e);
      alert("Failed to connect to backend. Make sure python server is running!");
      setIsRunning(false);
    }
  };

  const handleRun = () => {
    if (isFinished) {
      resetGrid();
    }
    if (trace.length === 0) {
      fetchAndStart();
    } else {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStepForward = () => {
    // Manual step
    if (trace.length === 0) {
      // If no trace, fetch it first (single step mode start)
      fetchAndStart(); // This sets isRunning=true though. 
      // We might want specific logic. 
      // For now, Play acts as "Start", Step can also start.
      return;
    }

    const nextIndex = stepIndex + 1;
    if (nextIndex < trace.length) {
      processStep(trace[nextIndex]);
      setStepIndex(nextIndex);
    } else {
      setIsFinished(true);
      setIsRunning(false);
    }
  };

  const processStep = (step: AlgorithmStep) => {
    setCurrentStep(step);
    // Update grid visualization based on step variables
    // This is purely visual: we need to mark visited/open based on the step info
    setGrid(prev => {
      const newG = prev.map(r => [...r]);

      // Helper to mark node
      const mark = (n: { row: number, col: number }, p: Partial<GridNode>) => {
        if (!n) return;
        if (newG[n.row] && newG[n.row][n.col]) {
          Object.assign(newG[n.row][n.col], p);
        }
      }

      if (step.variables.current) {
        mark(step.variables.current, { isVisited: true });
        // Also visually show it's current? Maybe handled by CSS or separate state? 
        // For now visited is blue.
      }

      if (step.variables.neighbors) {
        step.variables.neighbors.forEach(n => {
          mark(n, { totalCost: -1 }); // Just to trigger update? 
          // Neighbors are 'seen' but not visited yet unless popped.
          // Ideally we mark them 'Open' (Green border?)
          // Our Grid component logic needs check:
          // 'bg-yellow-400': node.isPath 
          // We don't have an "Open" state in GridNode types explicitly, 
          // but we could use a transparent overlay or specific color.
          // The Grid component colors:
          // visited -> blue. 
          // Let's assume visited = Closed Set.
        });
      }

      if (step.code_line === 3 && step.variables.message === "Target Reached!") {
        // Reconstruct path provided? The backend trace logic didn't re-send path explicitly.
        // Python needs to send the path or we reconstruct from 'parent' map if we tracked it.
        // We haven't built 'parent' tracking in frontend completely.
        // Optimization: Just rely on 'visited' for now.
        // Or add 'path' variable to backend step.
      }

      return newG;
    });
  };

  useEffect(() => {
    if (isRunning && trace.length > 0) {
      timerRef.current = window.setInterval(() => {
        setStepIndex(prev => {
          const next = prev + 1;
          if (next >= trace.length) {
            setIsFinished(true);
            setIsRunning(false);
            return prev;
          }
          processStep(trace[next]);
          return next;
        });
      }, 10000 / (speed * 10)); // Speed map
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, speed, trace]);


  const handleNodeClick = (r: number, c: number) => {
    if (isRunning) return;
    setGrid(prev => {
      const newG = prev.map(row => [...row]);
      const node = newG[r][c];
      if (node.type === 'EMPTY') node.type = 'WALL';
      else if (node.type === 'WALL') node.type = 'EMPTY';
      return newG;
    });
  };

  const handleNodeDrag = (r: number, c: number) => {
    if (isRunning) return;
    handleNodeClick(r, c);
    setGrid(prev => {
      const newG = prev.map(row => [...row]);
      const node = newG[r][c];
      if (node.type === 'EMPTY') node.type = 'WALL';
      return newG;
    });
  };

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 gap-6 relative">
        <header className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              A* Algorithm Visualizer (Python Backend)
            </h1>
            <p className="text-gray-400 text-sm">Deep Dive Analysis</p>
          </div>
          <div className="flex gap-4 items-center">
            <a href="https://github.com/google-deepmind" target="_blank" className="text-gray-500 hover:text-white transition-colors">
              Powered by Antigravity
            </a>
          </div>
        </header>

        <main className="flex-1 flex justify-center items-center overflow-auto bg-gray-900/30 rounded-2xl border border-gray-800/50 backdrop-blur-md shadow-2xl">
          <Grid
            grid={grid}
            onNodeClick={handleNodeClick}
            onNodeDrag={handleNodeDrag}
          />
        </main>

        <footer className="w-full max-w-4xl mx-auto">
          <ControlPanel
            isRunning={isRunning}
            onRun={handleRun}
            onPause={handlePause}
            onReset={() => resetGrid(true)}
            onStep={handleStepForward}
            speed={speed}
            setSpeed={setSpeed}
            config={config}
            setConfig={setConfig}
          />
        </footer>
      </div>

      {/* Side Panel */}
      <CodeAnalyzer
        currentStep={currentStep}
        codeSnippet={PYTHON_ASTAR_CODE}
      />
    </div>
  );
}

export default App;
