import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { SiteSetting, Media as MediaType, User } from '@/payload-types'
import { Media } from '@/components/Media'
import { Parallax } from './Parallax'
import IconBlueSky from '../../../public/IconBlueSky.svg'
import IconX from '../../../public/IconX.svg'
import IconInstagram from '../../../public/IconInstagram.svg'

export async function AboutSection() {
  const siteSettings = (await getCachedGlobal('site-settings', 2)()) as SiteSetting
  const about = siteSettings?.about
  if (!about) return null

  const heading = about.heading || 'Wij zijn Ron en Erik'
  const description = about.description
  const aboutImage = typeof about.image === 'object' ? (about.image as MediaType) : null

  const authors = (about.authors || []).filter(
    (a): a is User => typeof a === 'object' && a !== null,
  )

  return (
    <section className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: text content */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h3>{heading}</h3>
            {description && <p className="text-lg text-c-foreground">{description}</p>}
          </div>

          {authors.length > 0 && (
            <div className="grid grid-cols-2 gap-8">
              {authors.map((author) => {
                const avatarUrl =
                  typeof author.avatar === 'object' && author.avatar?.url ? author.avatar.url : null

                return (
                  <div key={author.id} className="flex flex-col gap-3">
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt={author.name || ''}
                        className="size-24 rounded-full object-cover"
                      />
                    )}
                    {author.name && <h6>{author.name}</h6>}
                    {author.bio && <p>{author.bio}</p>}
                    <AuthorSocials author={author} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: image */}
        {aboutImage && (
          <Parallax
            className="h-[50vh] overflow-hidden"
            offset={['start end', 'end start']}
            range={['-10%', '10%']}
          >
            <Media
              resource={aboutImage}
              imgClassName="w-full h-[60vh] object-cover"
              size="50vw"
            />
          </Parallax>
        )}
      </div>
    </section>
  )
}

function AuthorSocials({ author }: { author: User }) {
  const socials = author.socials
  if (!socials?.bluesky && !socials?.twitter && !socials?.instagram) return null

  return (
    <div className="flex *:first:rounded-full *:bg-c-foreground/5 *:text-c-foreground *:transition-all *:ease-in-out *:duration-300 *:hover:bg-c-foreground *:hover:text-c-background *:p-2 [&_svg]:size-7 [&_svg]:shrink-0">
      {socials.bluesky && (
        <a href={socials.bluesky} target="_blank" rel="noopener noreferrer" aria-label="BlueSky">
          <IconBlueSky />
        </a>
      )}
      {socials.twitter && (
        <a
          href={socials.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X / Twitter"
        >
          <IconX />
        </a>
      )}
      {socials.instagram && (
        <a
          href={socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <IconInstagram />
        </a>
      )}
    </div>
  )
}
