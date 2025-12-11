import React from 'react';
import clsx from 'clsx';
import type { AlgorithmStep } from '../types';

interface CodeAnalyzerProps {
    currentStep: AlgorithmStep | null;
    codeSnippet: string;
}

export const CodeAnalyzer: React.FC<CodeAnalyzerProps> = ({ currentStep, codeSnippet }) => {
    const lines = codeSnippet.split('\n');

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 w-[450px]">
            <div className="p-4 border-b border-gray-700 bg-gray-800">
                <h2 className="text-xl font-bold text-white mb-2">Algorithm Analysis</h2>
                {currentStep ? (
                    <div className="bg-gray-700 p-3 rounded-md">
                        <p className="text-blue-300 font-medium mb-1">
                            Line {currentStep.code_line}: {currentStep.explanation}
                        </p>
                        <div className="text-sm text-gray-300 space-y-1">
                            {currentStep.variables.current && (
                                <div>Current Node: [{currentStep.variables.current.row}, {currentStep.variables.current.col}] (f: {currentStep.variables.current.totalCost})</div>
                            )}
                            {currentStep.variables.open_set_size !== undefined && (
                                <div>Open Set Size: {currentStep.variables.open_set_size}</div>
                            )}
                            {currentStep.variables.closed_set_size !== undefined && (
                                <div>Closed Set Size: {currentStep.variables.closed_set_size}</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">Ready to start...</p>
                )}
            </div>

            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {lines.map((line, index) => {
                    const lineNumber = index + 1;
                    const isCurrent = currentStep?.code_line === lineNumber;

                    return (
                        <div
                            key={index}
                            className={clsx(
                                "flex px-2 py-0.5 rounded",
                                isCurrent ? "bg-blue-900/50 border-l-2 border-blue-400" : "hover:bg-gray-800"
                            )}
                        >
                            <span className="text-gray-600 select-none w-8 text-right mr-4">{lineNumber}</span>
                            <span className={clsx(
                                isCurrent ? "text-white font-bold" : "text-gray-400"
                            )}>
                                {line}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
