import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const Players = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [players, setPlayers] = useState([])
  const [classesList, setClassesList] = useState([])
  const [selectedFilterClass, setSelectedFilterClass] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    parent_name: '',
    email: '',
    age: '',
    gender: 'Male',
    class_id: '',
    initial_payment: '',
    payment_method: 'Cash'
  })
  const [minPayment, setMinPayment] = useState(0)

  const navigate = useNavigate()

  const fetchPlayers = () => {
    Promise.all([
      fetch(`${API_BASE_URL}/players/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()),
      fetch(`${API_BASE_URL}/classes/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json())
    ])
      .then(([playersData, classesData]) => {
        setPlayers(playersData)
        setClassesList(classesData)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPlayers()
    
    // Fetch classes for the registration modal
    fetch(`${API_BASE_URL}/classes/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setClassesList(data))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.class_id) {
      alert("Please select a class.")
      return
    }
    
    if (parseFloat(formData.initial_payment) < minPayment) {
      alert(`Minimum payment is $${minPayment}`)
      return
    }
    
    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : null,
      initial_payment: parseFloat(formData.initial_payment)
    }

    fetch(`${API_BASE_URL}/players/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { 
            const errMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
            throw new Error(errMsg || 'Failed to create player') 
          })
        }
        return res.json()
      })
      .then(data => {
        setShowModal(false)
        setFormData({ first_name: '', last_name: '', parent_name: '', email: '', age: '', gender: 'Male', class_id: '', initial_payment: '', payment_method: 'Cash' })
        setMinPayment(0)
        fetchPlayers()
      })
      .catch(err => alert(err.message))
  }

  const handleDeletePlayer = (playerId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this player? This will cancel their enrollments and disable their login.")) return;
    
    fetch(`${API_BASE_URL}/players/${playerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if (res.ok) {
        fetchPlayers();
      } else {
        alert("Failed to delete player");
      }
    })
    .catch(err => console.error(err));
  };

  const filteredPlayers = selectedFilterClass 
    ? players.filter(p => p.classes && p.classes.includes(selectedFilterClass))
    : players

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Players Roster</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className="form-control" 
            value={selectedFilterClass} 
            onChange={e => setSelectedFilterClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classesList.map(c => (
              <option key={c.class_id} value={c.class_name}>{c.class_name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add New Player</button>
        </div>
      </div>
      
      <div className="table-container glass">
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Parent Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Classes</th>
              <th>Attendance</th>
              <th>Credits</th>
              <th>Balance</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isAdmin ? 11 : 10} style={{textAlign: 'center'}}>Loading...</td></tr>
            ) : filteredPlayers.length === 0 ? (
              <tr><td colSpan={isAdmin ? 11 : 10} style={{textAlign: 'center'}}>No players found.</td></tr>
            ) : (
              filteredPlayers.map(player => (
                <tr 
                  key={player.player_id} 
                  onClick={() => navigate(`/players/${player.player_id}`)}
                  style={{ cursor: 'pointer' }}
                  className="hoverable-row"
                >
                  <td>{player.first_name ? `${player.first_name} ${player.last_name || ''}` : '-'}</td>
                  <td>{player.parent_name}</td>
                  <td>{player.email || '-'}</td>
                  <td>{player.age || '-'}</td>
                  <td>{player.gender || '-'}</td>
                  <td>{player.classes && player.classes.length > 0 ? player.classes.join(', ') : '-'}</td>
                  <td>{player.attendance_summary || '-'}</td>
                  <td>
                    <span className={`badge ${player.available_credits > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {player.available_credits}
                    </span>
                  </td>
                  <td>${player.current_balance}</td>
                  <td>
                    <span className={`badge ${player.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                      {player.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button 
                        onClick={(e) => handleDeletePlayer(player.player_id, e)}
                        style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}
                        title="Delete Player"
                      >
                        &times;
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>Add New Player</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Player First Name</label>
                  <input type="text" className="form-control" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Player Last Name</label>
                  <input type="text" className="form-control" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Parent Name</label>
                  <input type="text" className="form-control" value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Initial Class Enrollment</label>
                  <select 
                    className="form-control" 
                    value={formData.class_id} 
                    onChange={e => {
                      const cid = e.target.value;
                      setFormData({...formData, class_id: cid})
                      const selectedCls = classesList.find(c => c.class_id === cid)
                      if(selectedCls) setMinPayment(selectedCls.fee_per_class * 10)
                    }}
                    required
                  >
                    <option value="" disabled>Select a class...</option>
                    {classesList.map(c => (
                      <option key={c.class_id} value={c.class_id}>{c.class_name} (${c.fee_per_class}/class)</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Initial Payment (Min: ${minPayment})</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    value={formData.initial_payment} 
                    onChange={e => setFormData({...formData, initial_payment: e.target.value})} 
                    required 
                    min={minPayment}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Payment Method</label>
                  <select 
                    className="form-control" 
                    value={formData.payment_method} 
                    onChange={e => setFormData({...formData, payment_method: e.target.value})}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank_Transfer">Bank Transfer</option>
                    <option value="Credit_Deduct">Credit Deduct</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Player</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Players
