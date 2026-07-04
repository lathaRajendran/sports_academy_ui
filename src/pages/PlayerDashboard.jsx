import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Activity, Map, ArrowRight } from 'lucide-react'

const PlayerDashboard = ({ playerId }) => {
  const [player, setPlayer] = useState(null)
  const [attendances, setAttendances] = useState([])
  const [classes, setClasses] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }
        
        // Fetch player details
        const playerRes = await fetch(`http://localhost:8345/players/${playerId}`, { headers })
        if (playerRes.ok) {
          const playerData = await playerRes.json()
          setPlayer(playerData)
        } else {
          setPlayer(null)
        }

        // Fetch player attendance
        const attendanceRes = await fetch(`http://localhost:8345/attendance/player/${playerId}`, { headers })
        const attendanceData = await attendanceRes.json()
        if (attendanceRes.ok) {
          setAttendances(attendanceData)
        } else {
          setAttendances([])
        }

        // Fetch all classes to map class_id to name
        const classesRes = await fetch(`http://localhost:8345/classes/`, { headers })
        const classesData = await classesRes.json()
        if (classesRes.ok) {
          const classMap = {}
          classesData.forEach(c => classMap[c.class_id] = c.class_name)
          setClasses(classMap)
        }

      } catch (err) {
        console.error("Failed to load player dashboard data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [playerId])

  if (loading) return <div>Loading your dashboard...</div>
  if (!player) return <div>Player not found.</div>

  const attendedCount = attendances.filter(a => a.status === 'Attended').length
  const recentAttendances = attendances.slice(0, 5) // Last 5

  return (
    <div>
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1 className="page-title">Welcome back, {player.first_name || player.parent_name}!</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic', fontSize: '1.1rem' }}>
          "Great job showing up! Every practice brings you closer to your goals. Keep pushing and enjoy the game!"
        </p>
      </div>

      <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass">
          <div className="card-title">Wallet Balance</div>
          <div className="card-value" style={{ color: player.current_balance < 0 ? 'var(--danger)' : 'var(--success)' }}>
            ${player.current_balance?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="card glass">
          <div className="card-title">Classes Attended</div>
          <div className="card-value">{attendedCount}</div>
        </div>
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <User size={32} style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
          <Link to={`/players/${playerId}/edit`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
            Update Profile
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Classes Enrolled */}
        <div className="card glass">
          <h2 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Map size={20} /> My Classes
          </h2>
          {player.classes && player.classes.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {player.classes.map((className, idx) => (
                <li key={idx} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '500' }}>{className}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status: Active</div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Not enrolled in any classes yet.</p>
          )}
        </div>

        {/* Attendance History */}
        <div className="card glass">
          <h2 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> Recent Attendance
          </h2>
          {recentAttendances.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {recentAttendances.map(record => (
                <li key={record.attendance_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{classes[record.class_id] || 'Unknown Class'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{record.date}</div>
                  </div>
                  <div>
                    <span className={`badge badge-${record.status === 'Attended' ? 'success' : record.status === 'Missed' ? 'danger' : 'warning'}`}>
                      {record.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No attendance records found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerDashboard
