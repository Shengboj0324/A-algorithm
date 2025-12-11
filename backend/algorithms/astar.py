from typing import Iterator, List, Tuple, Dict, Set
from ..models import SolveRequest, AlgorithmStep, AlgorithmVariables, GridNodeModel, GridModel
from .heuristics import Heuristics
from .priority_queue import PriorityQueue

class AStarSolver:
    def __init__(self, request: SolveRequest):
        self.request = request
        self.grid = request.grid
        self.start = request.start
        self.end = request.end
        self.config = request.config
        
        # Internal state
        self.open_set = PriorityQueue[GridNodeModel]()
        self.came_from: Dict[Tuple[int, int], GridNodeModel] = {}
        self.g_score: Dict[Tuple[int, int], float] = {}
        self.f_score: Dict[Tuple[int, int], float] = {}
        self.closed_set: Set[Tuple[int, int]] = set() # For visualization mostly
        
        # Initialize
        start_pos = (self.start.row, self.start.col)
        self.g_score[start_pos] = 0
        self.f_score[start_pos] = Heuristics.calculate(self.start, self.end, self.config.heuristic)
        self.open_set.put(self.start, self.f_score[start_pos])

    def solve(self) -> Iterator[AlgorithmStep]:
        # Line 1: Initialize
        yield self._create_step(1, "Initialized Open Set with Start Node.", 
                               variables={"open_set_size": 1, "closed_set_size": 0, "current": self.start})

        while not self.open_set.empty():
            # Line 2: Pop lowest f
            current = self.open_set.get()
            current_pos = (current.row, current.col)
            
            # Stale entry check (if we add multiple entries for same node)
            # Not strictly needed withcame_from check but good for explicit visited tracking if we wanted
            
            self.closed_set.add(current_pos)

            yield self._create_step(2, f"Popped node ({current.row}, {current.col}) with lowest f-score.",
                                   variables={"current": current, "open_set_size": self.open_set.size(), "closed_set_size": len(self.closed_set)})

            # Line 3: Check Goal
            if current.row == self.end.row and current.col == self.end.col:
                yield self._create_step(3, "Goal Reached!", variables={"current": current, "message": "Target Reached!"})
                return # Done

            # Line 4: Get Neighbors
            neighbors = self._get_neighbors(current)
            yield self._create_step(4, f"Found {len(neighbors)} valid neighbors.", 
                                   variables={"current": current, "neighbors": neighbors})

            # Line 5: Loop Neighbors
            for neighbor in neighbors:
                neighbor_pos = (neighbor.row, neighbor.col)
                if neighbor_pos in self.closed_set:
                     continue
                
                tentative_g = self.g_score[current_pos] + 1 # cost is 1
                
                yield self._create_step(5, f"Checking neighbor ({neighbor.row}, {neighbor.col}). New g: {tentative_g}",
                                       variables={"current": current, "neighbors": [neighbor]})
                
                if tentative_g < self.g_score.get(neighbor_pos, float('inf')):
                    # Line 6: Update path
                    self.came_from[neighbor_pos] = current
                    self.g_score[neighbor_pos] = tentative_g
                    h = Heuristics.calculate(neighbor, self.end, self.config.heuristic)
                    
                    # Tie-breaking logic
                    if self.config.tie_breaker == "cross":
                        dx1 = current.row - self.end.row
                        dy1 = current.col - self.end.col
                        dx2 = self.start.row - self.end.row
                        dy2 = self.start.col - self.end.col
                        cross = abs(dx1*dy2 - dx2*dy1)
                        h += cross * 0.001
                    
                    f = tentative_g + (h * self.config.weight)
                    self.f_score[neighbor_pos] = f
                    
                    # Line 7: Add to Open Set
                    # We accept duplicates in PQ for simplicity (lazy deletion)
                    # Ideally we update priority but Python heapq doesn't support decrease-key simply.
                    self.open_set.put(neighbor, f)
                    
                    # Update internal model for display
                    # Note: We are modifying key properties on the FLY objects here? 
                    # Actually valid since they are Pydantic models but we need to ensure we don't breaks things.
                    # Ideally we just send the step info.
                    
                    yield self._create_step(6, f"Updated neighbor ({neighbor.row}, {neighbor.col}) f={f:.2f}",
                                           variables={"current": current, "neighbors": [neighbor], "open_set_size": self.open_set.size()})

        # Line 8: Fail
        yield self._create_step(8, "Open Set empty. No path found.", variables={"open_set_size": 0})

    def _get_neighbors(self, node: GridNodeModel) -> List[GridNodeModel]:
        res = []
        dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        # Add diagonal if configured? For now 4-way
        
        for r, c in dirs:
            nr, nc = node.row + r, node.col + c
            if 0 <= nr < self.grid.rows and 0 <= nc < self.grid.cols:
                # Find the node in the grid data
                # Using direct index access assumes grid is well formed
                target = self.grid.nodes[nr][nc]
                if target.type != 'WALL':
                    res.append(target)
        return res

    def _create_step(self, line: int, explanation: str, variables: Dict = {}) -> AlgorithmStep:
        # Construct algorithm variables
        algo_vars = AlgorithmVariables(
            current=variables.get("current"),
            open_set_size=variables.get("open_set_size"),
            closed_set_size=variables.get("closed_set_size"),
            neighbors=variables.get("neighbors"),
            message=variables.get("message")
        )
        return AlgorithmStep(
            code_line=line,
            explanation=explanation,
            variables=algo_vars,
            grid_snapshot=None # Can optimize to send diffs
        )
