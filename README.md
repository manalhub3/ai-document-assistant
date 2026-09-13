# AI Document Assistant

A full-stack RAG (Retrieval-Augmented Generation) application that lets you upload PDF documents and ask questions about their content. Built with FastAPI, React, PostgreSQL, and Azure OpenAI.

## Architecture

User uploads PDF
↓
Text extraction (pypdf)
↓
Chunking (500 words, 50 overlap)
↓
Embedding (sentence-transformers/all-MiniLM-L6-v2)
↓
Store in PostgreSQL
↓
User asks question
↓
Embed question → cosine similarity search
↓
Top 3 relevant chunks → Azure OpenAI
↓
Grounded answer with sources


## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| LLM | Azure OpenAI |
| Containerization | Docker, Docker Compose |
| CI | GitHub Actions |

## Project Structure

ai-document-assistant/
├── backend/
│ ├── app/
│ │ ├── api/ # Route handlers
│ │ ├── core/ # Config, database, Azure client
│ │ ├── models/ # SQLAlchemy models
│ │ └── services/ # Document processing, embeddings
│ ├── requirements.txt
│ └── Dockerfile
├── frontend/
│ ├── src/
│ │ ├── components/ # Chat, DocumentUpload, DocumentList
│ │ └── api.ts # Axios instance
│ └── Dockerfile
├── docker-compose.yml
└── .github/
└── workflows/
└── ci.yml


## Getting Started

### Prerequisites

- Docker and Docker Compose
- Azure OpenAI resource with a chat deployment

### Setup

1. Clone the repository

```bash
git clone https://github.com/manalhub3/ai-document-assistant.git
cd ai-document-assistant
```

2. Create the environment file

```bash
cp backend/.env.example backend/.env
```

3. Fill in your Azure OpenAI credentials in `backend/.env`

DATABASE_URL=postgresql://postgres:password@postgres:5432/ai_assistant
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
AZURE_OPENAI_API_VERSION=2025-04-01-preview
SECRET_KEY=your_secret_key


4. Start the application

```bash
docker compose up --build
```

5. Open your browser

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/documents/upload | Upload a PDF |
| GET | /api/documents | List documents |
| DELETE | /api/documents/{id} | Delete a document |
| POST | /api/chat | Ask a question |

## How RAG Works

1. **Indexing** — when a PDF is uploaded, text is extracted, split into 500-word chunks with 50-word overlap, embedded using a local sentence-transformer model, and stored in PostgreSQL alongside the raw text.

2. **Retrieval** — when a question is asked, it is embedded with the same model, then compared against all stored chunk embeddings using cosine similarity. The top 3 most relevant chunks are selected.

3. **Generation** — the retrieved chunks are injected into the system prompt as context, and the question is sent to Azure OpenAI. The answer is grounded in the document content rather than the model's training data.

## CI/CD

GitHub Actions runs on every push to `main`:

- Installs Python dependencies and validates imports
- Builds the React frontend
- Builds both Docker images

## Deployed By

This application is managed and deployed by [CloudPilot](https://github.com/manalhub3/cloudpilot).

