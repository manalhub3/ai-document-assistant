from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.azure_client import client
from app.core.config import settings
from app.core.database import get_db
from app.models.document import DocumentChunk
from app.services.document_service import embed_text, cosine_similarity
import json

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Embed the question
    question_embedding = embed_text(request.question)

    # Get all chunks and find most similar
    chunks = db.query(DocumentChunk).all()
    
    if not chunks:
        # No documents uploaded, answer directly
        response = client.chat.completions.create(
            model=settings.AZURE_OPENAI_DEPLOYMENT,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": request.question}
            ],
            max_completion_tokens=500,
        )
        return ChatResponse(answer=response.choices[0].message.content, sources=[])

    # Score each chunk
    scored = []
    for chunk in chunks:
        if chunk.embedding:
            chunk_embedding = json.loads(chunk.embedding)
            score = cosine_similarity(question_embedding, chunk_embedding)
            scored.append((score, chunk))

    # Take top 3 most relevant chunks
    scored.sort(key=lambda x: x[0], reverse=True)
    top_chunks = scored[:3]

    context = "\n\n".join([chunk.chunk_text for _, chunk in top_chunks])
    sources = [f"Document chunk {chunk.chunk_index + 1}" for _, chunk in top_chunks]

    # Ask LLM with context
    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=[
            {
                "role": "system",
                "content": f"Answer the user's question based on the following document excerpts:\n\n{context}"
            },
            {
                "role": "user",
                "content": request.question
            }
        ],
        max_completion_tokens=500,
    )

    return ChatResponse(
        answer=response.choices[0].message.content,
        sources=sources
    )