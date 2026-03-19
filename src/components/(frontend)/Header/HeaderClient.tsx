'use client'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect, useCallback } from 'react'

import type { Header, SiteSetting, Media as MediaType } from '@/payload-types'
import type { PodcastEpisode } from '@/utilities/rss/types'
import { Logo } from '@/components/(frontend)/Logo'
import { Button } from '@/components/(frontend)/Button'
import { ContentCard, formatUploadDate, formatAuthor } from '@/components/(frontend)/ContentCard'
import { SocialIcon, SocialLink } from '@/components/(frontend)/SocialIcon'

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

const ANIM_MS = 500

export const HeaderClient: React.FC<HeaderClientProps> = ({
  siteSettings,
  latestEpisode,
  episodeImage,
  latestArticle,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const socials = siteSettings?.socials
  const externalLinks = siteSettings?.externalLinks

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true))
    })
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => setIsOpen(false), ANIM_MS)
  }, [])

  const handleNavClick = () => handleClose()

  const stagger = (delay: number) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 400ms ease ${isVisible ? `${delay}ms` : '0ms'}, transform 400ms ease ${isVisible ? `${delay}ms` : '0ms'}`,
  })

  return (
    <>
      <div className="fixed top-4 inset-x-0 z-50 container">
        <div
          className={`mx-auto transition-[width] duration-500 ease-in-out ${
            isOpen ? 'w-full sm:w-4/5' : 'w-full sm:w-3/5'
          }`}
        >
          <div className="rounded-xl bg-c-muted backdrop-blur-lg overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 relative">
              <button
                onClick={isOpen ? handleClose : handleOpen}
                className="flex items-center gap-2 text-base cursor-pointer"
              >
                <div className="relative w-4 h-2.5">
                  <span
                    className={`absolute left-0 w-4 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                      isOpen ? 'top-1 rotate-45' : 'top-0 rotate-0'
                    }`}
                  />
                  <span
                    className={`absolute left-0 w-4 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                      isOpen ? 'top-1 -rotate-45' : 'top-2 rotate-0'
                    }`}
                  />
                </div>
                <span>{isOpen ? 'Sluit' : 'Menu'}</span>
              </button>

              <Logo className="absolute left-1/2 -translate-x-1/2" />

              <Button href="/patreon" variant="primary">
                Steun de show
              </Button>
            </div>

            {/* Menu content */}
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-in-out"
              style={{ gridTemplateRows: isOpen && isVisible ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div
                  className="px-5 pb-5"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: `opacity 300ms ease ${isVisible ? '200ms' : '0ms'}`,
                  }}
                >
                  <div className="border-t border-c-foreground/10 pt-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Podcast */}
                      <div
                        className="rounded-xl border border-c-foreground/10 bg-c-foreground/5 p-4"
                        style={stagger(150)}
                      >
                        <span className="text-xs font-medium uppercase tracking-wider text-c-foreground/60 mb-3 block">
                          Podcast
                        </span>

                        {latestEpisode && (
                          <ContentCard
                            href={`/podcast/${latestEpisode.slug}`}
                            title={latestEpisode.title}
                            image={episodeImage}
                            imageSrc={latestEpisode.image}
                            meta={
                              latestEpisode.pubDate
                                ? formatUploadDate(latestEpisode.pubDate)
                                : undefined
                            }
                            onClick={handleNavClick}
                          />
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-3">
                            {externalLinks?.youtubeChannelUrl && (
                              <SocialIcon
                                href={externalLinks.youtubeChannelUrl}
                                icon="/IconYouTube.svg"
                                label="YouTube"
                              />
                            )}
                            <SocialIcon
                              href="https://open.spotify.com"
                              icon="/IconSpotify.svg"
                              label="Spotify"
                            />
                          </div>
                          <Link
                            href="/podcast"
                            onClick={handleNavClick}
                            className="flex items-center gap-1 text-sm text-c-foreground/60 hover:text-c-foreground transition-colors"
                          >
                            Alle podcasts
                            <Image src="/IconUnpause.svg" alt="" width={14} height={14} />
                          </Link>
                        </div>
                      </div>

                      {/* Artikelen */}
                      <div
                        className="rounded-xl border border-c-foreground/10 bg-c-foreground/5 p-4"
                        style={stagger(250)}
                      >
                        <span className="text-xs font-medium uppercase tracking-wider text-c-foreground/60 mb-3 block">
                          Artikelen
                        </span>

                        {latestArticle && (
                          <ContentCard
                            href={`/artikels/${latestArticle.slug}`}
                            title={latestArticle.title}
                            image={latestArticle.image}
                            meta={
                              latestArticle.author ? formatAuthor(latestArticle.author) : undefined
                            }
                            onClick={handleNavClick}
                          />
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <SocialIcon href="#" icon="/IconPencil.svg" label="Artikelen" />
                          <Link
                            href="/artikels"
                            onClick={handleNavClick}
                            className="flex items-center gap-1 text-sm text-c-foreground/60 hover:text-c-foreground transition-colors"
                          >
                            Alle artikelen
                            <Image src="/IconUnpause.svg" alt="" width={14} height={14} />
                          </Link>
                        </div>
                      </div>

                      {/* Nee, jij bedankt */}
                      <div className="flex flex-col gap-3" style={stagger(350)}>
                        <span className="text-xs font-medium uppercase tracking-wider text-c-foreground/60">
                          Nee, jij bedankt
                        </span>

                        <Link
                          href="/patreon"
                          onClick={handleNavClick}
                          className="block rounded-xl bg-gradient-to-br from-c-accent/80 to-c-accent/40 p-4"
                        >
                          <h3 className="text-base font-semibold mb-1">Wil je meer content?</h3>
                          <p className="text-sm text-c-foreground/80 mb-3">
                            Elke week maken Ron en Erik een extra podcast. Volgens mythes zitten
                            daar zelfs nog meer poepgrappen in.
                          </p>
                          <span className="flex items-center gap-1 text-sm font-medium justify-end">
                            Meer info
                            <Image src="/IconUnpause.svg" alt="" width={14} height={14} />
                          </span>
                        </Link>

                        <div className="flex flex-col">
                          {socials?.discord && (
                            <SocialLink
                              href={socials.discord}
                              icon="/IconDiscord.svg"
                              label="Join de Discord-community"
                            />
                          )}
                          {socials?.instagram && (
                            <SocialLink
                              href={socials.instagram}
                              icon="/IconInstagram.svg"
                              label="Volg ons op Instagram"
                            />
                          )}
                          {socials?.twitter && (
                            <SocialLink
                              href={socials.twitter}
                              icon="/IconTikTok.svg"
                              label="Volg ons op TikTok"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 cursor-pointer"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity ${ANIM_MS}ms ease`,
          }}
          onClick={handleClose}
        />
      )}

      {/* Spacer */}
      <div className="h-20" />
    </>
  )
}
