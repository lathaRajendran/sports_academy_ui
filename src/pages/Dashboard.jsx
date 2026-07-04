import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react'
import { useAuth } from '../App'
import PlayerDashboard from './PlayerDashboard'

const Dashboard = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If student, don't fetch admin metrics
    if (user?.role === 'Student') {
      setLoading(false)
      return
    }

    fetch(`${API_BASE_URL}/dashboard/metrics`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setMetrics(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (user?.role === 'Student' && user?.player_id) {
    return <PlayerDashboard playerId={user.player_id} />
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Executive Dashboard</h1>
        </div>
        <div>Loading metrics...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
      </div>
      
      <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card glass">
          <div className="card-title">Active Players</div>
          <div className="card-value">{metrics?.active_players || 0}</div>
        </div>
        <div className="card glass">
          <div className="card-title">Active Enrollments</div>
          <div className="card-value">{metrics?.active_enrollments || 0}</div>
        </div>
        <div className="card glass">
          <div className="card-title">Upcoming Classes</div>
          <div className="card-value">{metrics?.upcoming_classes || 0}</div>
        </div>
        <div className="card glass">
          <div className="card-title">Total Revenue</div>
          <div className="card-value" style={{ color: 'var(--success)' }}>${metrics?.revenue?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="card glass">
          <div className="card-title">Outstanding Balances</div>
          <div className="card-value" style={{ color: 'var(--danger)' }}>${metrics?.outstanding_balances?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="card glass">
          <div className="card-title">Overall Attendance</div>
          <div className="card-value">{metrics?.attendance_rate || 0}%</div>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: '2rem' }}>
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Welcome to Academy Pro</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          This is your central hub for managing your sports academy. Monitor your key performance indicators above in real-time, and use the sidebar to manage players, classes, and finances.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
