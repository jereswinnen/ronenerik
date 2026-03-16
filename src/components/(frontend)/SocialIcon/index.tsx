import React from 'react'
import Image from 'next/image'

interface SocialIconProps {
  href: string
  icon: string
  label: string
  size?: number
}

export function SocialIcon({ href, icon, label, size = 20 }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="opacity-60 hover:opacity-100 transition-opacity"
    >
      <Image src={icon} alt={label} width={size} height={size} />
    </a>
  )
}

interface SocialLinkProps {
  href: string
  icon: string
  label: string
}

export function SocialLink({ href, icon, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-3 border-b border-c-foreground/10 text-sm text-c-foreground/80 hover:text-c-foreground transition-colors"
    >
      <Image src={icon} alt="" width={20} height={20} className="flex-shrink-0" />
      {label}
    </a>
  )
}
