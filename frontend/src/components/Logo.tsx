import React from 'react'
import Lottie from 'lottie-react'
import logoAnimation from '../assets/animation/logo.json'

interface LogoProps {
  className?: string
  size?: number
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 384 }) => {
  return (
    <div className={`flex items-center -ml-32 ${className}`}>
      <div style={{ width: size, height: size }}>
        <Lottie 
          animationData={logoAnimation} 
          loop={true} 
          className="w-full h-full"
        />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tighter ml-2">Respondr</h1>
    </div>
  )
}

export default Logo
