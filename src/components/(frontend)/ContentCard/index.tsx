import React from 'react'
import Link from 'next/link'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

type ContentCardProps = {
  href: string
  title: string
  image?: MediaType | null
  /** External image URL (e.g. RSS or YouTube thumbnail) */
  imageSrc?: string | null
  meta?: string
  onClick?: () => void
}

export function ContentCard({ href, title, image, imageSrc, meta, onClick }: ContentCardProps) {
  const resolvedSrc = image ? null : imageSrc

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative flex flex-col gap-4 rounded-[20px] rounded-bl-none border border-c-accent overflow-hidden p-4"
    >
      {/* Hover background fill */}
      <span className="absolute inset-0 bg-c-accent/10 scale-y-0 origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />

      {/* Image */}
      <div className="relative overflow-hidden rounded-lg">
        {image ? (
          <Media
            resource={image}
            imgClassName="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
            size="33vw"
          />
        ) : resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt=""
            className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
      </div>

      {/* Content */}
      <div className="relative flex flex-col gap-2 text-c-accent">
        <h3 className="text-lg font-medium leading-tight line-clamp-2">{title}</h3>
        {meta && <p className="text-sm italic">{meta}</p>}
      </div>
    </Link>
  )
}

// --- Helpers to format meta strings ---

export function formatUploadDate(dateStr: string): string {
  return `geüpload op: ${new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`
}

export function formatAuthor(name: string): string {
  return `geschreven door: ${name}`
}

export function youtubeMaxRes(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
}
