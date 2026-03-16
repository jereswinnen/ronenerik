'use client'

import React from 'react'
import { motion, type Variants } from 'motion/react'

interface ContentGridProps {
  children: React.ReactNode
  emptyMessage?: string
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function ContentGrid({ children, emptyMessage = 'Geen items gevonden.' }: ContentGridProps) {
  const items = React.Children.toArray(children)

  if (items.length === 0) {
    return (
      <p className="text-c-foreground/60 py-12 text-center">{emptyMessage}</p>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
