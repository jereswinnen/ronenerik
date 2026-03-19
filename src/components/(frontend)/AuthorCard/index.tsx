import React from 'react'
import Image from 'next/image'
import IconBlueSky from '../../../../public/IconBlueSky.svg'
import IconX from '../../../../public/IconX.svg'

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
    <div className="flex flex-col items-center gap-3">
      {author.avatarUrl && (
        <Image
          src={author.avatarUrl}
          alt={author.name || ''}
          width={40}
          height={40}
          className="size-24 rounded-full object-cover"
        />
      )}
      <div className="flex flex-col items-center">
        <p className="font-bold">{author.name}</p>
        {author.subtitle && <p className="text-sm">{author.subtitle}</p>}
      </div>
      {hasSocials && (
        <div className="flex *:first:rounded-full *:bg-c-foreground/5 *:text-c-foreground *:transition-all *:ease-in-out *:duration-300 *:hover:bg-c-foreground *:hover:text-c-background *:p-2 [&_svg]:size-7 [&_svg]:shrink-0">
          {author.bluesky && (
            <a href={author.bluesky} target="_blank" rel="noopener noreferrer" aria-label="BlueSky">
              <IconBlueSky />
            </a>
          )}
          {author.twitter && (
            <a
              href={author.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
            >
              <IconX />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
