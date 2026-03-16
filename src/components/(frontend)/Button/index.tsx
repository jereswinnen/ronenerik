import React from 'react'
import type { FC, SVGProps } from 'react'
import Link from 'next/link'

interface ButtonProps {
  href: string
  variant?: 'primary' | 'secondary'
  icon?: FC<SVGProps<SVGSVGElement>>
  external?: boolean
  children: React.ReactNode
  className?: string
}

export function Button({
  href,
  variant = 'primary',
  icon: Icon,
  external,
  children,
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-2 font-semibold text-[1.125rem] leading-none px-4.5 py-3 transition-all ease-in-out duration-300'
  const variants = {
    primary: 'rounded-lg bg-c-accent text-c-background hover:text-c-accent hover:bg-white',
    secondary:
      'rounded-full bg-c-foreground/10 text-c-foreground hover:bg-c-foreground hover:text-c-background',
  }

  const linkProps = external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...linkProps}>
      {Icon && <Icon width={24} height={24} className="shrink-0" />}
      {children}
    </Link>
  )
}
