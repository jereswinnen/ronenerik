'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

export function Parallax({
  children,
  className = 'relative overflow-hidden',
  offset = ['start start', 'end start'] as const,
  range = ['0%', '10%'] as const,
}: {
  children: React.ReactNode
  className?: string
  offset?: [string, string]
  range?: [string, string]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: offset as any })

  const y = useTransform(scrollYProgress, [0, 1], range)

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
