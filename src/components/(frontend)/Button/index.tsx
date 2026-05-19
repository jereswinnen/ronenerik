import React from 'react'
import type { FC, SVGProps } from 'react'
import Link from 'next/link'
import IconArrow from '../../../../public/IconArrow.svg'

type Variant = 'primary' | 'secondary' | 'tertiary'
type Tone = 'default' | 'danger'

interface CommonProps {
  variant?: Variant
  tone?: Tone
  icon?: FC<SVGProps<SVGSVGElement>>
  invert?: boolean
  children: React.ReactNode
  className?: string
}

interface LinkButtonProps extends CommonProps {
  href: string
  external?: boolean
  type?: never
  onClick?: never
  disabled?: never
}

interface ActionButtonProps extends CommonProps {
  href?: undefined
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  external?: never
}

type ButtonProps = LinkButtonProps | ActionButtonProps

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    tone = 'default',
    icon: Icon,
    invert,
    children,
    className = '',
  } = props

  const base =
    'inline-flex items-center gap-2 text-base md:text-lg font-semibold leading-none transition-all ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<Variant, string> = {
    primary: invert
      ? 'px-4.5 py-3 rounded-lg bg-c-background text-c-accent hover:bg-white hover:text-c-background'
      : 'px-4.5 py-3 rounded-lg bg-c-accent text-c-background hover:text-c-accent hover:bg-white',
    secondary:
      'text-[1.125rem] px-4.5 py-3 rounded-full bg-c-foreground/5 text-c-foreground hover:bg-c-foreground hover:text-c-background',
    tertiary: 'text-base text-current',
  }
  const dangerOverride =
    tone === 'danger' && variant === 'secondary'
      ? 'text-red-600 hover:bg-red-600 hover:text-c-background'
      : ''

  const classes = `${base} ${variants[variant]} ${dangerOverride} ${className}`.trim()

  const content = (
    <>
      {Icon && <Icon width={24} height={24} className="shrink-0" />}
      {children}
      {variant === 'tertiary' && <IconArrow className="size-4 shrink-0" />}
    </>
  )

  if (variant === 'tertiary' && !('href' in props && props.href)) {
    return <span className={classes}>{content}</span>
  }

  if ('href' in props && props.href) {
    const { href, external } = props
    const linkProps = external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}
    return (
      <Link href={href} className={classes} {...linkProps}>
        {content}
      </Link>
    )
  }

  const { type = 'submit', onClick, disabled } = props as ActionButtonProps
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  )
}
