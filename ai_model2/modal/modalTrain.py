import modal
import os

modal.enable_output()

stub = modal.App("gpu-incremental-trainer")
local_script_dir = os.path.dirname(__file__)

# Define dependencies and the Docker image
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "tensorflow",
        "numpy",
        "scikit-learn",
        "opencv-python",
        "mediapipe",
    )
    .run_commands("apt-get update && apt-get install -y libgl1 libglib2.0-0") 
    .add_local_dir(local_script_dir, "/root/")
)

volume = modal.Volume.from_name("words", create_if_missing = True)

#cloud GPU container
@stub.function(
    image=image,
    gpu="A10G",  # Change to "A100" or "T4" if needed
    volumes={"/root/ai_model2/words2": volume},  
    timeout=3600  # 1 hour timeout
)

def run_training():
    print("Remote training started...")
    # import os
    import wordsModelTraining
    # os.chdir("/root")  
    wordsModelTraining.processAndTrain()

if __name__ == "__main__":
    with stub.run():
        run_training.remote()