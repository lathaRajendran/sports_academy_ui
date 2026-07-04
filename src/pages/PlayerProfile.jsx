import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, CreditCard, Calendar, Activity } from 'lucide-react'

const PlayerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [classesList, setClassesList] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [enrollError, setEnrollError] = useState('')
  const [loading, setLoading] = useState(true)

  // Top-Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Card')

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})

  const fetchPlayerData = () => {
    fetch(`http://localhost:8345/players/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlayer(data)
        setEditFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          parent_name: data.parent_name || '',
          email: data.email || '',
          parent_phone: data.parent_phone || '',
          age: data.age || '',
          gender: data.gender || 'Male'
        })
      })
      .catch(err => console.error(err))

    fetch(`http://localhost:8345/classes/player/${id}/enrollments`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setEnrollments(data))
      .catch(err => console.error(err))

    fetch(`http://localhost:8345/transactions/player/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchPlayerData()

    // Fetch all classes for dropdown
    fetch('http://localhost:8345/classes/', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setClassesList(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  const handleUpdateEnrollment = (enrollmentId, updates) => {
    fetch(`http://localhost:8345/classes/enrollments/${enrollmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updates)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update enrollment')
        return res.json()
      })
      .then(() => fetchPlayerData())
      .catch(err => alert(err.message))
  }

  const handleEnroll = (e) => {
    e.preventDefault()
    if (!selectedClassId) return
    setEnrollError('')

    fetch('http://localhost:8345/classes/enrollments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        player_id: id, 
        class_id: selectedClassId,
        start_date: new Date().toISOString().split('T')[0]
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.detail || 'Enrollment failed') })
        }
        return res.json()
      })
      .then(data => {
        fetchPlayerData()
      })
      .catch(err => setEnrollError(err.message))
  }

  const handleTopUp = (e) => {
    e.preventDefault()
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) return

    fetch('http://localhost:8345/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        player_id: id,
        amount: parseFloat(topUpAmount),
        type: 'Credit_Purchase',
        payment_method: paymentMethod
      })
    })
      .then(res => {
        if(!res.ok) {
          return res.json().then(err => { throw new Error(err.detail || "Failed to process transaction") })
        }
        return res.json()
      })
      .then(data => {
        setShowTopUpModal(false)
        setTopUpAmount('')
        fetchPlayerData()
      })
      .catch(err => alert(err.message))
  }

  const handleSendReminder = () => {
    fetch(`http://localhost:8345/players/${id}/reminders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message)
      })
      .catch(err => alert("Failed to send reminder"))
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...editFormData,
      age: editFormData.age ? parseInt(editFormData.age, 10) : null
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
        setShowEditModal(false)
        fetchPlayerData()
      })
      .catch(err => alert(err.message))
  }

  if (loading) {
    return <div className="page-container"><p>Loading profile...</p></div>
  }

  if (!player) {
    return <div className="page-container"><p>Player not found.</p></div>
  }

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-outline" 
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="profile-header glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '2rem', borderRadius: '50%' }}>
          <User size={64} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{player.parent_name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                {player.first_name ? `Player: ${player.first_name} ${player.last_name} • ` : ''} 
                Status: <span className={`badge ${player.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{player.status}</span>
              </p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate(`/players/${id}/edit`)}>Edit Profile</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="stat-card glass">
          <div className="stat-icon"><Calendar size={24} color="var(--primary-color)" /></div>
          <div className="stat-info" style={{ width: '100%' }}>
            <h3>Classes Enrolled</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {enrollments.length === 0 ? (
                <p className="stat-label">No active classes</p>
              ) : (
                enrollments.map(e => (
                  <div key={e.enrollment_id} style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '0.5rem', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{e.class_schedule?.class_name || 'Unknown'}</strong>
                      <span className={`badge ${e.status === 'Active' ? 'badge-success' : e.status === 'Paused' ? 'badge-warning' : 'badge-neutral'}`}>
                        {e.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      {e.status === 'Active' ? (
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleUpdateEnrollment(e.enrollment_id, { status: 'Paused' })}>Pause</button>
                      ) : (
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleUpdateEnrollment(e.enrollment_id, { status: 'Active' })}>Resume</button>
                      )}
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleUpdateEnrollment(e.enrollment_id, { status: 'Cancelled' })}>Cancel</button>
                      
                      <select 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '0.25rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid #555' }}
                        onChange={(ev) => {
                          if(ev.target.value) {
                            handleUpdateEnrollment(e.enrollment_id, { class_id: ev.target.value })
                          }
                        }}
                        value=""
                      >
                        <option value="" disabled>Transfer...</option>
                        {classesList.map(c => (
                          <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleEnroll} style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <select 
                className="form-control" 
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                required
              >
                <option value="" disabled>Select a class...</option>
                {classesList
                  .filter(c => !enrollments.some(e => e.class_id === c.class_id && e.status !== 'Cancelled'))
                  .map(c => (
                  <option key={c.class_id} value={c.class_id}>{c.class_name} at {c.location || 'TBA'} ({c.day_of_week || 'TBA'})</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Enroll</button>
            </form>
            {enrollError && <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.9rem' }}>{enrollError}</p>}
          </div>
        </div>
        
        <div className="stat-card glass" style={{ gridColumn: 'span 1' }}>
          <div className="stat-icon"><Activity size={24} color="var(--primary-color)" /></div>
          <div className="stat-info">
            <h3>Attendance</h3>
            <p className="stat-value" style={{ fontSize: '1.5rem' }}>{player.attendance_summary || 'No records'}</p>
          </div>
        </div>

        <div className="stat-card glass" style={{ gridColumn: 'span 2' }}>
          <div className="stat-icon"><CreditCard size={24} color="var(--primary-color)" /></div>
          <div className="stat-info" style={{ width: '100%' }}>
            <h3>Digital Wallet</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '0.5rem' }}>
              <div>
                <p className="stat-label">Current Balance</p>
                <p className="stat-value" style={{ color: player.current_balance < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  ${player.current_balance}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {player.current_balance < 0 && (
                  <button className="btn btn-outline" onClick={handleSendReminder} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Send Reminder</button>
                )}
                <button className="btn btn-primary" onClick={() => setShowTopUpModal(true)}>Top-Up Wallet</button>
              </div>
            </div>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Financial Ledger</h4>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                    <th style={{ padding: '0.5rem' }}>Date</th>
                    <th style={{ padding: '0.5rem' }}>Type</th>
                    <th style={{ padding: '0.5rem' }}>Method</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '0.5rem', textAlign: 'center' }}>No transactions found</td></tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.transaction_id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '0.5rem' }}>{new Date(t.timestamp).toLocaleDateString()}</td>
                        <td style={{ padding: '0.5rem' }}>{t.type.replace('_', ' ')}</td>
                        <td style={{ padding: '0.5rem' }}>{t.payment_method.replace('_', ' ')}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', color: t.type === 'Credit_Purchase' ? 'var(--success)' : 'var(--danger)' }}>
                          {t.type === 'Credit_Purchase' ? '+' : '-'}${t.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showTopUpModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '400px' }}>
            <h2>Top-Up Wallet</h2>
            <form onSubmit={handleTopUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <label className="form-label">Payment Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  className="form-control" 
                  value={topUpAmount} 
                  onChange={e => setTopUpAmount(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="form-label">Payment Method</label>
                <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank_Transfer">Bank Transfer</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTopUpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Player First Name</label>
                  <input type="text" className="form-control" value={editFormData.first_name} onChange={e => setEditFormData({...editFormData, first_name: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Player Last Name</label>
                  <input type="text" className="form-control" value={editFormData.last_name} onChange={e => setEditFormData({...editFormData, last_name: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Parent Name</label>
                  <input type="text" className="form-control" value={editFormData.parent_name} onChange={e => setEditFormData({...editFormData, parent_name: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control" value={editFormData.age} onChange={e => setEditFormData({...editFormData, age: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={editFormData.gender} onChange={e => setEditFormData({...editFormData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerProfile
