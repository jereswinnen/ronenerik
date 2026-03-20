import type { Metadata } from 'next'
import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { SiteSetting, PatreonPage as PatreonPageType, Media as MediaType } from '@/payload-types'
import { Button } from '@/components/(frontend)/Button'
import { Media } from '@/components/Media'
import { Parallax } from '@/components/sections/Parallax'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function PatreonPage() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const patreonPage = (await getCachedGlobal('patreon-page', 2)()) as PatreonPageType
  const patreonUrl = siteSettings?.externalLinks?.patreonUrl || '#'

  const heading = patreonPage?.hero?.heading || 'Kies voor hoeveel je ons wil steunen'
  const socialProof = patreonPage?.hero?.socialProof || '100+ luisteraars gingen je voor'
  const plans = patreonPage?.plans || []
  const formatsHeading = patreonPage?.formats?.heading || 'Onze gevierde Patreon formats'
  const formatItems = patreonPage?.formats?.items || []
  const formatImage =
    patreonPage?.formats?.image && typeof patreonPage.formats.image === 'object'
      ? (patreonPage.formats.image as MediaType)
      : null

  return (
    <section className="flex flex-col gap-20 md:gap-30 pt-12 md:pt-30">
      {/* Hero */}
      <div className="container flex flex-col items-center gap-6 text-center">
        <p className="uppercase text-sm italic text-c-foreground/50">Steun de show</p>
        <h2>{heading}</h2>
        <p className="text-c-foreground/60">{socialProof}</p>
      </div>

      {/* Plans */}
      {plans.length > 0 && (
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col gap-6 rounded-2xl border p-8 ${
                  plan.highlighted
                    ? 'border-c-accent bg-c-accent text-c-background'
                    : 'border-c-foreground/10'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <h5>{plan.name}</h5>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className={plan.highlighted ? 'text-c-background/60' : 'text-c-foreground/60'}>
                      / maand
                    </span>
                  </div>
                </div>

                {plan.description && (
                  <p className={plan.highlighted ? 'text-c-background/80' : 'text-c-foreground/60'}>
                    {plan.description}
                  </p>
                )}

                {plan.features && plan.features.length > 0 && (
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature.id} className="flex items-start gap-3">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`size-5 shrink-0 mt-0.5 ${plan.highlighted ? 'text-c-background' : 'text-c-accent'}`}
                        >
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        <span className={plan.highlighted ? '' : 'text-c-foreground/80'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col gap-2 mt-auto">
                  <Button
                    href={patreonUrl}
                    variant="primary"
                    invert={plan.highlighted ?? false}
                    external
                    className="w-full justify-center"
                  >
                    {plan.ctaText}
                  </Button>
                  <p
                    className={`text-xs text-center ${plan.highlighted ? 'text-c-background/50' : 'text-c-foreground/40'}`}
                  >
                    Abonnement loopt via Patreon en is maandelijks opzegbaar
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formats */}
      {formatItems.length > 0 && (
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="flex flex-col gap-8">
              <h3>{formatsHeading}</h3>
              <div className="grid grid-cols-2 gap-8">
                {formatItems.map((format, i) => (
                  <div key={format.id} className="flex flex-col gap-3">
                    <span className="flex items-center justify-center size-10 rounded-full bg-c-accent text-c-background font-bold text-lg">
                      {i + 1}
                    </span>
                    <h6 className="font-bold">{format.title}</h6>
                    {format.description && (
                      <p className="text-sm text-c-foreground/60 leading-relaxed">
                        {format.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {formatImage && (
              <Parallax
                className="h-[50vh] overflow-hidden"
                offset={['start end', 'end start']}
                range={['-10%', '10%']}
              >
                <Media
                  resource={formatImage}
                  imgClassName="w-full h-[60vh] object-cover"
                  size="50vw"
                />
              </Parallax>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Steun de show',
  }
}
