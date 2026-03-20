import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { FooterClient } from './FooterClient'

import type { SiteSetting } from '@/payload-types'

export async function Footer({ className }: { className?: string }) {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  return <FooterClient siteSettings={siteSettings} className={className} />
}
