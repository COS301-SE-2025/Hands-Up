import os
from fastapi import APIRouter, UploadFile, File, HTTPException,FastAPI,Request
from fastapi.responses import JSONResponse
from typing import List
from dotenv import load_dotenv
import httpx

router = APIRouter(prefix="/handsUPApi/sign")
app = FastAPI()
load_dotenv()
HUGGINGFACE_BASE_URL = os.getenv("HUGGINGFACE_BASE_URL")

async def sendToHF(url: str, frames: List[UploadFile]):
    files_to_send = [
        ('frames', (frame.filename, await frame.read(), frame.content_type))
        for frame in frames
    ]

    async with httpx.AsyncClient(timeout=300) as client:
        try:
            response = await client.post(url, files=files_to_send)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"Request error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        except httpx.HTTPStatusError as e:
            print(f"HTTP error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming Request URL: {request.url}")
    response = await call_next(request)
    return response


@router.post("/processLetters")
async def process_letters(frames: List[UploadFile] = File(...)):
    sequence_num = 20
    if len(frames) != sequence_num:
        raise HTTPException(status_code=400, detail=f"Exactly {sequence_num} frames required")

    url = f"{HUGGINGFACE_BASE_URL}/detect-letters"

    result = await sendToHF(url, frames)
    print(f"Received result: {result}")
    return JSONResponse(content=result)


@router.post("/processWords")
async def process_words(frames: List[UploadFile] = File(...)):
    sequence_num = 90
    if len(frames) != sequence_num:
        raise HTTPException(status_code=400, detail=f"Exactly {sequence_num} frames required")

    url = f"{HUGGINGFACE_BASE_URL}/detect-words"

    result = await sendToHF(url, frames)
    return JSONResponse(content=result)


@router.post("/sentence")
async def sign_sentence(data: dict):
    gloss_input = data.get("gloss")
    if not gloss_input:
        raise HTTPException(status_code=400, detail="No gloss provided")

    from controllers.glossController import translateGloss
    translation = translateGloss(gloss_input)
    return {"translation": translation}
