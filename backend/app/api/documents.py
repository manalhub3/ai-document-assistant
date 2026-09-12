from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.document import Document, DocumentChunk
from app.services.document_service import extract_text_from_pdf, chunk_text, embed_text
import json

router = APIRouter()

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()
    text = extract_text_from_pdf(contents)

    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    document = Document(filename=file.filename, content=text)
    db.add(document)
    db.flush()

    chunks = chunk_text(text)
    for i, chunk_text_item in enumerate(chunks):
        embedding = embed_text(chunk_text_item)
        chunk = DocumentChunk(
            document_id=document.id,
            chunk_text=chunk_text_item,
            embedding=json.dumps(embedding),
            chunk_index=i
        )
        db.add(chunk)

    db.commit()
    db.refresh(document)

    return {
        "id": document.id,
        "filename": document.filename,
        "chunks": len(chunks),
        "message": "Document uploaded and processed successfully"
    }

@router.get("/documents")
def list_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).all()
    return [{"id": d.id, "filename": d.filename, "created_at": d.created_at} for d in documents]

@router.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.delete(document)
    db.commit()

    return {"message": f"Document {document_id} deleted successfully"}