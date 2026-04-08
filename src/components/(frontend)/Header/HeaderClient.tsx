'use client'
import Link from 'next/link'
import React, { useState, useEffect, useCallback } from 'react'

import type { SiteSetting, Media as MediaType } from '@/payload-types'
import type { PodcastEpisode } from '@/utilities/rss/types'
import { Logo } from '@/components/(frontend)/Logo'
import { Button } from '@/components/(frontend)/Button'
import { ContentCard, formatUploadDate, formatAuthor } from '@/components/(frontend)/ContentCard'
import { SocialIcon, SocialLink } from '@/components/(frontend)/SocialIcon'
import IconYouTube from '../../../../public/IconYouTube.svg'
import IconSpotify from '../../../../public/IconSpotify.svg'
import IconUnpause from '../../../../public/IconUnpause.svg'
import IconDiscord from '../../../../public/IconDiscord.svg'
import IconInstagram from '../../../../public/IconInstagram.svg'
import IconTikTok from '../../../../public/IconTikTok.svg'

interface MenuArticle {
  title: string
  slug: string
  image: MediaType | null
  author: string | null
  publishedAt: string | null
  isCommunity: boolean
}

interface HeaderClientProps {
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
      <div className="fixed top-4 inset-x-0 z-50 container" style={{ viewTransitionName: 'header' }}>
        <div
          className={`mx-auto transition-[width] duration-500 ease-in-out ${
            isVisible ? 'w-full sm:w-[90%]' : 'w-full sm:w-3/5'
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

              <Logo className="absolute left-1/2 -translate-x-1/2 transition-all ease-in-out duration-200 hover:scale-115 hover:-rotate-4" onClick={isOpen ? handleNavClick : undefined} />

              <Button href="/patreon" variant="primary">
                <span className="sm:hidden">Steun ons</span>
                <span className="hidden sm:inline">Steun de show</span>
              </Button>
            </div>

            {/* Menu content */}
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-in-out"
              style={{ gridTemplateRows: isOpen && isVisible ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain">
                <div
                  className="px-5 pb-5"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: `opacity 300ms ease ${isVisible ? '200ms' : '0ms'}`,
                  }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 *:odd:bg-c-darkest/70 *:flex *:flex-col *:gap-5 *:p-8 *:rounded-lg">
                    {/* Podcast */}
                    <div style={stagger(150)}>
                      <p className="uppercase text-sm italic text-c-foreground/50">Podcast</p>

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

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex gap-3 **:size-7 *:hover:text-c-foreground/60">
                          {externalLinks?.youtubeChannelUrl && (
                            <SocialIcon
                              href={externalLinks.youtubeChannelUrl}
                              icon={IconYouTube}
                              label="YouTube"
                            />
                          )}
                          {externalLinks?.spotifyUrl && (
                            <SocialIcon
                              href={externalLinks.spotifyUrl}
                              icon={IconSpotify}
                              label="Spotify"
                            />
                          )}
                        </div>
                        <Link
                          href="/podcast"
                          onClick={handleNavClick}
                          className="text-c-foreground hover:text-c-foreground/60 transition-colors"
                        >
                          <Button variant="tertiary">Alle podcasts</Button>
                        </Link>
                      </div>
                    </div>

                    {/* Artikelen */}
                    <div style={stagger(250)}>
                      <p className="uppercase text-sm italic text-c-foreground/50">Artikelen</p>

                      {latestArticle && (
                        <ContentCard
                          href={`/artikels/${latestArticle.slug}`}
                          title={latestArticle.title}
                          image={latestArticle.image}
                          meta={
                            latestArticle.author ? formatAuthor(latestArticle.author) : undefined
                          }
                          tag={latestArticle.isCommunity ? 'Uit de community' : undefined}
                          onClick={handleNavClick}
                        />
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        {externalLinks?.unpauseUrl && (
                          <SocialIcon
                            className="*:size-7 hover:text-c-foreground/60 transition-all duration-300"
                            href={externalLinks.unpauseUrl}
                            icon={IconUnpause}
                            label="Unpause"
                          />
                        )}
                        <Link
                          href="/artikels"
                          onClick={handleNavClick}
                          className="text-c-foreground hover:text-c-foreground/60 transition-colors"
                        >
                          <Button variant="tertiary">Alle artikelen</Button>
                        </Link>
                      </div>
                    </div>

                    {/* Nee, jij bedankt */}
                    <div style={stagger(350)}>
                      <p className="uppercase text-sm italic text-c-foreground/50">
                        Nee, jij bedankt
                      </p>

                      <Link
                        href="/patreon"
                        onClick={handleNavClick}
                        className="block rounded-xl bg-linear-to-br from-c-accent to-c-accent-background p-4"
                      >
                        <h3 className="text-lg font-semibold">Wil je meer content?</h3>
                        <p className="text-base text-c-foreground">
                          Elke week maken Ron en Erik een extra podcast. Volgens mythes zitten daar
                          zelfs nog meer poepgrappen in.
                        </p>
                        <Button variant="tertiary" className="mt-4 self-end">
                          Meer info
                        </Button>
                      </Link>

                      <div className="flex flex-col *:text-c-foreground *:text-lg *:hover:text-c-foreground/60 *:transition-all *:duration-300">
                        {externalLinks?.discordUrl && (
                          <SocialLink
                            href={externalLinks.discordUrl}
                            icon={IconDiscord}
                            label="Join de Discord-community"
                          />
                        )}
                        {socials?.instagram && (
                          <SocialLink
                            href={socials.instagram}
                            icon={IconInstagram}
                            label="Volg ons op Instagram"
                          />
                        )}
                        {socials?.twitter && (
                          <SocialLink
                            href={socials.twitter}
                            icon={IconTikTok}
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
