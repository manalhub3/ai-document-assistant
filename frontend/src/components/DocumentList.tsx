import { useEffect, useState } from 'react'
import api from '../api'

interface Document {
  id: number
  filename: string
  created_at: string
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchDocuments = () => {
    api.get('/documents')
      .then(res => setDocuments(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try {
      await api.delete(`/documents/${id}`)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch {
      alert('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

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
            <div>
              <p className="text-sm text-gray-800">{doc.filename}</p>
              <p className="text-xs text-gray-400">
                {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={deleting === doc.id}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting === doc.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}