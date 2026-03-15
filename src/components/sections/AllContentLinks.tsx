import React from 'react'
import Link from 'next/link'

const links = [
  { href: '/podcast', label: 'All Episodes' },
  { href: '/artikels', label: 'All Articles' },
  { href: '/patreon', label: 'Patreon' },
]

export function AllContentLinks() {
  return (
    <section className="container py-16">
      <div className="flex flex-wrap gap-4">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-c-foreground/10 px-6 py-3 text-sm font-medium transition-colors hover:bg-c-foreground/5"
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  )
}
