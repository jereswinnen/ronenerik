'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'motion/react'

interface ContentGridProps {
  children: React.ReactNode
  emptyMessage?: string
}

function GridItem({
  children,
  index,
  isHovered,
  isDimmed,
  onHoverStart,
  onHoverEnd,
}: {
  children: React.ReactNode
  index: number
  isHovered: boolean
  isDimmed: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [hasEntered, setHasEntered] = useState(false)

  // Mark entrance as done after the animation would have completed
  useEffect(() => {
    if (inView && !hasEntered) {
      const timeout = setTimeout(() => setHasEntered(true), index * 60 + 600)
      return () => clearTimeout(timeout)
    }
  }, [inView, hasEntered, index])

  const entranceDelay = !hasEntered ? index * 0.06 : 0

  return (
    <motion.div
      ref={ref}
      className="h-full"
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{
        opacity: !inView ? 0 : isDimmed ? 0.5 : 1,
        y: inView ? 0 : 12,
        filter: inView ? 'blur(0px)' : 'blur(4px)',
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        y: { duration: 0.5, delay: entranceDelay, ease: [0.16, 1, 0.3, 1] },
        filter: { duration: 0.5, delay: entranceDelay },
        opacity: { duration: 0.5, delay: entranceDelay },
        scale: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      style={{ zIndex: isHovered ? 10 : 0 }}
    >
      {children}
    </motion.div>
  )
}

export function ContentGrid({ children, emptyMessage = 'Geen items gevonden.' }: ContentGridProps) {
  const items = React.Children.toArray(children)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (items.length === 0) {
    return <p className="text-c-foreground/60 py-12 text-center">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
      {items.map((child, index) => (
        <GridItem
          key={index}
          index={index}
          isHovered={hoveredIndex === index}
          isDimmed={hoveredIndex !== null && hoveredIndex !== index}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
        >
          {child}
        </GridItem>
      ))}
    </div>
  )
}
