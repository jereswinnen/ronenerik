import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={className}>
      <Image
        src="/Logo.svg"
        alt="Ron en Erik"
        width={76}
        height={50}
        className="h-12.5 w-auto"
        priority
      />
    </Link>
  )
}
