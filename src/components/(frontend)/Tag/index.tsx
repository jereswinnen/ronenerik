import React from 'react'

export function Tag({ label }: { label: string }) {
  return (
    <span className="self-start text-sm font-semibold border border-c-accent rounded-full px-3 py-1 group-hover:border-white">
      {label}
    </span>
  )
}
