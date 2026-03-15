'use client'

import { cn } from '@/utilities/ui'
import { useRouter } from 'next/navigation'
import React from 'react'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
}> = (props) => {
  const router = useRouter()

  const { className, page, totalPages } = props
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  const linkClass =
    'inline-flex items-center justify-center size-10 rounded-md text-sm font-medium hover:bg-c-foreground/5 transition-colors'
  const activeClass = 'border border-c-foreground/10'
  const navClass =
    'inline-flex items-center justify-center gap-1 rounded-md px-3 h-10 text-sm font-medium hover:bg-c-foreground/5 transition-colors'

  return (
    <div className={cn('my-12', className)}>
      <nav
        aria-label="pagination"
        className="mx-auto flex w-full justify-center"
        role="navigation"
      >
        <ul className="flex flex-row items-center gap-1">
          <li>
            <button
              aria-label="Go to previous page"
              className={cn(navClass, !hasPrevPage && 'pointer-events-none opacity-50')}
              disabled={!hasPrevPage}
              onClick={() => router.push(`/artikels/pagina/${page - 1}`)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              <span>Previous</span>
            </button>
          </li>

          {hasExtraPrevPages && (
            <li>
              <span className="flex h-9 w-9 items-center justify-center" aria-hidden>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" /><circle cx="6" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></svg>
                <span className="sr-only">More pages</span>
              </span>
            </li>
          )}

          {hasPrevPage && (
            <li>
              <button
                className={linkClass}
                onClick={() => router.push(`/artikels/pagina/${page - 1}`)}
              >
                {page - 1}
              </button>
            </li>
          )}

          <li>
            <button
              aria-current="page"
              className={cn(linkClass, activeClass)}
              onClick={() => router.push(`/artikels/pagina/${page}`)}
            >
              {page}
            </button>
          </li>

          {hasNextPage && (
            <li>
              <button
                className={linkClass}
                onClick={() => router.push(`/artikels/pagina/${page + 1}`)}
              >
                {page + 1}
              </button>
            </li>
          )}

          {hasExtraNextPages && (
            <li>
              <span className="flex h-9 w-9 items-center justify-center" aria-hidden>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" /><circle cx="6" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></svg>
                <span className="sr-only">More pages</span>
              </span>
            </li>
          )}

          <li>
            <button
              aria-label="Go to next page"
              className={cn(navClass, !hasNextPage && 'pointer-events-none opacity-50')}
              disabled={!hasNextPage}
              onClick={() => router.push(`/artikels/pagina/${page + 1}`)}
            >
              <span>Next</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
