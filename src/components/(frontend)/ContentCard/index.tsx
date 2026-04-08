import React from 'react'
import Link from 'next/link'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { Tag } from '@/components/(frontend)/Tag'

type ContentCardProps = {
  href: string
  title: string
  image?: MediaType | null
  /** External image URL (e.g. RSS or YouTube thumbnail) */
  imageSrc?: string | null
  meta?: string
  /** Tag label shown above the title (e.g. "Podcast", "Artikel") */
  tag?: string
  /** Horizontal layout: image left, content right */
  horizontal?: boolean
  /** Use podcast-style rounding (bottom-left rounded, top-right square) */
  podcastCorners?: boolean
  /** Use larger title (h5 instead of h6) */
  isLarge?: boolean
  /** Short text excerpt shown below the title */
  excerpt?: string
  onClick?: () => void
  className?: string
}

export function ContentCard({
  href,
  title,
  image,
  imageSrc,
  meta,
  tag,
  horizontal,
  podcastCorners,
  isLarge,
  excerpt,
  onClick,
  className = '',
}: ContentCardProps) {
  const resolvedSrc = image ? null : imageSrc
  const cornerClass = podcastCorners
    ? 'rounded-[20px] rounded-tr-none'
    : 'rounded-[20px] rounded-bl-none'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex ${horizontal ? 'flex-row' : 'flex-col'} gap-4 ${cornerClass} border border-c-accent overflow-hidden p-4 ${className}`}
    >
      {/* Hover background fill */}
      <span className="absolute inset-0 bg-c-accent scale-0 origin-bottom-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100" />

      {/* Image */}
      <div className={`relative overflow-hidden rounded-lg ${horizontal ? 'w-1/2 shrink-0' : ''}`}>
        {image ? (
          <Media
            resource={image}
            imgClassName="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
            size="33vw"
          />
        ) : resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt=""
            className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>

      {/* Content */}
      <div className="relative flex flex-col gap-2 text-c-accent transition-all duration-500 ease-in-out group-hover:text-white">
        {tag && <Tag label={tag} />}
        {isLarge ? (
          <h5 className="font-medium leading-tight line-clamp-2">{title}</h5>
        ) : (
          <h6 className="font-medium leading-tight line-clamp-2">{title}</h6>
        )}
        {excerpt && <p className="text-sm line-clamp-3">{excerpt}</p>}
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

/** Check whether any populated author has the guest role */
export function isCommunityPost(
  populatedAuthors?: { role?: string | null }[] | null,
): boolean {
  return !!populatedAuthors?.some((a) => a.role === 'guest')
}

export function youtubeMaxRes(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
}
