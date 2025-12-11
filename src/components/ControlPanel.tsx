import React from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';
// import clsx from 'clsx'; // Unused


interface ControlPanelProps {
    isRunning: boolean;
    onRun: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    speed: number;
    setSpeed: (speed: number) => void;
    config: any;
    setConfig: (c: any) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    isRunning,
    onRun,
    onPause,
    onStep,
    onReset,
    speed,
    setSpeed,
    config,
    setConfig
}) => {
    return (
        <div className="flex items-center gap-4 bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex gap-2">
                {!isRunning ? (
                    <button
                        onClick={onRun}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Play size={18} /> Run
                    </button>
                ) : (
                    <button
                        onClick={onPause}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Pause size={18} /> Pause
                    </button>
                )}

                <button
                    onClick={onStep}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                    <StepForward size={18} /> Step
                </button>

                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                    <RotateCcw size={18} /> Reset
                </button>
            </div>

            <div className="h-8 w-px bg-gray-600 mx-2" />

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm font-medium">Speed</span>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm font-medium">Weight</span>
                    <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={config.weight}
                        onChange={(e) => setConfig({ ...config, weight: parseFloat(e.target.value) })}
                        className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm font-medium">Heuristic</span>
                    <select
                        value={config.heuristic}
                        onChange={(e) => setConfig({ ...config, heuristic: e.target.value })}
                        className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                        <option value="manhattan">Manhattan</option>
                        <option value="euclidean">Euclidean</option>
                        <option value="diagonal">Diagonal</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm font-medium">Tie-Break</span>
                    <select
                        value={config.tie_breaker}
                        onChange={(e) => setConfig({ ...config, tie_breaker: e.target.value })}
                        className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                        <option value="none">None</option>
                        <option value="cross">Cross Product</option>
                    </select>
                </div>
            </div>

            <div className="h-8 w-px bg-gray-600 mx-2" />

            <div className="text-xs text-gray-400 flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Start</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> End</div>
            </div>
        </div>
    );
};
