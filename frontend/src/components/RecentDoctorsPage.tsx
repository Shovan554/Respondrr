import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { getRecentDoctors } from '../lib/api'
import { Star, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react'

const RecentDoctorsPage = () => {
  const [doctors, setDoctors] = useState<any[]>([])

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await getRecentDoctors()
        setDoctors(data || [])
      } catch (error) {
        console.error('Failed to load recent doctors', error)
      }
    }
    loadDoctors()
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="patient" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      <main className="max-w-6xl mx-auto pt-32 px-6 pb-12 relative z-10">
        <header className="mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
            <ShieldCheck className="w-3 h-3" />
            Verified Responders
          </span>
          <h1 className="text-4xl font-black tracking-tight mt-4">
            Recent <span className="text-blue-500">Doctors</span>
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl text-sm font-medium leading-relaxed">
            Your recent medical responders, response stats, and quick contact options. This list stays cached for rapid re-engagement.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 hover:border-blue-500/30 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{doctor.specialty}</p>
                  <h3 className="text-2xl font-black mt-2">{doctor.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-black">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">{doctor.rating}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-300 font-medium">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  Last assisted {doctor.last_helped}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  {doctor.location}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  View Profile
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  <Phone className="w-3 h-3" />
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default RecentDoctorsPage
