from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import numpy as np
import cv2
from controllers.lettersController import detectFromImageBytes as detectLetters
from controllers.wordsController import detectFromImageBytes as detectWords

router = APIRouter()

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
                            if result.get('letter') in ['J', 'Z']:
                                ignoreCount = 10  # ~1s at 100ms
                            else:
                                ignoreCount = 6   # ~0.6s at 100ms
                        await manager.sendJson({'status': 'ready'}, websocket)  # Signal ready for next batch
                    elif model == 'glosses':
                        result = detectWords(currentFrames)
                        await manager.sendJson(result, websocket)
                        currentFrames = []
                        ignoreCount = 10  # ~1s at 100ms
                        await manager.sendJson({'status': 'ready'}, websocket)
                    else:
                        result = {'error': 'Invalid model'}
                        await manager.sendJson(result, websocket)
                    isProcessing = False
                elif msg['type'] == 'stop':
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
                    break  # Exit the loop to close WebSocket
            elif 'bytes' in data and not isProcessing:
                if ignoreCount > 0:
                    ignoreCount -= 1
                    continue
                imageBytes = data['bytes']
                currentFrames.append(imageBytes)
                if model in ['alpha', 'num']:
                    if len(currentFrames) == 1 or (len(currentFrames) == 2 and not isDynamic) or (len(currentFrames) == 10 and isDynamic):
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
                            if result.get('letter') in ['J', 'Z']:
                                ignoreCount = 10
                            else:
                                ignoreCount = 6
                        isProcessing = False
                        await manager.sendJson({'status': 'ready'}, websocket)
                elif model == 'glosses' and len(currentFrames) == sequenceNum:
                    isProcessing = True
                    print(f"Processing {len(currentFrames)} frames, model: {model}, isDynamic: {isDynamic}")
                    await manager.sendJson({'status': 'processing'}, websocket)
                    result = detectWords(currentFrames)
                    await manager.sendJson(result, websocket)
                    currentFrames = []
                    ignoreCount = 10
                    isProcessing = False
                    await manager.sendJson({'status': 'ready'}, websocket)
                if model is not None and sequenceNum is not None and len(currentFrames) > sequenceNum:
                    currentFrames = currentFrames[-sequenceNum:]
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        currentFrames = []
        isProcessing = False
        isDynamic = False
        ignoreCount = 0

@router.websocket("/ws_sentence")
async def websocket_sentence_endpoint(websocket: WebSocket):
    """
    Handles one-off sentence translation (gloss to natural language) using a WebSocket.
    Client sends JSON: {"gloss": "THE GLOSS SENTENCE"}.
    Server sends JSON: {"translation": "The translated sentence"}.
    """
    await manager.connect(websocket)
    try:
        # Sentence translation is a single request/response cycle
        data = await websocket.receive_text()
        msg = json.loads(data)

        gloss_input = msg.get("gloss")

        if not gloss_input:
            await manager.sendJson({"error": "No gloss provided"}, websocket)
            return

        print(f"Translating gloss: {gloss_input}")

        translation = translateGloss(gloss_input)

        await manager.sendJson({"translation": translation}, websocket)

    except WebSocketDisconnect:
        print("WebSocket for sentence translation disconnected.")
    except Exception as e:
        print(f"An error occurred in ws_sentence_endpoint: {e}")
        await manager.sendJson({"error": f"Internal server error: {e}"}, websocket)
    finally:
        manager.disconnect(websocket)