import heapq
from typing import TypeVar, Generic, Tuple

T = TypeVar('T')

class PriorityQueue(Generic[T]):
    def __init__(self):
        self._elements = []
    
    def empty(self) -> bool:
        return not self._elements
    
    def put(self, item: T, priority: float):
        heapq.heappush(self._elements, (priority, item))
    
    def get(self) -> T:
        return heapq.heappop(self._elements)[1] # Return item
    
    def size(self) -> int:
        return len(self._elements)
