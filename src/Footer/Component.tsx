import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer as FooterType, SiteSetting } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'

export async function Footer() {
  const footerData = (await getCachedGlobal('footer', 1)()) as FooterType
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  const navItems = footerData?.navItems || []
  const socials = siteSettings?.socials
  const externalLinks = siteSettings?.externalLinks

  return (
    <footer
      className="mt-auto border-t"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="container py-8 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-bold text-lg" style={{ color: 'var(--color-heading)' }}>
            {siteSettings?.general?.siteName || 'Home'}
          </Link>
          {siteSettings?.general?.tagline && (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {siteSettings.general.tagline}
            </p>
          )}
        </div>

        <nav className="flex flex-col md:flex-row gap-4">
          {navItems.map(({ link }, i) => (
            <CMSLink key={i} {...link} />
          ))}
        </nav>

        <div className="flex flex-col gap-4 items-start md:items-end">
          <div className="flex gap-4 text-sm">
            {externalLinks?.youtubeChannelUrl && (
              <a
                href={externalLinks.youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                YouTube
              </a>
            )}
            {externalLinks?.patreonUrl && (
              <a
                href={externalLinks.patreonUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Patreon
              </a>
            )}
            {socials?.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Twitter
              </a>
            )}
            {socials?.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Instagram
              </a>
            )}
            {socials?.discord && (
              <a
                href={socials.discord}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Discord
              </a>
            )}
          </div>
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
