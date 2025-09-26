from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.apiRoutes import router as sign_router
import uvicorn

app = FastAPI()
app.include_router(sign_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=5000,
        log_level="debug",  # Enable debug logging
        ws_ping_timeout=60,  # Set WebSocket timeout to 60s
        ws_ping_interval=20  # Send pings every 20s
    )