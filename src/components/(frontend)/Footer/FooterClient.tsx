'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import type { Footer as FooterType, SiteSetting } from '@/payload-types'
import { CMSLink } from '@/components/Link'

import IconDiscord from '../../../../public/IconDiscord.svg'
import IconYouTube from '../../../../public/IconYouTube.svg'
import IconSpotify from '../../../../public/IconSpotify.svg'
import IconInstagram from '../../../../public/IconInstagram.svg'
import IconTikTok from '../../../../public/IconTikTok.svg'

const socialIcons = [
  { key: 'discord', icon: IconDiscord, label: 'Discord' },
  { key: 'youtube', icon: IconYouTube, label: 'YouTube' },
  { key: 'spotify', icon: IconSpotify, label: 'Spotify' },
  { key: 'instagram', icon: IconInstagram, label: 'Instagram' },
  { key: 'tiktok', icon: IconTikTok, label: 'TikTok' },
] as const

interface FooterClientProps {
  data: FooterType
  siteSettings: SiteSetting
  className?: string
}

export function FooterClient({ data, siteSettings, className }: FooterClientProps) {
  const navItems = data?.navItems || []
  const socials = siteSettings?.socials
  const externalLinks = siteSettings?.externalLinks

  const socialLinks: {
    href: string
    icon: React.FC<React.SVGProps<SVGSVGElement>>
    label: string
  }[] = []
  for (const s of socialIcons) {
    const href =
      s.key === 'youtube'
        ? externalLinks?.youtubeChannelUrl
        : s.key === 'discord'
          ? socials?.discord
          : s.key === 'spotify'
            ? socials?.spotify
            : s.key === 'instagram'
              ? socials?.instagram
              : s.key === 'tiktok'
                ? socials?.tiktok
                : undefined
    if (href) socialLinks.push({ href, icon: s.icon, label: s.label })
  }

  return (
    <footer className={`bg-c-darkest ${className ?? ''}`}>
      <div className="container py-8 md:py-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Left: nav links */}
        <div className="flex flex-col gap-4">
          <p className="uppercase text-sm italic text-c-foreground/50">De Ron en Erik Podcast</p>
          <nav className="flex flex-wrap gap-x-6 *:font-semibold *:hover:text-c-foreground/60 *:last:text-c-accent *:last:hover:text-c-foreground *:transition-all *:duration-300">
            <Link href="/">Alle podcasts</Link>
            <Link href="/">Alle artikelen</Link>
            <Link href="/">Steun de show</Link>
          </nav>
        </div>

        {/* Center: logo */}
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/Logo.svg"
              alt={siteSettings?.general?.siteName || 'Ron en Erik'}
              width={120}
              height={80}
              className="h-18 w-auto"
            />
          </Link>
        </div>

        {/* Right: social icons */}
        <div className="flex flex-col gap-4 items-start md:items-end">
          <p className="uppercase text-sm italic text-c-foreground/50">Volg ons via</p>
          <div className="flex *:bg-c-foreground/5 *:text-c-foreground *:transition-all *:ease-in-out *:duration-300 *:hover:bg-c-foreground *:hover:text-c-background *:p-2 *:odd:rounded-full [&_svg]:size-8 [&_svg]:shrink-0">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
