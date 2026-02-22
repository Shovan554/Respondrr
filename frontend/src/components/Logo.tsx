import React from 'react'
import Lottie from 'lottie-react'
import logoAnimation from '../assets/animation/logo.json'

interface LogoProps {
  className?: string
  size?: number
  alertCount?: number
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 384, alertCount = 0 }) => {
  return (
    <div className={`flex items-center -ml-32 relative ${className}`}>
      <div style={{ width: size, height: size }} className="relative">
        <Lottie 
          animationData={logoAnimation} 
          loop={true} 
          className="w-full h-full"
        />
        {alertCount > 0 && (
          <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-black border-2 border-slate-900 shadow-lg">
            {alertCount > 99 ? '99+' : alertCount}
          </div>
        )}
      </div>
      <h1 className="text-4xl font-black text-white tracking-tighter ml-2">Respondr</h1>
    </div>
  )
}

export default Logo
