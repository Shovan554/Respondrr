import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { supabase } from '../lib/supabase'
import { Activity, Heart, Clock, UserCheck, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react'
import { syncHealthData } from '../lib/HealthService'

const PatientDashboard = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [latestVitals, setLatestVitals] = useState({
    heartRate: '--',
    bloodPressure: '120/80',
    status: 'Optimal',
    oxygen: '98%'
  })

  const fetchProfileAndVitals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Fetch latest heart rate
      const { data: hrData } = await supabase
        .from('health_realtime')
        .select('value')
        .eq('user_id', user.id)
        .eq('metric_name', 'heart_rate')
        .order('timestamp', { ascending: false })
        .limit(1)
      
      if (hrData && hrData.length > 0) {
        setLatestVitals(prev => ({ ...prev, heartRate: Math.round(hrData[0].value).toString() }))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfileAndVitals()
    
    // Set up realtime subscription for vitals
    const subscription = supabase
      .channel('vitals-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'health_realtime' 
      }, () => {
        fetchProfileAndVitals()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    // Mock health data for demo purposes since we're in a browser
    const mockMetrics = [
      {
        name: 'heart_rate',
        units: 'count/min',
        data: [
          { value: 72 + Math.floor(Math.random() * 10), timestamp: new Date().toISOString() }
        ]
      },
      {
        name: 'step_count',
        units: 'count',
        data: [
          { qty: 1250, date: new Date().toISOString() }
        ]
      }
    ]
    
    await syncHealthData(mockMetrics)
    await fetchProfileAndVitals()
    setSyncing(false)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="patient" />
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      <main className="max-w-7xl mx-auto pt-32 px-6 pb-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              Hello, <span className="text-blue-500">{profile?.full_name?.split(' ')[0] || 'Patient'}</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Your biometric systems are nominal.</p>
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest backdrop-blur-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Health Data'}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Heart Rate */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
              <span className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Heart Rate</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tabular-nums">{latestVitals.heartRate}</span>
              <span className="text-slate-500 font-black text-sm">BPM</span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <span className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Blood Pressure</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tabular-nums">{latestVitals.bloodPressure}</span>
              <span className="text-slate-500 font-black text-sm">SYS/DIA</span>
            </div>
          </div>

          {/* Oxygen Level */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">SpO2 Level</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tabular-nums">{latestVitals.oxygen}</span>
              <span className="text-slate-500 font-black text-sm">Sat</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">System Status</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-400 uppercase tracking-tighter italic leading-none">{latestVitals.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/30 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight">Health History</h3>
              <button className="text-blue-500 text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group">
                  <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-600 text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                    0{i}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-white text-lg tracking-tight mb-0.5">Weekly Health Analysis</h4>
                    <p className="text-slate-500 text-xs font-bold">Report generated by Respondr AI</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-black text-white text-sm">Oct {24-i}</span>
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Reviewed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-red-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <AlertTriangle className="w-16 h-16 rotate-12" />
              </div>
              <div className="relative">
                <h3 className="text-2xl font-black mb-4 tracking-tight leading-none">Emergency SOS</h3>
                <p className="text-red-100 text-sm font-medium leading-relaxed mb-6">Instant connection to trauma centers and rapid response teams.</p>
                <button className="w-full py-4 bg-white text-red-600 rounded-xl font-black text-lg hover:scale-105 transition-all active:scale-95 shadow-xl shadow-black/20">
                  ACTIVATE SOS
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5">
              <h3 className="text-lg font-black mb-4">Upcoming</h3>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-sm text-white">Follow-up Call</p>
                  <p className="text-slate-500 text-xs font-bold">Tomorrow, 10:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PatientDashboard
