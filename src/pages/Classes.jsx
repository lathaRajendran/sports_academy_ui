import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const Classes = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [classes, setClasses] = useState([])
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    class_name: '',
    target_ages: '',
    coach_id: '',
    location: '',
    capacity: 0,
    day_of_week: 'Monday',
    fee_per_class: 0
  })

  const navigate = useNavigate()

  const fetchClasses = () => {
    fetch(`${API_BASE_URL}/classes/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setClasses(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const fetchCoaches = () => {
    fetch(`${API_BASE_URL}/coaches/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setCoaches(data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchClasses()
    fetchCoaches()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const payload = {
      ...formData,
      coach_id: formData.coach_id || null
    }

    fetch(`${API_BASE_URL}/classes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false)
        setFormData({ class_name: '', target_ages: '', coach_id: '', location: '', capacity: 0, day_of_week: 'Monday', fee_per_class: 0 })
        fetchClasses()
      })
      .catch(err => console.error(err))
  }

  const handleDeleteClass = (classId) => {
    if (!window.confirm("Are you sure you want to delete this class? This will also cancel all enrollments for this class.")) return;
    
    fetch(`${API_BASE_URL}/classes/${classId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if (res.ok) {
        fetchClasses();
      } else {
        alert("Failed to delete class");
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Class Schedules</h1>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Class</button>}
      </div>
      
      <div className="grid-cards">
        {loading ? (
          <p>Loading classes...</p>
        ) : classes.length === 0 ? (
          <p>No classes found.</p>
        ) : (
          classes.map(cls => (
            <div key={cls.class_id} className="card glass" style={{ position: 'relative' }}>
              {isAdmin && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.class_id); }}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}
                  title="Delete Class"
                >
                  &times;
                </button>
              )}
              <div onClick={() => navigate(`/classes/${cls.class_id}`)} style={{ cursor: 'pointer' }}>
                <h2 className="card-title">{cls.class_name}</h2>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  <div><strong>Ages:</strong> {cls.target_ages || 'All'}</div>
                  <div><strong>Fee:</strong> ${cls.fee_per_class}/class</div>
                  <div><strong>Coach:</strong> {cls.coach ? `${cls.coach.first_name} ${cls.coach.last_name}` : 'Unassigned'}</div>
                  <div><strong>Capacity:</strong> {cls.capacity || 'Unlimited'}</div>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  {isAdmin ? 'Manage Class' : 'View Class & Enroll'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', width: '400px', background: 'var(--bg-card)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Class</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Class Name" required className="form-input" value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="Target Ages (e.g. 5-10)" className="form-input" value={formData.target_ages} onChange={e => setFormData({...formData, target_ages: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="Location" className="form-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
              
              <select className="form-input" value={formData.coach_id} onChange={e => setFormData({...formData, coach_id: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                <option value="">-- Assign Coach (Optional) --</option>
                {coaches.map(coach => (
                  <option key={coach.coach_id} value={coach.coach_id}>{coach.first_name} {coach.last_name}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="number" placeholder="Capacity" className="form-input" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)', flex: 1 }} />
                <input type="number" step="0.01" placeholder="Fee ($)" className="form-input" value={formData.fee_per_class} onChange={e => setFormData({...formData, fee_per_class: parseFloat(e.target.value) || 0})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: 'var(--bg-main)', color: 'var(--text-primary)', flex: 1 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Classes
