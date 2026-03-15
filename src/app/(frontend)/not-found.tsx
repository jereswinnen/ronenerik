import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">This page could not be found.</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-c-accent px-4 py-2 text-sm font-medium text-c-background transition-opacity hover:opacity-80"
      >
        Go home
      </Link>
    </div>
  )
}
