import React from 'react'
import type { FC, SVGProps } from 'react'
import Image from 'next/image'

interface SocialIconProps {
  href: string
  icon: string | FC<SVGProps<SVGSVGElement>>
  label: string
  size?: number
  className?: string
}

export function SocialIcon({ href, icon: Icon, label, size = 20, className }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={className ?? 'transition-all duration-300'}
    >
      {typeof Icon === 'string' ? (
        <Image src={Icon} alt={label} width={size} height={size} />
      ) : (
        <Icon width={size} height={size} className="shrink-0" />
      )}
    </a>
  )
}

interface SocialLinkProps {
  href: string
  icon: string | FC<SVGProps<SVGSVGElement>>
  label: string
}

export function SocialLink({ href, icon: Icon, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-3 border-b border-c-foreground/10 text-sm text-c-foreground/80 hover:text-c-foreground transition-colors"
    >
      {typeof Icon === 'string' ? (
        <Image src={Icon} alt="" width={20} height={20} className="flex-shrink-0" />
      ) : (
        <Icon width={20} height={20} className="shrink-0" />
      )}
      {label}
    </a>
  )
}
