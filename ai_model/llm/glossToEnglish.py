from transformers import T5Tokenizer, T5ForConditionalGeneration

model = T5ForConditionalGeneration.from_pretrained("./gloss2eng_model")
tokenizer = T5Tokenizer.from_pretrained("./gloss2eng_model")

def translate_gloss(gloss):
    input_text = f"translate gloss to english: {gloss}"
    input_ids = tokenizer.encode(input_text, return_tensors="pt")
    output_ids = model.generate(input_ids, max_length=32)
    return tokenizer.decode(output_ids[0], skip_special_tokens=True)

#Testing
print(translate_gloss("LIBRARY WHERE"))  # Expected output: "I am tired
