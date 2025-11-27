import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [ping, setPing] = useState(null)

  useEffect(() => {
    fetch('/api/example/ping')
      .then((r) => r.json())
      .then(setPing)
      .catch(() => setPing({ ok: false }))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
      <div className="max-w-lg w-full p-8 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4">ClinicEase — MERN Starter</h1>
        <p className="mb-4 text-sm text-gray-600">This frontend is powered by Vite + React + Tailwind.</p>
        <div className="p-4 bg-gray-50 rounded">
          <strong>Backend status:</strong>
          <div className="mt-2 text-sm">
            {ping ? (
              ping.ok ? <span className="text-green-600">Online — {ping.message}</span> : <span className="text-red-600">Offline</span>
            ) : (
              <span className="text-gray-500">Checking…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
