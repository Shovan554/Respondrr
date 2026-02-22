import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { getActiveCases, getDispatchAlert } from '../lib/api'
import { Activity, AlertTriangle, HeartPulse, MapPin, Radio, Video } from 'lucide-react'
import VideoCallOverlay from './VideoCallOverlay'

const VitalsMonitorPage = () => {
  const [activeCases, setActiveCases] = useState<any[]>([])
  const [dispatchAlert, setDispatchAlert] = useState<any>(null)
  const [activeCall, setActiveCall] = useState<any | null>(null)

  useEffect(() => {
    const loadMonitor = async () => {
      try {
        const [casesData, dispatchData] = await Promise.all([
          getActiveCases(),
          getDispatchAlert()
        ])
        setActiveCases(casesData || [])
        setDispatchAlert(dispatchData)
      } catch (error) {
        console.error('Failed to load vitals monitor', error)
      }
    }
    loadMonitor()
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="respondr" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      <main className="max-w-7xl mx-auto pt-32 px-6 pb-12 relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
              <Radio className="w-3 h-3 animate-pulse" />
              Live Vitals Monitor
            </div>
            <h1 className="text-4xl font-black tracking-tight mt-4">
              Network <span className="text-blue-500">Telemetry</span>
            </h1>
            <p className="text-slate-400 mt-3 max-w-2xl text-sm font-medium leading-relaxed">
              Real-time biometrics streaming from connected wearables. Prioritized cases appear at the top of the queue.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-6 shadow-2xl shadow-blue-900/20 max-w-sm w-full">
            <div className="flex items-center gap-3 text-blue-100 text-xs font-black uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              Dispatch Alert
            </div>
            <h3 className="text-2xl font-black mt-4">{dispatchAlert?.title || 'New Dispatch'}</h3>
            <p className="text-blue-100/70 text-sm font-medium mt-2 leading-relaxed">
              {dispatchAlert?.description || 'Level 2 emergency detected in Zone A. Immediate response required.'}
            </p>
            <button className="mt-6 w-full py-3 bg-white text-blue-900 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">
              Accept Dispatch
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeCases.map((caseItem) => (
            <div key={caseItem.id} className="bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{caseItem.status}</p>
                  <h3 className="text-2xl font-black mt-2">{caseItem.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-red-400 font-black">
                  <HeartPulse className="w-4 h-4" />
                  <span className="text-sm">{caseItem.heart_rate} BPM</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Last check-in {caseItem.last_check_in_min} mins
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Zone {caseItem.zone || 'A'}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Open Live Feed
                </button>
                <button
                  onClick={() => setActiveCall(caseItem)}
                  className="py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                >
                  <Video className="w-3 h-3" />
                  Video Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <VideoCallOverlay activeCall={activeCall} onClose={() => setActiveCall(null)} />
    </div>
  )
}

export default VitalsMonitorPage
