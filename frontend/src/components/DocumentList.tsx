import { useEffect, useState } from 'react'
import axios from 'axios'

interface Document {
  id: number
  filename: string
  created_at: string
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:8000/api/documents')
      .then(res => setDocuments(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-gray-500">Loading documents...</p>

  if (documents.length === 0) return (
    <p className="text-sm text-gray-500">No documents uploaded yet.</p>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
      <ul className="space-y-2">
        {documents.map(doc => (
          <li key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-800">{doc.filename}</span>
            <span className="text-xs text-gray-400">
              {new Date(doc.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}