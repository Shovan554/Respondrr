import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { Loader2, CheckCircle, AlertTriangle, Activity } from 'lucide-react'

interface Alert {
  id: number
  patient_id: string
  patient_email: string
  title: string
  message: string
  alert_type: string
  severity: string
  status: string
  acknowledged_by?: string
  acknowledged_at?: string
  metadata?: any
  created_at: string
  updated_at: string
}

interface PatientInfo {
  id: string
  full_name: string
  email: string
}

const DoctorAlertsPage = () => {
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [patients, setPatients] = useState<Record<string, PatientInfo>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchAlerts()
      setLoading(false)
    }
    init()
  }, [])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[DOCTOR_ALERTS_PAGE] Error fetching alerts:', error)
        return
      }

      setAlerts(data || [])
    } catch (e) {
      console.error('[DOCTOR_ALERTS_PAGE] Failed to fetch alerts', e)
    }
  }

  const handleAcknowledgeAlert = async (alertId: number) => {
    setActionLoading(`acknowledge-${alertId}`)
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) {
        console.error('Error acknowledging alert:', error)
        return
      }

      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (e) {
      console.error('Failed to acknowledge alert', e)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Navbar role="doctor" />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="doctor" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      <main className="max-w-4xl mx-auto pt-32 px-6 pb-12 relative z-10">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h1 className="text-3xl font-black tracking-tight">Alerts</h1>
          </div>
          <p className="text-slate-400 font-medium">Review and acknowledge all alerts</p>
        </div>

        {alerts.filter(a => a.status === 'open').length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-2">No Alerts</h3>
            <p className="text-slate-400 font-medium">No alerts at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.filter(a => a.status === 'open').map((alert) => (
              <div
                key={alert.id}
                className={`rounded-[2rem] border overflow-hidden shadow-2xl p-6 hover:border-white/20 transition-all ${
                  alert.severity === 'critical'
                    ? 'bg-red-900/20 border-red-500/30'
                    : alert.severity === 'warning'
                    ? 'bg-orange-900/20 border-orange-500/30'
                    : 'bg-slate-800/50 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      <Activity className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-white">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                          alert.severity === 'critical' ? 'bg-red-500/30 text-red-200' :
                          alert.severity === 'warning' ? 'bg-orange-500/30 text-orange-200' :
                          'bg-blue-500/30 text-blue-200'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                          alert.alert_type === 'health' ? 'bg-green-500/30 text-green-200' :
                          alert.alert_type === 'appointment' ? 'bg-purple-500/30 text-purple-200' :
                          'bg-slate-500/30 text-slate-200'
                        }`}>
                          {alert.alert_type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        Patient: <span className="text-slate-300 font-semibold">{alert.patient_email}</span>
                      </p>
                      <p className="text-sm text-slate-300 mb-2">{alert.message}</p>
                      <p className="text-xs text-slate-500">Created: {new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {alert.status !== 'acknowledged' && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      disabled={actionLoading?.includes(`acknowledge-${alert.id}`)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 text-white font-black px-6 py-3 rounded-xl transition-all shadow-xl shadow-green-900/20 active:scale-95 text-xs uppercase tracking-widest flex-shrink-0 ml-4"
                    >
                      {actionLoading?.includes(`acknowledge-${alert.id}`) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default DoctorAlertsPage
