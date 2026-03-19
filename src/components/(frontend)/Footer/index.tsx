import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { FooterClient } from './FooterClient'

import type { Footer as FooterType, SiteSetting } from '@/payload-types'

export async function Footer({ className }: { className?: string }) {
  const footerData = (await getCachedGlobal('footer', 1)()) as FooterType
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  return <FooterClient data={footerData} siteSettings={siteSettings} className={className} />
}
