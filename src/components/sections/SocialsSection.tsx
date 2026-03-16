import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Button } from '@/components/(frontend)/Button'
import type { SiteSetting } from '@/payload-types'
import IconYouTube from '../../../public/IconYouTube.svg'
import IconSpotify from '../../../public/IconSpotify.svg'
import IconDiscord from '../../../public/IconDiscord.svg'
import IconInstagram from '../../../public/IconInstagram.svg'
import IconTikTok from '../../../public/IconTikTok.svg'

export async function SocialsSection() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  const socials = siteSettings?.socials
  const externalLinks = siteSettings?.externalLinks

  const allLinks = [
    { href: externalLinks?.youtubeChannelUrl, icon: IconYouTube, label: 'Luister via YouTube' },
    { href: socials?.spotify, icon: IconSpotify, label: 'Luister via Spotify' },
    { href: socials?.discord, icon: IconDiscord, label: 'Join de community' },
    { href: socials?.instagram, icon: IconInstagram, label: 'Volg via Instagram' },
    { href: socials?.tiktok, icon: IconTikTok, label: 'Volg via TikTok' },
  ]

  const links = allLinks.filter(
    (l): l is typeof allLinks[number] & { href: string } => Boolean(l.href),
  )

  if (links.length === 0) return null

  return (
    <section className="container">
      <div className="flex flex-wrap justify-center gap-4">
        {links.map((link) => (
          <Button key={link.href} href={link.href} variant="secondary" icon={link.icon} external>
            {link.label}
          </Button>
        ))}
      </div>
    </section>
  )
}
