from fastapi import APIRouter, UploadFile, File, HTTPException
from controllers.lettersController import detectFromImage
import tempfile, os

router = APIRouter(prefix="/sign")

@router.post("/processImage")
async def process_image(frames: list[UploadFile] = File(...)):
    sequenceNum = 20

    if len(frames) != sequenceNum:
        raise HTTPException(status_code=400, detail="Exactly 20 frames required")

    temp_dir = tempfile.mkdtemp()
    paths = []

    try:
        for i, file in enumerate(frames):
            path = os.path.join(temp_dir, f"frame_{i}.jpg")
            with open(path, "wb") as f:
                f.write(await file.read())
            paths.append(path)

        result = detectFromImage(paths)
        return result
    finally:
        for path in paths:
            os.remove(path)
        os.rmdir(temp_dir)
