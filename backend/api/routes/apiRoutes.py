from fastapi import APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
import json
from fastapi.responses import JSONResponse
from controllers.lettersControllerS import detectFromImageBytes as detectLetters
from controllers.wordsControllerS import detectFromImageBytes as detectWords
from typing import List
from dotenv import load_dotenv
import httpx
import os

router = APIRouter(prefix="/handsUPApi")

class ConnectionManager:
    def __init__(self):
        self.activeConnections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.activeConnections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.activeConnections:
            self.activeConnections.remove(websocket)

    async def sendJson(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws_translate")
async def websocketEndpoint(websocket: WebSocket):
    await manager.connect(websocket)
    currentFrames = []
    model = None
    sequenceNum = None
    isProcessing = False
    isDynamic = False
    ignoreCount = 0
    stopped = False  

    try:
        while True:
            data = await websocket.receive()

            if 'text' in data:
                msg = json.loads(data['text'])

                if msg['type'] == 'start':
                    if isProcessing:
                        await manager.sendJson({'error': 'Processing in progress'}, websocket)
                        continue
                    currentFrames = []
                    model = msg['model']
                    sequenceNum = msg['sequenceNum']
                    isDynamic = False
                    ignoreCount = 0
                    stopped = False
                    print(f"Started: model={model}, sequenceNum={sequenceNum}")

                elif msg['type'] == 'process':
                    if isProcessing:
                        await manager.sendJson({'error': 'Processing in progress'}, websocket)
                        continue

                    if model in ['alpha', 'num'] and len(currentFrames) not in [1, 2, 10]:
                        await manager.sendJson({'error': f'Invalid frame count: {len(currentFrames)}'}, websocket)
                        currentFrames = []
                        continue
                    if model == 'glosses' and len(currentFrames) < sequenceNum:
                        await manager.sendJson({'error': f'Incomplete sequence: expected {sequenceNum}, got {len(currentFrames)}'}, websocket)
                        currentFrames = []
                        continue

                    isProcessing = True
                    print(f"Processing {len(currentFrames)} frames, model: {model}, isDynamic: {isDynamic}")
                    await manager.sendJson({'status': 'processing'}, websocket)

                    if model in ['alpha', 'num']:
                        result = await detectLetters(currentFrames, websocket, isDynamic)
                        if result.get('status') == 'waitMoreDynamic':
                            isDynamic = True
                        if result.get('status') not in ['waitMore', 'waitMoreDynamic']:
                            await manager.sendJson(result, websocket)
                            currentFrames = []
                            isDynamic = False
                            ignoreCount = 10 if result.get('letter') in ['J', 'Z'] else 6
                        await manager.sendJson({'status': 'ready'}, websocket)

                    elif model == 'glosses':
                        result = detectWords(currentFrames)
                        await manager.sendJson(result, websocket)
                        currentFrames = []
                        ignoreCount = 10
                        await manager.sendJson({'status': 'ready'}, websocket)

                    else:
                        await manager.sendJson({'error': 'Invalid model'}, websocket)

                    isProcessing = False

                elif msg['type'] == 'stop':
                    stopped = True
                    if isProcessing:
                        await manager.sendJson({'error': 'Processing in progress'}, websocket)
                        continue
                    if currentFrames:
                        isProcessing = True
                        print(f"Processing {len(currentFrames)} frames on stop, model: {model}, isDynamic: {isDynamic}")
                        await manager.sendJson({'status': 'processing'}, websocket)

                        if model in ['alpha', 'num']:
                            result = await detectLetters(currentFrames, websocket, isDynamic)
                            if result.get('status') not in ['waitMore', 'waitMoreDynamic']:
                                await manager.sendJson(result, websocket)
                        elif model == 'glosses':
                            result = detectWords(currentFrames)
                            await manager.sendJson(result, websocket)

                        currentFrames = []
                        isDynamic = False
                        ignoreCount = 0
                        isProcessing = False

                    break  

            elif 'bytes' in data and not isProcessing and not stopped:
                if ignoreCount > 0:
                    ignoreCount -= 1
                    continue

                imageBytes = data['bytes']
                currentFrames.append(imageBytes)

                if model is not None and sequenceNum is not None and len(currentFrames) > sequenceNum:
                    currentFrames = currentFrames[-sequenceNum:]

                is_about_to_process = False
                if model in ['alpha', 'num']:
                    if (len(currentFrames) == 2 and not isDynamic) or (len(currentFrames) == 10 and isDynamic):
                        is_about_to_process = True
                elif model == 'glosses' and len(currentFrames) >= sequenceNum:
                    is_about_to_process = True

                if not is_about_to_process:
                    await manager.sendJson({'status': 'collecting'}, websocket)

                if model in ['alpha', 'num']:
                    if len(currentFrames) in [1, 2] or (len(currentFrames) == 10 and isDynamic):
                        isProcessing = True
                        print(f"Processing {len(currentFrames)} frames, model: {model}, isDynamic: {isDynamic}")
                        await manager.sendJson({'status': 'processing'}, websocket)

                        result = await detectLetters(currentFrames, websocket, isDynamic)
                        if result.get('status') == 'waitMoreDynamic':
                            isDynamic = True
                        if result.get('status') not in ['waitMore', 'waitMoreDynamic']:
                            await manager.sendJson(result, websocket)
                            currentFrames = []
                            isDynamic = False
                            ignoreCount = 10 if result.get('letter') in ['J', 'Z'] else 6

                        isProcessing = False
                        await manager.sendJson({'status': 'ready'}, websocket)

                elif model == 'glosses' and len(currentFrames) >= sequenceNum:
                    isProcessing = True
                    print(f"Processing {len(currentFrames)} frames, model: {model}, isDynamic: {isDynamic}")
                    await manager.sendJson({'status': 'processing'}, websocket)

                    result = detectWords(currentFrames)
                    await manager.sendJson(result, websocket)

                    currentFrames = []
                    ignoreCount = 10
                    isProcessing = False
                    await manager.sendJson({'status': 'ready'}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        currentFrames = []
        isProcessing = False
        isDynamic = False
        ignoreCount = 0
        stopped = True

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