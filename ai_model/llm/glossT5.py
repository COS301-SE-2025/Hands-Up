from datasets import Dataset
from transformers import T5Tokenizer, T5ForConditionalGeneration, TrainingArguments, Trainer

data = [
    {"input": "translate gloss to english: BOY PLAY BALL", "target": "The boy is playing with a ball."},
    {"input": "translate gloss to english: GIRL GO STORE", "target": "The girl is going to the store."},
    {"input": "translate gloss to english: ME OKAY", "target": "I am okay"},
]
dataset = Dataset.from_list(data)

tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small")

def preprocess(example):
    inputs = tokenizer(example['input'], truncation=True, padding='max_length', max_length=32)
    targets = tokenizer(example['target'], truncation=True, padding='max_length', max_length=32)
    inputs['labels'] = targets['input_ids']
    return inputs

tokenized_dataset = dataset.map(preprocess)

args = TrainingArguments(
    output_dir="./gloss2eng",
    per_device_train_batch_size=8,
    num_train_epochs=5,
    logging_steps=10,
    save_steps=50,
    save_total_limit=2
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=tokenized_dataset,
)

trainer.train()

model.save_pretrained("./gloss2eng_model")
tokenizer.save_pretrained("./gloss2eng_model")
