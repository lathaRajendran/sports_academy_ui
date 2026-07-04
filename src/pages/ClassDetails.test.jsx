import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ClassDetails from './ClassDetails'
import { useAuth } from '../App'

// Mock useAuth
vi.mock('../App', () => ({
  useAuth: vi.fn()
}))

const mockClass = {
  class_id: "123",
  class_name: "Test Class",
  target_ages: "10-12",
  capacity: 15,
  day_of_week: "Monday",
  location: "Field 1",
  fee_per_class: 15,
  description: "Test description",
  status: "Active"
}

describe('ClassDetails Component', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  it('renders admin roster view', async () => {
    useAuth.mockReturnValue({
      user: { role: 'Admin' }
    })
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockClass
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => [] // roster
    })

    render(
      <MemoryRouter initialEntries={['/classes/123']}>
        <Routes>
          <Route path="/classes/:id" element={<ClassDetails />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Test Class')).toBeInTheDocument()
    expect(await screen.findByText('Class Roster & Attendance')).toBeInTheDocument()
  })

  it('renders student enrollment view (not enrolled)', async () => {
    useAuth.mockReturnValue({
      user: { role: 'Student', player_id: '456' }
    })
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockClass
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => [] // student enrollments (empty)
    })

    render(
      <MemoryRouter initialEntries={['/classes/123']}>
        <Routes>
          <Route path="/classes/:id" element={<ClassDetails />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Test Class')).toBeInTheDocument()
    expect(await screen.findByText('My Enrollment Status')).toBeInTheDocument()
    // Enrollment is fetched from a second API call, so it renders conditionally
    // Wait for the button
    expect(await screen.findByRole('button', { name: /Enroll Now/i })).toBeInTheDocument()
  })

  it('renders student enrollment view (enrolled)', async () => {
    useAuth.mockReturnValue({
      user: { role: 'Student', player_id: '456' }
    })
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockClass
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ enrollment_id: '789', class_id: '123', status: 'Active' }] 
    })

    render(
      <MemoryRouter initialEntries={['/classes/123']}>
        <Routes>
          <Route path="/classes/:id" element={<ClassDetails />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Test Class')).toBeInTheDocument()
    expect(await screen.findByText('My Enrollment Status')).toBeInTheDocument()
    expect(await screen.findByText('Status:')).toBeInTheDocument()
    expect(await screen.findByText('Active')).toBeInTheDocument()
  })
})
