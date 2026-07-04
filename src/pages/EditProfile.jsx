import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { useAuth } from '../App'

const EditProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    parent_name: '',
    email: '',
    parent_phone: '',
    phone: '',
    address: '',
    age: '',
    gender: 'Male'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch(`http://localhost:8345/players/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load player data")
        return res.json()
      })
      .then(data => {
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          parent_name: data.parent_name || '',
          email: data.email || '',
          parent_phone: data.parent_phone || '',
          phone: data.phone || '',
          address: data.address || '',
          age: data.age || '',
          gender: data.gender || 'Male'
        })
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : null
    }

    fetch(`http://localhost:8345/players/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.detail || 'Failed to update profile') })
        }
        return res.json()
      })
      .then(data => {
        setSuccess('Profile updated successfully!')
        setTimeout(() => {
          if (user && formData.email !== user.sub) {
            // Email changed, token is now invalid, force re-login
            alert("Email updated. Please log in again with your new email.")
            logout()
          } else {
            navigate(`/players/${id}`)
          }
        }, 1500)
      })
      .catch(err => setError(err.message))
  }

  if (loading) return <div className="page-container"><p>Loading profile editor...</p></div>

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-outline" 
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card glass" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '1rem', borderRadius: '50%' }}>
            <User size={32} />
          </div>
          <h2>Edit Player Profile</h2>
        </div>
        
        {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', padding: '1rem' }}>{error}</div>}
        {success && <div className="badge badge-success" style={{ display: 'block', marginBottom: '1rem', padding: '1rem' }}>{success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Player First Name</label>
              <input type="text" className="form-control" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Player Last Name</label>
              <input type="text" className="form-control" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Parent Name</label>
              <input type="text" className="form-control" value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} required />
            </div>
            <div>
              <label className="form-label">Email Address (Login Username)</label>
              <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Parent Phone</label>
              <input type="tel" className="form-control" value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Player Phone</label>
              <input type="tel" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="form-label">Home Address</label>
            <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Age</label>
              <input type="number" className="form-control" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select className="form-control" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Coed">Coed</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile
