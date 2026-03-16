import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { SiteSetting, Media as MediaType, User } from '@/payload-types'
import { Media } from '@/components/Media'
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

  // Resolve author relationships
  const payload = await getPayload({ config: configPromise })
  const authorIds = (about.authors || []).map((a) => (typeof a === 'object' ? a.id : a))
  const authors: User[] = []
  for (const id of authorIds) {
    try {
      const user = await payload.findByID({ id, collection: 'users', depth: 1 })
      if (user) authors.push(user)
    } catch {
      // User may have been deleted
    }
  }

  return (
    <section className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: text content */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2>{heading}</h2>
            {description && <p className="text-c-foreground">{description}</p>}
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
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    {author.name && <h6 className="font-semibold">{author.name}</h6>}
                    {author.bio && (
                      <p className="text-sm text-c-foreground/60 leading-relaxed">{author.bio}</p>
                    )}
                    <AuthorSocials author={author} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: image */}
        {aboutImage && (
          <div className="overflow-hidden">
            <Media resource={aboutImage} imgClassName="w-full h-full object-cover" size="50vw" />
          </div>
        )}
      </div>
    </section>
  )
}

function AuthorSocials({ author }: { author: User }) {
  const socials = author.socials
  if (!socials?.bluesky && !socials?.twitter && !socials?.instagram) return null

  return (
    <div className="flex gap-3">
      {socials.bluesky && (
        <a
          href={socials.bluesky}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="BlueSky"
          className="text-c-foreground/50 hover:text-c-foreground transition-colors"
        >
          <IconBlueSky width={24} height={24} />
        </a>
      )}
      {socials.twitter && (
        <a
          href={socials.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X / Twitter"
          className="text-c-foreground/50 hover:text-c-foreground transition-colors"
        >
          <IconX width={24} height={24} />
        </a>
      )}
      {socials.instagram && (
        <a
          href={socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="text-c-foreground/50 hover:text-c-foreground transition-colors"
        >
          <IconInstagram width={24} height={24} />
        </a>
      )}
    </div>
  )
}
