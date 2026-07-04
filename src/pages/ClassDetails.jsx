import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, MapPin, Clock } from 'lucide-react'
import { useAuth } from '../App'

const ClassDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const isStudent = user?.role === 'Student'
  
  const [classData, setClassData] = useState(null)
  const [roster, setRoster] = useState([])
  const [studentEnrollment, setStudentEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrollError, setEnrollError] = useState('')

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStatuses, setAttendanceStatuses] = useState({})
  const [markingStatus, setMarkingStatus] = useState({})

  useEffect(() => {
    const promises = [
      fetch(`http://localhost:8345/classes/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json())
    ]
    
    if (isAdmin) {
      promises.push(
        fetch(`http://localhost:8345/classes/${id}/roster`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json())
      )
    } else if (isStudent && user?.player_id) {
      promises.push(
        fetch(`http://localhost:8345/classes/player/${user.player_id}/enrollments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json())
      )
    }

    Promise.all(promises)
      .then((results) => {
        setClassData(results[0])
        
        if (isAdmin) {
          const rosterInfo = results[1]
          setRoster(rosterInfo)
          // Initialize default attendance statuses to 'Attended'
          const defaultStatuses = {}
          rosterInfo.forEach(p => {
            defaultStatuses[p.player_id] = 'Attended'
          })
          setAttendanceStatuses(defaultStatuses)
        } else if (isStudent) {
          const enrollments = results[1]
          const currentEnrollment = enrollments.find(e => e.class_id === id && e.status !== 'Cancelled')
          setStudentEnrollment(currentEnrollment || null)
        }
        
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id, isAdmin, isStudent, user])

  const handleStatusChange = (playerId, status) => {
    setAttendanceStatuses(prev => ({ ...prev, [playerId]: status }))
  }

  const markAttendance = (playerId) => {
    setMarkingStatus(prev => ({ ...prev, [playerId]: 'saving' }))
    
    fetch('http://localhost:8345/attendance/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        player_id: playerId,
        class_id: id,
        date: attendanceDate,
        status: attendanceStatuses[playerId]
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to mark attendance')
        return res.json()
      })
      .then(data => {
        setMarkingStatus(prev => ({ ...prev, [playerId]: 'success' }))
        setTimeout(() => setMarkingStatus(prev => ({ ...prev, [playerId]: null })), 2000)
      })
      .catch(err => {
        console.error(err)
        setMarkingStatus(prev => ({ ...prev, [playerId]: 'error' }))
      })
  }

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
      .then(data => setStudentEnrollment(data))
      .catch(err => alert(err.message))
  }

  const handleEnroll = () => {
    setEnrollError('')
    fetch('http://localhost:8345/classes/enrollments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        player_id: user.player_id, 
        class_id: id,
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
        setStudentEnrollment(data)
      })
      .catch(err => setEnrollError(err.message))
  }

  if (loading) {
    return <div className="page-container"><p>Loading class details...</p></div>
  }

  if (!classData) {
    return <div className="page-container"><p>Class not found.</p></div>
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
          <Calendar size={64} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{classData.class_name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={18} /> {classData.location || 'TBA'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={18} /> {classData.day_of_week || 'TBA'} {classData.start_time ? `at ${classData.start_time}` : ''}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={18} /> {roster.length} / {classData.capacity || '∞'} Enrolled</span>
          </p>
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
        
        {isAdmin && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>Class Roster & Attendance</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontWeight: 'bold' }}>Session Date:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  style={{ width: 'auto' }}
                />
              </div>
            </div>

            {roster.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No players enrolled in this class yet.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Player Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Attendance Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map(player => (
                      <tr key={player.player_id}>
                        <td>{player.first_name ? `${player.first_name} ${player.last_name || ''}` : player.parent_name}</td>
                        <td>{player.age || '-'}</td>
                        <td>{player.gender || '-'}</td>
                        <td>
                          <select 
                            className="form-control"
                            value={attendanceStatuses[player.player_id] || 'Attended'}
                            onChange={(e) => handleStatusChange(player.player_id, e.target.value)}
                            style={{ width: '100%', maxWidth: '200px' }}
                          >
                            <option value="Attended">Attended</option>
                            <option value="Missed">Missed</option>
                            <option value="Makeup">Makeup</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Trial">Trial</option>
                            <option value="Free">Free</option>
                            <option value="Paused">Paused</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            className={`btn ${markingStatus[player.player_id] === 'success' ? 'btn-success' : 'btn-primary'}`}
                            onClick={() => markAttendance(player.player_id)}
                            disabled={markingStatus[player.player_id] === 'saving'}
                          >
                            {markingStatus[player.player_id] === 'saving' ? 'Saving...' : 
                             markingStatus[player.player_id] === 'success' ? 'Saved!' : 'Save'}
                          </button>
                          {markingStatus[player.player_id] === 'error' && <span style={{ color: 'red', marginLeft: '0.5rem' }}>Error</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {isStudent && (
          <div>
            <h2>My Enrollment Status</h2>
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '0.5rem', border: '1px solid #333' }}>
              {studentEnrollment ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontWeight: '500', fontSize: '1.2rem' }}>Status:</span>
                    <span className={`badge ${studentEnrollment.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '1rem' }}>
                      {studentEnrollment.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {studentEnrollment.status === 'Active' ? (
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleUpdateEnrollment(studentEnrollment.enrollment_id, { status: 'Paused' })}
                      >
                        Pause Enrollment
                      </button>
                    ) : (
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleUpdateEnrollment(studentEnrollment.enrollment_id, { status: 'Active' })}
                      >
                        Resume Enrollment
                      </button>
                    )}
                    <button 
                      className="btn btn-outline" 
                      style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      onClick={() => handleUpdateEnrollment(studentEnrollment.enrollment_id, { status: 'Cancelled' })}
                    >
                      Cancel Enrollment
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>You are not currently enrolled in this class.</p>
                  <button className="btn btn-primary" onClick={handleEnroll} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                    Enroll Now
                  </button>
                  {enrollError && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{enrollError}</p>}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ClassDetails
