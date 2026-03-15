import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | 'default' | 'outline' | 'ghost' | 'link'
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

const variantStyles: Record<string, string> = {
  default:
    'inline-flex items-center justify-center rounded-md bg-c-accent px-4 py-2 text-sm font-medium text-c-background transition-opacity hover:opacity-80',
  outline:
    'inline-flex items-center justify-center rounded-md border border-c-foreground/10 bg-transparent px-4 py-2 text-sm font-medium hover:bg-c-foreground/5 transition-colors',
  ghost:
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-c-foreground/5 transition-colors',
  link: 'text-c-accent underline-offset-4 hover:underline text-sm font-medium',
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo === 'posts' ? '/articles' : ''}/${reference.value.slug}`
      : url

  if (!href) return null

  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Link
      className={cn(variantStyles[appearance] || variantStyles.default, className)}
      href={href || url || ''}
      {...newTabProps}
    >
      {label && label}
      {children && children}
    </Link>
  )
}
