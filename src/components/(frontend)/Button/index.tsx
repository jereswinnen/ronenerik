import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ButtonProps {
  href: string
  variant?: 'primary' | 'secondary'
  icon?: string
  external?: boolean
  children: React.ReactNode
  className?: string
}

export function Button({
  href,
  variant = 'primary',
  icon,
  external,
  children,
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-3 font-semibold text-[1.125rem] leading-none px-4.5 py-3 transition-all duration-300'
  const variants = {
    primary: 'rounded-lg bg-c-accent text-c-background hover:text-c-accent hover:bg-white',
    secondary: 'rounded-full bg-c-foreground/10 text-c-foreground',
  }

  const linkProps = external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...linkProps}>
      {icon && <Image src={icon} alt="" width={24} height={24} className="w-6 h-6" />}
      {children}
    </Link>
  )
}
