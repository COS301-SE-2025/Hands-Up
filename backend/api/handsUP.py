import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.apiRoutes import router as sign_router
import uvicorn

app = FastAPI()
app.include_router(sign_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://handsup.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)