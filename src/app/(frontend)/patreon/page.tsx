import type { Metadata } from 'next'
import React from 'react'
import { PatreonSection } from '@/components/sections/PatreonSection'

export const dynamic = 'force-static'
export const revalidate = 3600

export default function PatreonPage() {
  return (
    <div className="py-24">
      <div className="container mb-12">
        <h1>Patreon</h1>
      </div>

      <PatreonSection />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Patreon',
  }
}
