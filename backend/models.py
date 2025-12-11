from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class GridNodeModel(BaseModel):
    row: int
    col: int
    type: str = "EMPTY" # EMPTY, WALL, START, END
    
class GridModel(BaseModel):
    rows: int
    cols: int
    nodes: List[List[GridNodeModel]]

class SolverConfig(BaseModel):
    algorithm: str = "astar"
    heuristic: str = "manhattan"
    weight: float = 1.0
    k: int = 1 # For tie-breaking or other params
    tie_breaker: str = "none" # none, cross, nudged

class AlgorithmVariables(BaseModel):
    current: Optional[GridNodeModel] = None
    open_set_size: Optional[int] = None
    closed_set_size: Optional[int] = None
    neighbors: Optional[List[GridNodeModel]] = None
    message: Optional[str] = None
    # We can add more specific debugging info here

class AlgorithmStep(BaseModel):
    code_line: int
    explanation: str
    variables: AlgorithmVariables
    grid_snapshot: Optional[List[List[GridNodeModel]]] = None # Only send if changed, or optimize this

class SolveRequest(BaseModel):
    grid: GridModel
    start: GridNodeModel
    end: GridNodeModel
    config: SolverConfig

class SolveResponse(BaseModel):
    steps: List[AlgorithmStep]
    path_found: bool
