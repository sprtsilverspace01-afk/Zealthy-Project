'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { format, addDays, isWithinInterval } from 'date-fns'

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

export default function PortalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'dashboard' | 'appointments' | 'prescriptions'>('dashboard')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchPatientData()
    }
  }, [status, session])

  const fetchPatientData = async () => {
    try {
      const res = await fetch(`/api/patients/${session?.user?.id}`)
      const data = await res.json()
      setPatient(data)
    } catch (error) {
      console.error('Failed to fetch patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!patient) return null

  const now = new Date()
  const sevenDaysFromNow = addDays(now, 7)
  const threeMonthsFromNow = addDays(now, 90)

  const upcomingAppointments = patient.appointments.filter(apt => {
    const aptDate = new Date(apt.dateTime)
    return aptDate >= now && aptDate <= sevenDaysFromNow
  })

  const upcomingRefills = patient.prescriptions.filter(rx => {
    const refillDate = new Date(rx.refillDate)
    return refillDate >= now && refillDate <= sevenDaysFromNow
  })

  const allUpcomingAppointments = patient.appointments.filter(apt => {
    const aptDate = new Date(apt.dateTime)
    return aptDate >= now && aptDate <= threeMonthsFromNow
  })

  const allUpcomingPrescriptions = patient.prescriptions.filter(rx => {
    const refillDate = new Date(rx.refillDate)
    return refillDate >= now && refillDate <= threeMonthsFromNow
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Patient Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {patient.firstName} {patient.lastName}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setView('dashboard')}
              className={`${
                view === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('appointments')}
              className={`${
                view === 'appointments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All Appointments
            </button>
            <button
              onClick={() => setView('prescriptions')}
              className={`${
                view === 'prescriptions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All Prescriptions
            </button>
          </nav>
        </div>

        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
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
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments (Next 7 Days)</h2>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500">No upcoming appointments in the next 7 days.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map(apt => (
                    <div key={apt.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                      <p className="font-medium text-gray-900">{apt.providerName}</p>
                      <p className="text-sm text-gray-600">{format(new Date(apt.dateTime), 'MMM dd, yyyy h:mm a')}</p>
                      {apt.reason && <p className="text-sm text-gray-500">{apt.reason}</p>}
                      {apt.repeatSchedule && <p className="text-xs text-gray-400">Repeats: {apt.repeatSchedule}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Refills (Next 7 Days)</h2>
              {upcomingRefills.length === 0 ? (
                <p className="text-gray-500">No refills scheduled in the next 7 days.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingRefills.map(rx => (
                    <div key={rx.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="font-medium text-gray-900">{rx.medicationName}</p>
                      <p className="text-sm text-gray-600">{rx.dosage} - Quantity: {rx.quantity}</p>
                      <p className="text-sm text-gray-500">Refill: {format(new Date(rx.refillDate), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-gray-400">Schedule: {rx.refillSchedule}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'appointments' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Upcoming Appointments (Next 3 Months)</h2>
            {allUpcomingAppointments.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments.</p>
            ) : (
              <div className="space-y-3">
                {allUpcomingAppointments.map(apt => (
                  <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{apt.providerName}</p>
                    <p className="text-sm text-gray-600">{format(new Date(apt.dateTime), 'MMM dd, yyyy h:mm a')}</p>
                    {apt.reason && <p className="text-sm text-gray-500 mt-1">{apt.reason}</p>}
                    {apt.repeatSchedule && <p className="text-xs text-gray-400 mt-1">Repeats: {apt.repeatSchedule}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'prescriptions' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Prescriptions (Next 3 Months)</h2>
            {allUpcomingPrescriptions.length === 0 ? (
              <p className="text-gray-500">No prescriptions.</p>
            ) : (
              <div className="space-y-3">
                {allUpcomingPrescriptions.map(rx => (
                  <div key={rx.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{rx.medicationName}</p>
                    <p className="text-sm text-gray-600">{rx.dosage}</p>
                    <p className="text-sm text-gray-500 mt-1">Quantity: {rx.quantity}</p>
                    <p className="text-sm text-gray-500">Next Refill: {format(new Date(rx.refillDate), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-gray-400 mt-1">Refill Schedule: {rx.refillSchedule}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
