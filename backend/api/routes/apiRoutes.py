from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
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


@router.websocket("/ws_sentence")
async def websocketSentence(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg['type'] == 'translate':
                gloss_input = msg.get('gloss')
                if not gloss_input:
                    await manager.sendJson({"error": "No gloss provided"}, websocket)
                    continue

                from controllers.glossController import translateGloss
                translation = translateGloss(gloss_input)

                for word in translation.split():
                    await manager.sendJson({"word": word}, websocket)

                await manager.sendJson({"status": "done"}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
