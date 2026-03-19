import React from 'react'
import Link from 'next/link'

interface BreadcrumbProps {
  parent: { label: string; href: string }
  title: string
  children?: React.ReactNode
}

export function Breadcrumb({ parent, title, children }: BreadcrumbProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={parent.href}
            className="text-c-foreground/50 hover:text-c-foreground transition-colors shrink-0"
          >
            {parent.label}
          </Link>
          <span className="text-c-foreground/30">›</span>
          <span className="font-semibold truncate">{title}</span>
        </div>
        {children}
      </div>
    </div>
  )
}
