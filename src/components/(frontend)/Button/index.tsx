import React from 'react'
import type { FC, SVGProps } from 'react'
import Link from 'next/link'
import IconArrow from '../../../../public/IconArrow.svg'

interface ButtonProps {
  href: string
  variant?: 'primary' | 'secondary' | 'tertiary'
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
  const base = 'inline-flex items-center gap-2 font-semibold leading-none transition-all ease-in-out duration-300'
  const variants = {
    primary:
      'text-[1.125rem] px-4.5 py-3 rounded-lg bg-c-accent text-c-background hover:text-c-accent hover:bg-white',
    secondary:
      'text-[1.125rem] px-4.5 py-3 rounded-full bg-c-foreground/5 text-c-foreground hover:bg-c-foreground hover:text-c-background',
    tertiary: 'text-base text-c-accent hover:text-white',
  }

  const linkProps = external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...linkProps}>
      {Icon && <Icon width={24} height={24} className="shrink-0" />}
      {children}
      {variant === 'tertiary' && <IconArrow className="size-4 shrink-0" />}
    </Link>
  )
}
