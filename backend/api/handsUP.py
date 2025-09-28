import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.apiRoutes import router as sign_router

app = FastAPI()
app.include_router(sign_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://handsup.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, )
    uvicorn.run(app, host="127.0.0.1", port=5000, )