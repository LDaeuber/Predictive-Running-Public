import argparse
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from options.activity.service import run_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting PredictiveRunning backend...")
    yield
    print("Shutting down backend...")

def main(args):
    print("Starting uvicorn")
    parser = argparse.ArgumentParser(description='Predictive Running Backend')
    parser.add_argument('--port', type=int, default=8080, help='Port to run server on.')
    parser.add_argument('--dev', action='store_true',
                        help='If true, restart the server as changes occur to the code.')
    args = parser.parse_args(args)
    
    if args.dev:
        print(f"Serving on port {args.port} in development mode.")
        uvicorn.run("main:api_app", host="0.0.0.0", port=args.port, reload=True, access_log=False, workers=1)
    else:
        print(f"Serving on port {args.port} in live mode.")
        uvicorn.run("main:api_app", host="0.0.0.0", port=args.port, reload=False, access_log=True, workers=1)

api_app = FastAPI(
    title="PredictiveRunning Backend",
    description="""Backend für das PredictiveRunning Projekt, angetrieben durch Lauf-Daten.""",
    version="1.0.0",
    lifespan=lifespan
)

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_app.include_router(run_router)

@api_app.get("/", tags=["Health Check"])
def read_root():
    return {"status": "PredictiveRunning API is running!"}


if __name__ == "__main__":
    main(sys.argv[1:])