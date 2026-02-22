import React, { useState } from 'react'
import { Shield, Mail, Lock, Heart, User, MapPin, Phone, FileText, Loader2, Globe } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [country, setCountry] = useState('')
  const [isRespondrTab, setIsRespondrTab] = useState(false)
  const [licenseNumber, setLicenseNumber] = useState('')
  const [certification, setCertification] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let finalRole = 'patient'
    if (isRespondrTab) {
      if (licenseNumber.trim()) {
        finalRole = 'doctor'
      } else if (certification.trim()) {
        finalRole = 'volunteer'
      } else {
        setError('Please provide either a Medical License or a Certification.')
        setLoading(false)
        return
      }
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: finalRole
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,
              full_name: fullName,
              phone,
              address,
              country,
              role: finalRole,
              license_number: finalRole === 'doctor' ? licenseNumber : null,
              certification: finalRole === 'volunteer' ? certification : null,
              is_verified: false
            }
          ])

        if (profileError) throw profileError
        
        alert('Registration successful! Please check your email for verification.')
        navigate('/login')
      }
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes('rate limit')) {
        setError('Email rate limit exceeded. Please wait a few minutes before trying again.')
      } else {
        setError(err.message || 'An error occurred during registration')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-8 flex justify-center">
          <Logo size={180} />
        </div>

        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex border-b border-white/10 p-1.5">
            <button
              type="button"
              onClick={() => setIsRespondrTab(false)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                !isRespondrTab ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setIsRespondrTab(true)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                isRespondrTab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              Respondr
            </button>
          </div>

          <form onSubmit={handleRegister} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Legal Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm placeholder:text-slate-800"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">{isRespondrTab ? 'Email Identity' : 'Patient Email'}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm placeholder:text-slate-800"
                    placeholder={isRespondrTab ? "name@agency.com" : "patient@example.com"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Contact Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm placeholder:text-slate-800"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Residential Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm placeholder:text-slate-800"
                    placeholder="123 Sector Parkway"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Territory</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm placeholder:text-slate-800"
                    placeholder="United States"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">{isRespondrTab ? 'Secure Access Key' : 'Create Password'}</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm placeholder:text-slate-800"
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {isRespondrTab && (
                <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Medical License ID (Doctors)</label>
                    <div className="relative group">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => {
                          setLicenseNumber(e.target.value)
                          if (e.target.value) setCertification('')
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-blue-100 text-sm placeholder:text-blue-900"
                        placeholder="MD-XXXX-XXXX"
                      />
                    </div>
                  </div>
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-slate-600 text-[8px] font-black uppercase tracking-[0.3em]">Identity Branch</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Verification Token (Volunteers)</label>
                    <div className="relative group">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="text"
                        value={certification}
                        onChange={(e) => {
                          setCertification(e.target.value)
                          if (e.target.value) setLicenseNumber('')
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-indigo-100 text-sm placeholder:text-indigo-900"
                        placeholder="CERT-CERT-CERT"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-3 ${
                loading ? 'opacity-50 cursor-not-allowed bg-slate-800' : 
                isRespondrTab ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Initialize {isRespondrTab ? 'Respondr' : 'Patient'} Core</span>
              )}
            </button>
          </form>

          <div className="p-8 text-center border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <p className="text-slate-400 font-medium text-sm">
              {isRespondrTab ? 'Existing operator found?' : 'Existing patient found?'}{' '}
              <button onClick={() => navigate('/login')} className="font-black text-blue-500 hover:text-blue-400 underline decoration-blue-500/30 underline-offset-8">
                Access Console
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const AlertTriangle = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

export default RegisterPage
