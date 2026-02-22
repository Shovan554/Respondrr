import React, { useMemo, useState } from 'react'
import { PhoneOff, Video, MicOff, Volume2, Activity, MapPin, AlertTriangle, Eye, Check } from 'lucide-react'

interface VideoCallOverlayProps {
  activeCall: any | null
  onClose: () => void
}

const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({ activeCall, onClose }) => {
  if (!activeCall) return null

  const protocols = useMemo(() => ({
    cardiac: {
      label: 'Cardiac Arrest',
      cues: [
        { title: 'Not breathing or gasping', note: 'No chest rise or irregular breaths.' },
        { title: 'Unresponsive', note: 'No reaction to voice or touch.' },
        { title: 'Blue lips or nails', note: 'Signs of low oxygen.' }
      ],
      steps: [
        'Check scene safety and responsiveness.',
        'Call emergency services / activate EMS.',
        'Start CPR: 30 compressions, 2 breaths.',
        'Use AED immediately when available.'
      ],
      prompts: [
        '“Help is on the way. I am starting CPR.”',
        '“Count compressions with me: 1–30.”'
      ],
      actions: ['Call EMS', 'Request AED', 'Start CPR Timer']
    },
    seizure: {
      label: 'Seizure',
      cues: [
        { title: 'Rhythmic jerking', note: 'Arms/legs shaking.' },
        { title: 'Loss of awareness', note: 'Unresponsive during event.' },
        { title: 'Foaming or drooling', note: 'Common seizure sign.' }
      ],
      steps: [
        'Clear area and protect the head.',
        'Do not restrain or place objects in mouth.',
        'Time the seizure and observe breathing.',
        'Recovery position once convulsions stop.'
      ],
      prompts: [
        '“You are safe. We are here with you.”',
        '“We will monitor your breathing.”'
      ],
      actions: ['Start Timer', 'Clear Area', 'Recovery Position']
    },
    bleeding: {
      label: 'Severe Bleeding',
      cues: [
        { title: 'Rapid bleeding', note: 'Soaking cloths quickly.' },
        { title: 'Pale or cold skin', note: 'Possible shock.' },
        { title: 'Weak pulse', note: 'Signs of blood loss.' }
      ],
      steps: [
        'Apply firm pressure to the wound.',
        'Use clean cloth or gauze to pack wound.',
        'Elevate limb if possible.',
        'Call EMS if bleeding does not stop.'
      ],
      prompts: [
        '“Keep pressure on the wound.”',
        '“We are controlling the bleeding.”'
      ],
      actions: ['Apply Pressure', 'Pack Wound', 'Call EMS']
    },
    choking: {
      label: 'Choking',
      cues: [
        { title: 'Hands to throat', note: 'Universal choking sign.' },
        { title: 'No sound / cough', note: 'Airway is blocked.' },
        { title: 'Struggling to breathe', note: 'Immediate danger.' }
      ],
      steps: [
        'Ask “Are you choking?”',
        'Give 5 back blows.',
        'Give 5 abdominal thrusts.',
        'Repeat until object is expelled.'
      ],
      prompts: [
        '“I am going to help you breathe.”',
        '“Cough if you can.”'
      ],
      actions: ['Back Blows', 'Abdominal Thrusts', 'Call EMS']
    },
    unconscious: {
      label: 'Unconscious',
      cues: [
        { title: 'No response', note: 'Does not wake to voice.' },
        { title: 'Slow or shallow breath', note: 'Monitor airway.' },
        { title: 'Possible injury', note: 'Check for trauma.' }
      ],
      steps: [
        'Check breathing and pulse.',
        'Open airway and monitor.',
        'Recovery position if breathing.',
        'Call EMS if no response.'
      ],
      prompts: [
        '“Stay with me. Help is coming.”',
        '“Keep the airway open.”'
      ],
      actions: ['Check Breathing', 'Recovery Position', 'Call EMS']
    }
  }), [])

  type ProtocolKey = keyof typeof protocols
  const protocolKeys = Object.keys(protocols) as ProtocolKey[]
  const [protocolKey, setProtocolKey] = useState<ProtocolKey>('cardiac')
  const [completedSteps, setCompletedSteps] = useState<Record<ProtocolKey, number[]>>(
    () => protocolKeys.reduce((acc, key) => ({ ...acc, [key]: [] }), {} as Record<ProtocolKey, number[]>)
  )

  const protocol = protocols[protocolKey]
  const toggleStep = (key: ProtocolKey, index: number) => {
    setCompletedSteps((prev) => {
      const current = new Set(prev[key])
      if (current.has(index)) current.delete(index)
      else current.add(index)
      return { ...prev, [key]: Array.from(current) }
    })
  }

  const name = activeCall.name || 'Unknown Patient'
  const status = activeCall.status || 'connecting'
  const heartRate = activeCall.heart_rate ?? '--'
  const lastCheckIn = activeCall.last_check_in_min ?? '--'
  const location = activeCall.location || activeCall.zone || 'Zone A'

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-slate-900/70 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Video Call</p>
            <h3 className="text-2xl font-black mt-2">{name}</h3>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              <Video className="w-3 h-3" />
              {status}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <PhoneOff className="w-3 h-3" />
            End Call
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.25),_transparent_60%)]" />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80">
                Live Feed Placeholder
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vitals Snapshot</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300 font-medium">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-4 h-4" />
                    Heart Rate
                  </span>
                  <span className="font-black text-white">{heartRate} BPM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-4 h-4" />
                    Last Check-In
                  </span>
                  <span className="font-black text-white">{lastCheckIn} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    Location
                  </span>
                  <span className="font-black text-white">{location}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quick Controls</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  <MicOff className="w-3 h-3" />
                  Mute
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  <Volume2 className="w-3 h-3" />
                  Speaker
                </button>
                <button className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  <Video className="w-3 h-3" />
                  Start Recording
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guided Response</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Live Protocol</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {protocolKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => setProtocolKey(key)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      protocolKey === key
                        ? 'bg-blue-600/30 text-blue-100 border-blue-500/50'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-blue-500/30 hover:text-white'
                    }`}
                  >
                    {protocols[key].label}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                <div className="bg-slate-950/40 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Eye className="w-3 h-3" />
                    Visual Cues
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-300 font-medium">
                    {protocol.cues.map((cue, index) => (
                      <div key={cue.title} className="flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-black text-white">{cue.title}</p>
                          <p className="text-slate-400">{cue.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Activity className="w-3 h-3" />
                    Step-by-Step Aid
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-300 font-medium">
                    {protocol.steps.map((step, index) => {
                      const isDone = completedSteps[protocolKey]?.includes(index)
                      return (
                        <button
                          key={step}
                          onClick={() => toggleStep(protocolKey, index)}
                          className={`w-full flex items-start gap-2 text-left rounded-lg border px-2 py-2 transition-all ${
                            isDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-white/5 border-white/10 hover:border-blue-500/30'
                          }`}
                        >
                          <div className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${isDone ? 'bg-emerald-500/20 border-emerald-400/40' : 'border-white/10'}`}>
                            {isDone && <Check className="w-3 h-3 text-emerald-300" />}
                          </div>
                          <span>{step}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Video className="w-3 h-3" />
                    Spoken Prompts
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-300 font-medium">
                    {protocol.prompts.map((prompt) => (
                      <div key={prompt} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        {prompt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <AlertTriangle className="w-3 h-3" />
                    Quick Actions
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {protocol.actions.map((action) => (
                      <button
                        key={action}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCallOverlay
