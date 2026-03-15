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
      className="block rounded-lg border border-c-accent/40 overflow-hidden"
    >
      {image ? (
        <Media resource={image} imgClassName="w-full aspect-video object-cover" size="33vw" />
      ) : resolvedSrc ? (
        <img src={resolvedSrc} alt="" className="w-full aspect-video object-cover" />
      ) : null}
      <div className="p-3">
        <h3 className="text-sm font-medium text-c-accent line-clamp-2">{title}</h3>
        {meta && <p className="text-xs text-c-foreground/50 mt-1 italic">{meta}</p>}
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
