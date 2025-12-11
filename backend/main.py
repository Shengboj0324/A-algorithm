from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import SolveRequest, SolveResponse, AlgorithmStep, AlgorithmVariables
from .algorithms.astar import AStarSolver

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "A* Algorithm Analyzer API"}

@app.post("/solve", response_model=SolveResponse)
async def solve_maze(request: SolveRequest):
    try:
        solver = AStarSolver(request)
        steps = list(solver.solve()) # Run the generator to completion
        path_found = steps[-1].variables.message == "Target Reached!" if steps else False
        return SolveResponse(steps=steps, path_found=path_found)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
