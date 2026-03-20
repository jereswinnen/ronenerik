'use client'

import React from 'react'
import { motion } from 'motion/react'

interface ShimmerCardProps {
  children: React.ReactNode
  className?: string
}

export function ShimmerCard({ children, className = '' }: ShimmerCardProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="pointer-events-none absolute -inset-full"
        style={{
          background: 'linear-gradient(-45deg, transparent 40%, white 50%, transparent 60%)',
        }}
        animate={{
          x: ['-100%', '200%'],
          y: ['-100%', '200%'],
        }}
        transition={{
          duration: 2.65,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 3.6,
        }}
      />
    </div>
  )
}
