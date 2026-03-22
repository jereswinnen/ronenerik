import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Media } from '../../../payload-types'

export const revalidateMedia: CollectionAfterChangeHook<Media> = ({
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating paths after media change')

    revalidatePath('/', 'layout')
  }
}
