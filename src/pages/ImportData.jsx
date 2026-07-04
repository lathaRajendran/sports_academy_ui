import API_BASE_URL from '../config';
import React, { useState, useCallback } from 'react'
import { UploadCloud } from 'lucide-react'

const ImportData = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setMessage('')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setMessage('')
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/import/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessage(data.message || 'Data imported successfully!')
        setFile(null)
      } else {
        const err = await response.json()
        setMessage(`Error: ${err.detail || 'Upload failed'}`)
      }
    } catch (error) {
      console.error(error)
      setMessage('Network error occurred during upload.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Import Data</h1>
      </div>
      
      <div className="card glass" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Upload Historical Data</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Upload your Excel (.xlsx) or CSV file containing historical player data, payments, and class attendance to populate the system.
        </p>

        <label className="upload-area" htmlFor="file-upload">
          <UploadCloud className="upload-icon" size={48} />
          <h3>{file ? file.name : 'Click to select or drag and drop'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            CSV or XLSX (Max 10MB)
          </p>
          <input 
            id="file-upload" 
            type="file" 
            accept=".csv, .xlsx" 
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </label>

        {message && (
          <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--border-radius)', background: message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.includes('Error') ? 'var(--danger)' : 'var(--success)' }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Process Import'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportData
