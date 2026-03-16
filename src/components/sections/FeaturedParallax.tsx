'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

export function FeaturedParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div className="-mb-[10%]" style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}
