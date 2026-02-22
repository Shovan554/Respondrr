import Logo from './Logo'

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-950 flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      
      <div className="relative flex flex-col items-center">
        <Logo size={350} className="mb-6" />
        <div className="flex flex-col items-center gap-3">
          <p className="text-blue-200/60 animate-pulse text-lg font-black uppercase tracking-[0.2em]">Respondr Systems</p>
          <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
