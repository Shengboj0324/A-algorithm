export const PYTHON_ASTAR_CODE = `class AStarSolver:
    def solve(self):
        # 1. Initialize Open Set
        self.open_set.put(self.start, 0)

        while not self.open_set.empty():
            # 2. Pop node with lowest f-score
            current = self.open_set.get()
            
            # 3. Check Goal
            if current == self.end:
                return "Goal Reached!"

            self.closed_set.add(current)

            # 4. Get Neighbors
            neighbors = self._get_neighbors(current)

            # 5. Loop Neighbors
            for neighbor in neighbors:
                if neighbor in self.closed_set: continue
                
                tentative_g = self.g_score[current] + 1
                
                # 6. Update Path
                if tentative_g < self.g_score.get(neighbor, inf):
                    self.came_from[neighbor] = current
                    self.g_score[neighbor] = tentative_g
                    
                    # Apply Heuristic + Weight + Tie-Breaker
                    h = heuristic(neighbor, self.end)
                    f = tentative_g + (h * weight)
                    
                    # 7. Add to Open Set
                    self.open_set.put(neighbor, f)
        
        # 8. No Path
        return "Fail"`;
