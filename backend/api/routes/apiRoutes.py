from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import numpy as np
import cv2
from controllers.lettersController import detect_from_image_bytes as detect_letters
from controllers.wordsController import detect_from_image_bytes as detect_words

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_json(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws_translate")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    current_frames = []
    model = None
    sequence_num = None
    is_processing = False
    is_dynamic = False
    ignore_count = 0
    try:
        while True:
            data = await websocket.receive()
            if 'text' in data:
                msg = json.loads(data['text'])
                if msg['type'] == 'start':
                    if is_processing:
                        await manager.send_json({'error': 'Processing in progress'}, websocket)
                        continue
                    current_frames = []
                    model = msg['model']
                    sequence_num = msg['sequenceNum']
                    is_dynamic = False
                    ignore_count = 0
                elif msg['type'] == 'process':
                    if is_processing:
                        await manager.send_json({'error': 'Processing in progress'}, websocket)
                        continue
                    if model in ['alpha', 'num'] and len(current_frames) not in [1, 2, 10]:
                        await manager.send_json({'error': f'Invalid frame count: {len(current_frames)}'}, websocket)
                        current_frames = []
                        continue
                    if model == 'glosses' and len(current_frames) < sequence_num:
                        await manager.send_json({'error': f'Incomplete sequence: expected {sequence_num}, got {len(current_frames)}'}, websocket)
                        current_frames = []
                        continue
                    is_processing = True
                    print(f"Processing {len(current_frames)} frames, model: {model}, is_dynamic: {is_dynamic}")
                    await manager.send_json({'status': 'processing'}, websocket)
                    if model in ['alpha', 'num']:
                        result = await detect_letters(current_frames, websocket, is_dynamic)
                        if result.get('status') == 'wait_more_dynamic':
                            is_dynamic = True
                        if result.get('status') not in ['wait_more', 'wait_more_dynamic']:
                            await manager.send_json(result, websocket)
                            current_frames = []
                            is_dynamic = False
                            if result.get('letter') in ['J', 'Z']:
                                ignore_count = 5  # ~1s pause at 200ms intervals
                            else:
                                ignore_count = 3  # ~0.6s pause
                    elif model == 'glosses':
                        result = detect_words(current_frames)
                        await manager.send_json(result, websocket)
                        current_frames = []
                        ignore_count = 5  # ~1s pause for glosses
                    else:
                        result = {'error': 'Invalid model'}
                        await manager.send_json(result, websocket)
                    is_processing = False
                elif msg['type'] == 'stop':
                    if is_processing:
                        await manager.send_json({'error': 'Processing in progress'}, websocket)
                        continue
                    if current_frames:
                        is_processing = True
                        print(f"Processing {len(current_frames)} frames on stop, model: {model}, is_dynamic: {is_dynamic}")
                        await manager.send_json({'status': 'processing'}, websocket)
                        if model in ['alpha', 'num']:
                            result = await detect_letters(current_frames, websocket, is_dynamic)
                            if result.get('status') not in ['wait_more', 'wait_more_dynamic']:
                                await manager.send_json(result, websocket)
                        elif model == 'glosses':
                            result = detect_words(current_frames)
                            await manager.send_json(result, websocket)
                        current_frames = []
                        is_dynamic = False
                        ignore_count = 0
                        is_processing = False
                    break  # Exit the loop to close WebSocket
            elif 'bytes' in data and not is_processing:
                if ignore_count > 0:
                    ignore_count -= 1
                    continue
                image_bytes = data['bytes']
                current_frames.append(image_bytes)
                if model in ['alpha', 'num']:
                    if len(current_frames) == 1 or (len(current_frames) == 2 and not is_dynamic) or (len(current_frames) == 10 and is_dynamic):
                        is_processing = True
                        print(f"Processing {len(current_frames)} frames, model: {model}, is_dynamic: {is_dynamic}")
                        await manager.send_json({'status': 'processing'}, websocket)
                        result = await detect_letters(current_frames, websocket, is_dynamic)
                        if result.get('status') == 'wait_more_dynamic':
                            is_dynamic = True
                        if result.get('status') not in ['wait_more', 'wait_more_dynamic']:
                            await manager.send_json(result, websocket)
                            current_frames = []
                            is_dynamic = False
                            if result.get('letter') in ['J', 'Z']:
                                ignore_count = 5
                            else:
                                ignore_count = 3
                        is_processing = False
                elif model == 'glosses' and len(current_frames) == sequence_num:
                    is_processing = True
                    print(f"Processing {len(current_frames)} frames, model: {model}, is_dynamic: {is_dynamic}")
                    await manager.send_json({'status': 'processing'}, websocket)
                    result = detect_words(current_frames)
                    await manager.send_json(result, websocket)
                    current_frames = []
                    ignore_count = 5
                    is_processing = False
                if len(current_frames) > sequence_num:
                    current_frames = current_frames[-sequence_num:]
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        current_frames = []
        is_processing = False
        is_dynamic = False
        ignore_count = 0

@router.post("/produceSentence")
async def produce_sentence(request: dict):
    gloss = request.get('gloss')
    # Implement your gloss-to-sentence logic here
    return {'translation': 'some translation'}  # Placeholder