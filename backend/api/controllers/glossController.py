from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

def translateGloss(gloss: str, model_id: str = "rrrr66254/Glossa-BART") -> str:
    
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_id, trust_remote_code=True)
    model.eval()
    if torch.cuda.is_available():
        model = model.to("cuda")
    
    inputs = tokenizer(gloss, return_tensors="pt", padding=True, truncation=True)
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k,v in inputs.items()}
    
    outputs = model.generate(**inputs, max_new_tokens=50, do_sample=False)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return result

