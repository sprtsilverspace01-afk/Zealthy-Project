'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  phone: string
  address: string
  appointments: Appointment[]
  prescriptions: Prescription[]
}

interface Appointment {
  id: string
  providerName: string
  dateTime: string
  repeatSchedule: string | null
  endDate: string | null
  reason: string | null
}

interface Prescription {
  id: string
  medicationName: string
  dosage: string
  quantity: number
  refillDate: string
  refillSchedule: string
}

interface Medication {
  id: string
  name: string
  dosages: string[]
}

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [showEditPatient, setShowEditPatient] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [selectedMed, setSelectedMed] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    fetchPatient()
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      const res = await fetch('/api/medications')
      const data = await res.json()
      setMedications(data)
    } catch (error) {
      console.error('Failed to fetch medications:', error)
    }
  }

  const fetchPatient = async () => {
    try {
      const res = await fetch(`/api/patients/${params.id}`)
      const data = await res.json()
      setPatient(data)
    } catch (error) {
      console.error('Failed to fetch patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const updateData: any = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      dateOfBirth: formData.get('dateOfBirth'),
      phone: formData.get('phone'),
      address: formData.get('address')
    }

    const password = formData.get('password') as string
    if (password) {
      updateData.password = password
    }

    try {
      const res = await fetch(`/api/patients/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        setShowEditPatient(false)
        fetchPatient()
      }
    } catch (error) {
      console.error('Failed to update patient:', error)
    }
  }

  const handleAppointmentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const appointmentData = {
      patientId: params.id,
      providerName: formData.get('providerName'),
      dateTime: formData.get('dateTime'),
      repeatSchedule: formData.get('repeatSchedule') || null,
      endDate: formData.get('endDate') || null,
      reason: formData.get('reason') || null
    }

    try {
      const url = editingAppointment 
        ? `/api/appointments/${editingAppointment.id}`
        : '/api/appointments'
      
      const res = await fetch(url, {
        method: editingAppointment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })

      if (res.ok) {
        setShowAppointmentForm(false)
        setEditingAppointment(null)
        fetchPatient()
      }
    } catch (error) {
      console.error('Failed to save appointment:', error)
    }
  }

  const handlePrescriptionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const prescriptionData = {
      patientId: params.id,
      medicationName: formData.get('medicationName'),
      dosage: formData.get('dosage'),
      quantity: parseInt(formData.get('quantity') as string),
      refillDate: formData.get('refillDate'),
      refillSchedule: formData.get('refillSchedule')
    }

    try {
      const url = editingPrescription 
        ? `/api/prescriptions/${editingPrescription.id}`
        : '/api/prescriptions'
      
      const res = await fetch(url, {
        method: editingPrescription ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      })

      if (res.ok) {
        setShowPrescriptionForm(false)
        setEditingPrescription(null)
        fetchPatient()
      }
    } catch (error) {
      console.error('Failed to save prescription:', error)
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (res.ok) fetchPatient()
    } catch (error) {
      console.error('Failed to delete appointment:', error)
    }
  }

  const handleDeletePrescription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return

    try {
      const res = await fetch(`/api/prescriptions/${id}`, { method: 'DELETE' })
      if (res.ok) fetchPatient()
    } catch (error) {
      console.error('Failed to delete prescription:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!patient) return <div>Patient not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => router.push('/admin')} className="text-white hover:text-indigo-200 mr-4">
                ← Back
              </button>
              <h1 className="text-xl font-bold text-white">Patient Details</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
            <button
              onClick={() => setShowEditPatient(!showEditPatient)}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              {showEditPatient ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {showEditPatient ? (
            <form onSubmit={handleUpdatePatient} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={patient.firstName}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={patient.lastName}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={patient.email}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  defaultValue={patient.dateOfBirth.split('T')[0]}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={patient.phone}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={patient.address}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Update Patient
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.firstName} {patient.lastName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900">{format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{patient.address}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
            <button
              onClick={() => {
                setShowAppointmentForm(!showAppointmentForm)
                setEditingAppointment(null)
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
            >
              {showAppointmentForm ? 'Cancel' : 'New Appointment'}
            </button>
          </div>

          {showAppointmentForm && (
            <form onSubmit={handleAppointmentSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provider Name</label>
                  <input
                    type="text"
                    name="providerName"
                    defaultValue={editingAppointment?.providerName}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    defaultValue={editingAppointment?.dateTime ? new Date(editingAppointment.dateTime).toISOString().slice(0, 16) : ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Repeat Schedule</label>
                  <select
                    name="repeatSchedule"
                    defaultValue={editingAppointment?.repeatSchedule || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  >
                    <option value="">None</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date (for recurring)</label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={editingAppointment?.endDate ? new Date(editingAppointment.endDate).toISOString().split('T')[0] : ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <input
                    type="text"
                    name="reason"
                    defaultValue={editingAppointment?.reason || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    {editingAppointment ? 'Update' : 'Create'} Appointment
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {patient.appointments.length === 0 ? (
              <p className="text-gray-500">No appointments scheduled.</p>
            ) : (
              patient.appointments.map(apt => (
                <div key={apt.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{apt.providerName}</p>
                    <p className="text-sm text-gray-600">{format(new Date(apt.dateTime), 'MMM dd, yyyy h:mm a')}</p>
                    {apt.reason && <p className="text-sm text-gray-500 mt-1">{apt.reason}</p>}
                    {apt.repeatSchedule && (
                      <p className="text-xs text-gray-400 mt-1">
                        Repeats: {apt.repeatSchedule}
                        {apt.endDate && ` until ${format(new Date(apt.endDate), 'MMM dd, yyyy')}`}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingAppointment(apt)
                        setShowAppointmentForm(true)
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(apt.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Prescriptions</h2>
            <button
              onClick={() => {
                setShowPrescriptionForm(!showPrescriptionForm)
                setEditingPrescription(null)
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
            >
              {showPrescriptionForm ? 'Cancel' : 'New Prescription'}
            </button>
          </div>

          {showPrescriptionForm && (
            <form onSubmit={handlePrescriptionSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medication Name</label>
                  <select
                    name="medicationName"
                    value={selectedMed}
                    onChange={(e) => setSelectedMed(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  >
                    <option value="">Select medication</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.name}>{med.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dosage</label>
                  <select
                    name="dosage"
                    required
                    disabled={!selectedMed}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  >
                    <option value="">Select dosage</option>
                    {selectedMed && medications.find(m => m.name === selectedMed)?.dosages.map(dosage => (
                      <option key={dosage} value={dosage}>{dosage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    defaultValue={editingPrescription?.quantity}
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Refill Date</label>
                  <input
                    type="date"
                    name="refillDate"
                    defaultValue={editingPrescription?.refillDate ? new Date(editingPrescription.refillDate).toISOString().split('T')[0] : ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Refill Schedule</label>
                  <select
                    name="refillSchedule"
                    defaultValue={editingPrescription?.refillSchedule}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    {editingPrescription ? 'Update' : 'Create'} Prescription
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {patient.prescriptions.length === 0 ? (
              <p className="text-gray-500">No prescriptions.</p>
            ) : (
              patient.prescriptions.map(rx => (
                <div key={rx.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{rx.medicationName}</p>
                    <p className="text-sm text-gray-600">{rx.dosage} - Quantity: {rx.quantity}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Next Refill: {format(new Date(rx.refillDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Schedule: {rx.refillSchedule}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingPrescription(rx)
                        setShowPrescriptionForm(true)
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePrescription(rx.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
