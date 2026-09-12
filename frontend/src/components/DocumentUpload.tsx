import { useState, useRef } from 'react'
import api from '../api'

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/documents/upload', formData)
      setMessage({
        type: 'success',
        text: `"${res.data.filename}" uploaded — ${res.data.chunks} chunks created`
      })
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Upload failed'
      })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Upload Document</h2>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
        <span className="text-sm text-gray-500">
          {uploading ? 'Uploading...' : 'Click to upload a PDF'}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {message && (
        <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}