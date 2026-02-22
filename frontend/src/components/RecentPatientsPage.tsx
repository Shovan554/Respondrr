import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { getRecentPatients } from '../lib/api'
import { MapPin, Activity, Shield, Clock } from 'lucide-react'

const RecentPatientsPage = () => {
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await getRecentPatients()
        setPatients(data || [])
      } catch (error) {
        console.error('Failed to load recent patients', error)
      }
    }
    loadPatients()
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="respondr" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      <main className="max-w-6xl mx-auto pt-32 px-6 pb-12 relative z-10">
        <header className="mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
            <Shield className="w-3 h-3" />
            Respondr Network
          </span>
          <h1 className="text-4xl font-black tracking-tight mt-4">
            Recent <span className="text-blue-500">Patients</span>
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl text-sm font-medium leading-relaxed">
            Follow-up history for your last engagements. Use quick actions to reopen a case, verify vitals, or schedule a check-in.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{patient.status}</p>
                  <h3 className="text-2xl font-black mt-2">{patient.name}</h3>
                </div>
                <div className="text-emerald-400 font-black text-sm">Age {patient.age}</div>
              </div>

              <div className="space-y-3 text-sm text-slate-300 font-medium">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  Last event {patient.last_event}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  {patient.location}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  View Case
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  <Activity className="w-3 h-3" />
                  Monitor
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default RecentPatientsPage
