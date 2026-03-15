'use client'
import Link from 'next/link'
import React, { useState, useEffect, useRef, useCallback } from 'react'

import type { Header, SiteSetting, Media as MediaType } from '@/payload-types'
import type { PodcastEpisode } from '@/utilities/rss/types'
import { Media } from '@/components/Media'
import { Logo } from '@/components/(frontend)/Logo'

interface MenuArticle {
  title: string
  slug: string
  image: MediaType | null
  author: string | null
  publishedAt: string | null
}

interface HeaderClientProps {
  data: Header
  siteSettings: SiteSetting
  latestEpisode: PodcastEpisode | null
  episodeImage: MediaType | null
  latestArticle: MenuArticle | null
}

const BAR_HEIGHT = 52
const ANIM_MS = 500
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'

export const HeaderClient: React.FC<HeaderClientProps> = ({
  siteSettings,
  latestEpisode,
  episodeImage,
  latestArticle,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [animHeight, setAnimHeight] = useState(BAR_HEIGHT)
  const [contentVisible, setContentVisible] = useState(false)
  const patreonUrl = siteSettings?.externalLinks?.patreonUrl
  const socials = siteSettings?.socials
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    // Need two frames: first to render content (hidden), second to measure & animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (contentRef.current) {
          const contentHeight = contentRef.current.scrollHeight
          setAnimHeight(BAR_HEIGHT + contentHeight)
        }
        setContentVisible(true)
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    setContentVisible(false)
    setAnimHeight(BAR_HEIGHT)
    setTimeout(() => setIsOpen(false), ANIM_MS)
  }, [])

  const handleNavClick = () => handleClose()

  return (
    <>
      {/* Floating nav container — expands to show menu */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
        <div
          ref={containerRef}
          className="rounded-2xl bg-c-background/90 backdrop-blur-xl border border-c-foreground/10 overflow-hidden"
          style={{
            height: animHeight,
            transition: `height ${ANIM_MS}ms ${EASING}`,
          }}
        >
          {/* Top bar — always visible */}
          <div className="flex items-center justify-between px-5 h-[52px] flex-shrink-0 relative">
            {/* Menu toggle */}
            <button
              onClick={isOpen ? handleClose : handleOpen}
              className="flex items-center gap-2 text-sm font-medium cursor-pointer"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${
                  isOpen ? 'top-[9px] rotate-45' : 'top-[4px] rotate-0'
                }`} />
                <span className={`absolute left-0 top-[9px] w-5 h-[1.5px] bg-current transition-opacity duration-200 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`absolute left-0 w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${
                  isOpen ? 'top-[9px] -rotate-45' : 'top-[14px] rotate-0'
                }`} />
              </div>
              <span>{isOpen ? 'Sluit' : 'Menu'}</span>
            </button>

            {/* Logo */}
            <Logo className="absolute left-1/2 -translate-x-1/2" />

            {/* CTA */}
            <Link
              href="/patreon"
              className="rounded-full bg-c-accent px-4 py-1.5 text-sm font-semibold text-c-background transition-opacity hover:opacity-90"
            >
              Steun de show
            </Link>
          </div>

          {/* Menu content — inside the same container */}
          {isOpen && (
            <div
              ref={contentRef}
              className="px-5 pb-5"
              style={{
                opacity: contentVisible ? 1 : 0,
                transition: `opacity ${ANIM_MS * 0.6}ms ease ${contentVisible ? '150ms' : '0ms'}`,
              }}
            >
              <div className="border-t border-c-foreground/10 pt-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Column 1: Podcast */}
                  <div
                    className="rounded-xl border border-c-foreground/10 bg-c-foreground/5 p-4"
                    style={{
                      opacity: contentVisible ? 1 : 0,
                      transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity 400ms ease ${contentVisible ? '150ms' : '0ms'}, transform 400ms ease ${contentVisible ? '150ms' : '0ms'}`,
                    }}
                  >
                    <span className="text-xs font-medium uppercase tracking-wider text-c-foreground/60 mb-3 block">
                      Podcast
                    </span>

                    {latestEpisode && (
                      <Link
                        href={`/podcast/${latestEpisode.slug}`}
                        onClick={handleNavClick}
                        className="block rounded-lg border border-c-accent/40 overflow-hidden mb-3"
                      >
                        {episodeImage ? (
                          <Media
                            resource={episodeImage}
                            imgClassName="w-full aspect-video object-cover"
                            size="33vw"
                          />
                        ) : latestEpisode.image ? (
                          <img src={latestEpisode.image} alt="" className="w-full aspect-video object-cover" />
                        ) : null}
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-c-accent line-clamp-2">
                            {latestEpisode.title}
                          </h3>
                          {latestEpisode.pubDate && (
                            <p className="text-xs text-c-foreground/50 mt-1">
                              geüpload op: {new Date(latestEpisode.pubDate).toLocaleDateString('nl-NL', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </Link>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-3">
                        {siteSettings?.externalLinks?.youtubeChannelUrl && (
                          <SocialIcon href={siteSettings.externalLinks.youtubeChannelUrl} label="YouTube">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </SocialIcon>
                        )}
                        <SpotifyIcon />
                      </div>
                      <Link
                        href="/podcast"
                        onClick={handleNavClick}
                        className="flex items-center gap-1 text-sm text-c-foreground/60 hover:text-c-foreground transition-colors"
                      >
                        Alle podcasts <ArrowIcon />
                      </Link>
                    </div>
                  </div>

                  {/* Column 2: Artikelen */}
                  <div
                    className="rounded-xl border border-c-foreground/10 bg-c-foreground/5 p-4"
                    style={{
                      opacity: contentVisible ? 1 : 0,
                      transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity 400ms ease ${contentVisible ? '250ms' : '0ms'}, transform 400ms ease ${contentVisible ? '250ms' : '0ms'}`,
                    }}
                  >
                    <span className="text-xs font-medium uppercase tracking-wider text-c-foreground/60 mb-3 block">
                      Artikelen
                    </span>

                    {latestArticle && (
                      <Link
                        href={`/artikels/${latestArticle.slug}`}
                        onClick={handleNavClick}
                        className="block rounded-lg border border-c-accent/40 overflow-hidden mb-3"
                      >
                        {latestArticle.image ? (
                          <Media
                            resource={latestArticle.image}
                            imgClassName="w-full aspect-video object-cover"
                            size="33vw"
                          />
                        ) : null}
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-c-accent line-clamp-2">
                            {latestArticle.title}
                          </h3>
                          {latestArticle.author && (
                            <p className="text-xs text-c-foreground/50 mt-1">
                              geschreven door: {latestArticle.author}
                            </p>
                          )}
                        </div>
                      </Link>
                    )}

                    <div className="flex items-center justify-end mt-3">
                      <Link
                        href="/artikels"
                        onClick={handleNavClick}
                        className="flex items-center gap-1 text-sm text-c-foreground/60 hover:text-c-foreground transition-colors"
                      >
                        Alle artikelen <ArrowIcon />
                      </Link>
                    </div>
                  </div>

                  {/* Column 3: Nee, jij bedankt */}
                  <div
                    className="flex flex-col gap-3"
                    style={{
                      opacity: contentVisible ? 1 : 0,
                      transform: contentVisible ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity 400ms ease ${contentVisible ? '350ms' : '0ms'}, transform 400ms ease ${contentVisible ? '350ms' : '0ms'}`,
                    }}
                  >
                    <span className="text-xs font-medium uppercase tracking-wider text-c-foreground/60">
                      Nee, jij bedankt
                    </span>

                    {patreonUrl && (
                      <a
                        href={patreonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl bg-gradient-to-br from-c-accent/80 to-c-accent/40 p-4"
                      >
                        <h3 className="text-base font-semibold mb-1">Wil je meer content?</h3>
                        <p className="text-sm text-c-foreground/80 mb-3">
                          Elke week maken Ron en Erik een extra podcast. Volgens mythes zitten daar zelfs nog meer poepgrappen in.
                        </p>
                        <span className="flex items-center gap-1 text-sm font-medium justify-end">
                          Meer info <ArrowIcon />
                        </span>
                      </a>
                    )}

                    <div className="flex flex-col">
                      {socials?.discord && (
                        <SocialLink href={socials.discord} label="Join de Discord-community">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                        </SocialLink>
                      )}
                      {socials?.instagram && (
                        <SocialLink href={socials.instagram} label="Volg ons op Instagram">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                        </SocialLink>
                      )}
                      {socials?.twitter && (
                        <SocialLink href={socials.twitter} label="Volg ons op TikTok">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                        </SocialLink>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 cursor-pointer"
          style={{
            opacity: contentVisible ? 1 : 0,
            transition: `opacity ${ANIM_MS}ms ease`,
          }}
          onClick={handleClose}
        />
      )}

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  )
}

// --- Icon components ---

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block">
      <path d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="text-c-foreground/60 hover:text-c-foreground transition-colors">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    </a>
  )
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-c-foreground/60 hover:text-c-foreground transition-colors">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">{children}</svg>
    </a>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-3 border-b border-c-foreground/10 text-sm text-c-foreground/80 hover:text-c-foreground transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">{children}</svg>
      {label}
    </a>
  )
}
