import os
import dotenv
from openai import OpenAI

dotenv.load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def translateGloss(gloss: str, model: str = "o3-mini") -> str:

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": f"Translate this asl gloss to English: '{gloss}, output as 'ENG:'"}
        ]
    )
    result = response.choices[0].message.content.strip()

    if result.upper().startswith("ENG:"):
        result = result[4:].strip()

    return {'translation': result}

