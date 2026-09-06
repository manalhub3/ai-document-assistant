from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.azure_client import client
from app.core.config import settings

router = APIRouter()


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that answers questions based on documents."
            },
            {
                "role": "user",
                "content": request.question
            }
        ],
        max_completion_tokens=500,
    )

    answer = response.choices[0].message.content
    return ChatResponse(answer=answer)