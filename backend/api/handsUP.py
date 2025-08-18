from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.apiRoutes import router as api_router  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # change this to your frontend domain for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/handsUPApi")
