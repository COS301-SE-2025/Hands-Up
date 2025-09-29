from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch 

MODEL_ID = "rrrr66254/Glossa-BART"
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID, trust_remote_code=True)
model.eval()
if torch.cuda.is_available():
    model = model.to("cuda").half()  

def translateGloss(gloss: str) -> str:
    inputs = tokenizer(gloss, return_tensors="pt", padding=True, truncation=True)
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k,v in inputs.items()}
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=50, num_beams=1, do_sample=False)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)