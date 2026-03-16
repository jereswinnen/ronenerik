import React from 'react'
import Image from 'next/image'
import { SocialIcon } from '@/components/(frontend)/SocialIcon'

interface Author {
  id?: string | null
  name?: string | null
  subtitle?: string | null
  avatarUrl?: string | null
  bluesky?: string | null
  twitter?: string | null
}

interface AuthorCardProps {
  author: Author
}

export function AuthorCard({ author }: AuthorCardProps) {
  const hasSocials = author.bluesky || author.twitter

  return (
    <div className="flex items-center gap-3">
      {author.avatarUrl && (
        <Image
          src={author.avatarUrl}
          alt={author.name || ''}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{author.name}</p>
        {author.subtitle && (
          <p className="text-xs text-c-foreground/50">{author.subtitle}</p>
        )}
      </div>
      {hasSocials && (
        <div className="flex gap-2">
          {author.bluesky && (
            <SocialIcon href={author.bluesky} icon="/IconBlueSky.svg" label="BlueSky" size={16} />
          )}
          {author.twitter && (
            <SocialIcon href={author.twitter} icon="/IconX.svg" label="X / Twitter" size={16} />
          )}
        </div>
      )}
    </div>
  )
}
