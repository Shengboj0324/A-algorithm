import math
from ..models import GridNodeModel

class Heuristics:
    @staticmethod
    def calculate(node: GridNodeModel, end: GridNodeModel, method: str = "manhattan") -> float:
        dx = abs(node.row - end.row)
        dy = abs(node.col - end.col)
        
        if method == "manhattan":
            return dx + dy
        elif method == "euclidean":
            return math.sqrt(dx*dx + dy*dy)
        elif method == "diagonal":
             # Chebyshev distance (approx) or Octile
             # D * (dx + dy) + (D2 - 2 * D) * min(dx, dy)
             D = 1
             D2 = math.sqrt(2)
             return D * (dx + dy) + (D2 - 2 * D) * min(dx, dy)
        else:
            return dx + dy # Default to manhattan
