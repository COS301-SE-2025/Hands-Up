import csv
from datasets import Dataset
from peft import get_peft_model, LoraConfig, TaskType
from transformers import T5Tokenizer, T5ForConditionalGeneration, TrainingArguments, Trainer

csv_file_path = "glosses/train.csv"

data = []
with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)  # Skip header row if present
    for row in reader:
        if len(row) >= 2:
            gloss = row[0].strip()
            english = row[1].strip()
            data.append({
                "input": f"translate gloss to english: {gloss}",
                "target": english
            })

# data = [
#     {"input": "translate gloss to english: BOY PLAY BALL", "target": "The boy is playing with a ball."},
#     {"input": "translate gloss to english: GIRL GO STORE", "target": "The girl is going to the store."},
#     {"input": "translate gloss to english: ME OKAY", "target": "I am okay"},
#     {"input": "translate gloss to english: ME NAME J-O-H-N", "target": "My name is John."},
#     {"input": "translate gloss to english: YOU STUDENT", "target": "Are you a student?"},
#     {"input": "translate gloss to english: SHE TEACHER", "target": "She is a teacher."},
#     {"input": "translate gloss to english: WE FRIEND", "target": "We are friends."},
#     {"input": "translate gloss to english: THEY EAT PIZZA", "target": "They are eating pizza."},
#     {"input": "translate gloss to english: DOG RUN", "target": "The dog is running."},
#     {"input": "translate gloss to english: CAT SLEEP", "target": "The cat is sleeping."},
#     {"input": "translate gloss to english: I LOVE YOU", "target": "I love you."},
#     {"input": "translate gloss to english: WHAT YOUR NAME", "target": "What is your name?"},
#     {"input": "translate gloss to english: WHERE BATHROOM", "target": "Where is the bathroom?"},
#     {"input": "translate gloss to english: HOW YOU FEEL", "target": "How do you feel?"},
#     {"input": "translate gloss to english: TOMORROW SCHOOL", "target": "I will go to school tomorrow."},
#     {"input": "translate gloss to english: YESTERDAY RAIN", "target": "It rained yesterday."},
#     {"input": "translate gloss to english: FINISH HOMEWORK", "target": "I finished the homework."},
#     {"input": "translate gloss to english: ME NEED HELP", "target": "I need help."},
#     {"input": "translate gloss to english: BOOK ON TABLE", "target": "The book is on the table."},
#     {"input": "translate gloss to english: TIME NOW", "target": "What time is it now?"},
#     {"input": "translate gloss to english: MOTHER COOK DINNER", "target": "Mother is cooking dinner."},
#     {"input": "translate gloss to english: FATHER WORK TODAY", "target": "Father is working today."},
#     {"input": "translate gloss to english: SISTER SING", "target": "My sister is singing."},
#     {"input": "translate gloss to english: BROTHER DRIVE CAR", "target": "My brother is driving the car."},
#     {"input": "translate gloss to english: FAMILY MEET SUNDAY", "target": "My family will meet on Sunday."},
#     {"input": "translate gloss to english: TEACHER GIVE TEST", "target": "The teacher gave a test."},
#     {"input": "translate gloss to english: STUDENT READ BOOK", "target": "The student is reading a book."},
#     {"input": "translate gloss to english: CLASS START NOW", "target": "The class is starting now."},
#     {"input": "translate gloss to english: SCHOOL FINISH 3PM", "target": "School finishes at 3 PM."},
#     {"input": "translate gloss to english: ME FEEL HAPPY", "target": "I feel happy."},
#     {"input": "translate gloss to english: ME FEEL SAD", "target": "I feel sad."},
#     {"input": "translate gloss to english: ME ANGRY", "target": "I am angry."},
#     {"input": "translate gloss to english: ME TIRED", "target": "I am tired."},
#     {"input": "translate gloss to english: ME WAKE-UP 7AM", "target": "I woke up at 7 AM."},
#     {"input": "translate gloss to english: ME EAT BREAKFAST", "target": "I ate breakfast."},
#     {"input": "translate gloss to english: ME TAKE SHOWER", "target": "I took a shower."},
#     {"input": "translate gloss to english: ME GO BED", "target": "I am going to bed."},
#     {"input": "translate gloss to english: WHERE YOUR HOUSE", "target": "Where is your house?"},
#     {"input": "translate gloss to english: WHO CALL ME", "target": "Who called me?"},
#     {"input": "translate gloss to english: WHEN PARTY", "target": "When is the party?"},
#     {"input": "translate gloss to english: WHY LATE", "target": "Why are you late?"},
#     {"input": "translate gloss to english: LIBRARY WHERE", "target": "Where is the library?"},
#     {"input": "translate gloss to english: STORE CLOSE", "target": "The store is closed."},
#     {"input": "translate gloss to english: MOVIE FUN", "target": "The movie was fun."},
#     {"input": "translate gloss to english: PARK BEAUTIFUL", "target": "The park is beautiful."}
# ]

dataset = Dataset.from_list(data)

lora_config = LoraConfig(
    r=8,
    lora_alpha=32,
    target_modules=["q", "v"],  # relevant for T5 internals
    lora_dropout=0.1,
    bias="none",
    task_type=TaskType.SEQ_2_SEQ_LM
)


tokenizer = T5Tokenizer.from_pretrained("t5-small")
model = T5ForConditionalGeneration.from_pretrained("t5-small")
model = get_peft_model(model, lora_config)

def preprocess(example):
    inputs = tokenizer(example['input'], truncation=True, padding='max_length', max_length=32)
    targets = tokenizer(example['target'], truncation=True, padding='max_length', max_length=32)
    inputs['labels'] = targets['input_ids']
    return inputs

tokenized_dataset = dataset.map(preprocess)

args = TrainingArguments(
    output_dir="./gloss2eng",
    per_device_train_batch_size=8,
    num_train_epochs=20,
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
