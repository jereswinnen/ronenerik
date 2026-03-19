'use client'

import React, { useState, useCallback, type FC, type SVGProps } from 'react'
import IconLink from '../../../../public/IconLink.svg'
import IconX from '../../../../public/IconX.svg'
import IconBlueSky from '../../../../public/IconBlueSky.svg'
import IconInstagram from '../../../../public/IconInstagram.svg'
import IconTikTok from '../../../../public/IconTikTok.svg'
import IconYouTube from '../../../../public/IconYouTube.svg'
import IconSpotify from '../../../../public/IconSpotify.svg'

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

type ShareItem = {
  label: string
  icon: FC<SVGProps<SVGSVGElement>>
  href?: string
  onClick?: () => void
}

interface ShareIconsProps {
  url: string
  title?: string
  /** 'article' shows social share links, 'podcast' shows platform links */
  variant?: 'article' | 'podcast'
  /** External link overrides for podcast variant */
  youtubeUrl?: string | null
  spotifyUrl?: string | null
}

export function ShareIcons({
  url,
  title,
  variant = 'article',
  youtubeUrl,
  spotifyUrl,
}: ShareIconsProps) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title || '')

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
    }
  }, [url])

  const articleItems: ShareItem[] = [
    { label: 'Kopieer link', icon: IconLink, onClick: copyLink },
    {
      label: 'Deel op X',
      icon: IconX,
      href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: 'Deel op BlueSky',
      icon: IconBlueSky,
      href: `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`,
    },
    { label: 'Instagram', icon: IconInstagram },
    { label: 'TikTok', icon: IconTikTok },
  ]

  const podcastItems: ShareItem[] = [
    { label: 'Kopieer link', icon: IconLink, onClick: copyLink },
    ...(youtubeUrl ? [{ label: 'YouTube', icon: IconYouTube, href: youtubeUrl }] : []),
    ...(spotifyUrl ? [{ label: 'Spotify', icon: IconSpotify, href: spotifyUrl }] : []),
  ]

  const shares = variant === 'podcast' ? podcastItems : articleItems

  return (
    <div className="flex *:bg-c-foreground/5 *:text-c-foreground *:transition-all *:ease-in-out *:duration-300 *:hover:bg-c-foreground *:hover:text-c-background *:p-2 *:odd:rounded-full [&_svg]:size-8 [&_svg]:shrink-0">
      {shares.map(({ label, icon: Icon, href, onClick }) => {
        const isCopyButton = label === 'Kopieer link'
        const DisplayIcon = isCopyButton && copied ? CheckIcon : Icon

        return href ? (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <DisplayIcon />
          </a>
        ) : (
          <button
            key={label}
            onClick={onClick || (isCopyButton ? copyLink : undefined)}
            aria-label={label}
            className="cursor-pointer"
          >
            <DisplayIcon className={isCopyButton && copied ? 'text-green-400' : ''} />
          </button>
        )
      })}
    </div>
  )
}
