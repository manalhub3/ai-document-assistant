import { useState } from 'react'
import DocumentUpload from './components/DocumentUpload'
import Chat from './components/Chat'
import DocumentList from './components/DocumentList'

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'documents'>('chat')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Document Assistant</h1>
            <p className="text-sm text-gray-500">Upload documents and ask questions</p>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Documents
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'chat' ? (
          <Chat />
        ) : (
          <div className="space-y-6">
            <DocumentUpload />
            <DocumentList />
          </div>
        )}
      </main>
    </div>
  )
}