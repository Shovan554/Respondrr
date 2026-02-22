import React, { useEffect, useState, useRef } from 'react'
import { Phone, PhoneOff, Maximize2 } from 'lucide-react'
import ringSound from '../assets/sounds/ring.mp3'

interface EmergencyVideoCallProps {
  emergency: any
  onAccept: () => void
  onReject: () => void
  onEnd: () => void
  isConnected: boolean
  doctorName?: string
}

export const EmergencyVideoCall: React.FC<EmergencyVideoCallProps> = ({
  emergency,
  onAccept,
  onReject,
  onEnd,
  isConnected,
  doctorName = "Medical Team"
}) => {
  const [showIncomingCall, setShowIncomingCall] = useState(!isConnected)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    console.log('[EMERGENCY_CALL] Component received emergency:', emergency)
    console.log('[EMERGENCY_CALL] video_call_id:', emergency?.video_call_id)
    console.log('[EMERGENCY_CALL] isConnected:', isConnected)
    setShowIncomingCall(!isConnected)
  }, [isConnected, emergency])

  useEffect(() => {
    const audio = audioRef.current
    if (showIncomingCall && !isConnected && audio) {
      audio.loop = true
      audio.play().catch(err => console.error('Error playing ring sound:', err))
    } else if (audio) {
      audio.pause()
      audio.currentTime = 0
    }

    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [showIncomingCall, isConnected])

  if (!emergency) return null

  if (!emergency.video_call_id) {
    console.log('[EMERGENCY_CALL] Waiting for video_call_id to be populated...')
  }

  if (showIncomingCall && !isConnected) {
    return (
      <>
        <audio ref={audioRef} src={ringSound} />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-[3rem] p-12 text-center border border-blue-500/30 shadow-2xl shadow-blue-500/20 max-w-sm">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                <Phone className="w-12 h-12 text-blue-500 animate-bounce" />
              </div>
              
              <h2 className="text-3xl font-black mb-3 text-white">
                Emergency Call Incoming
              </h2>
              <p className="text-blue-300 font-bold text-lg mb-2">
                {doctorName}
              </p>
              <p className="text-slate-400 text-sm">
                Medical team is responding to your emergency
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  console.log('[EMERGENCY_CALL] Accept clicked, video_call_id:', emergency?.video_call_id)
                  onAccept()
                  setShowIncomingCall(false)
                }}
                disabled={!emergency?.video_call_id}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 disabled:from-emerald-900 disabled:to-emerald-950 text-white rounded-2xl font-black hover:shadow-lg hover:shadow-emerald-500/50 disabled:hover:shadow-none transition-all active:scale-95 disabled:cursor-not-allowed"
              >
                <Phone className="w-5 h-5" />
                {emergency?.video_call_id ? 'Accept' : 'Connecting...'}
              </button>
              
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-red-600/20 text-red-400 rounded-2xl font-black border border-red-500/30 hover:border-red-500/50 transition-all active:scale-95"
              >
                <PhoneOff className="w-5 h-5" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    )
  }

  if (isConnected) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950">
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 bg-black rounded-none relative">
            <iframe
              src={emergency.room_url}
              allow="camera; microphone; display-capture"
              className="w-full h-full border-0"
            />
          </div>

          <div className="bg-gradient-to-t from-slate-900 to-slate-800 border-t border-white/10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-white font-bold">Emergency Call Active</span>
            </div>

            <button
              onClick={onEnd}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-red-600 text-white rounded-2xl font-black hover:scale-105 transition-all active:scale-95 shadow-lg shadow-red-600/50"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
