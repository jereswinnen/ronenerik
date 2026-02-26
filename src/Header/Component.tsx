import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header as HeaderType, SiteSetting } from '@/payload-types'

export async function Header() {
  const headerData = (await getCachedGlobal('header', 1)()) as HeaderType
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting

  return <HeaderClient data={headerData} siteName={siteSettings?.general?.siteName} />
}
