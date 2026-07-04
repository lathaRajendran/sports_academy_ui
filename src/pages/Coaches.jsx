import React, { useState, useEffect } from 'react'
import { UserPlus, Mail, Phone, Award } from 'lucide-react'

const Coaches = () => {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialty: ''
  })

  const fetchCoaches = () => {
    fetch('http://localhost:8345/coaches/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setCoaches(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCoaches()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetch('http://localhost:8345/coaches/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false)
        setFormData({ first_name: '', last_name: '', email: '', phone: '', specialty: '' })
        fetchCoaches()
      })
      .catch(err => console.error(err))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Coaches</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={18} style={{ marginRight: '0.5rem' }} /> Add Coach
        </button>
      </div>

      <div className="grid-cards">
        {loading ? (
          <p>Loading coaches...</p>
        ) : coaches.length === 0 ? (
          <p>No coaches found.</p>
        ) : (
          coaches.map(coach => (
            <div key={coach.coach_id} className="card glass">
              <h2 className="card-title">{coach.first_name} {coach.last_name}</h2>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} /> {coach.email || 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} /> {coach.phone || 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} /> {coach.specialty || 'General'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', width: '400px', background: 'var(--bg-card)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Coach</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="First Name" required className="form-input" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="Last Name" required className="form-input" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              <input type="email" placeholder="Email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              <input type="tel" placeholder="Phone" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="Specialty" className="form-input" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                * A login account will automatically be created for the coach if an email is provided. 
                <br/>Default password: <strong>coach123</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Coach</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Coaches
