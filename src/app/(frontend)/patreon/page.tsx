import type { Metadata } from 'next'
import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type {
  SiteSetting,
  PatreonPage as PatreonPageType,
  Media as MediaType,
} from '@/payload-types'
import { Button } from '@/components/(frontend)/Button'
import IconCheckmark from '../../../../public/IconCheckmark.svg'
import { ShimmerCard } from '@/components/(frontend)/ShimmerCard'
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
            {plans.map((plan) => {
              const cardClass = `flex flex-col gap-8 rounded-2xl border p-8 transition-all duration-300 ease-in-out hover:scale-102 ${
                plan.highlighted
                  ? 'border-c-accent bg-c-accent text-c-accent-background'
                  : 'border-none bg-c-muted'
              }`

              const cardContent = (
                <>
                  <div className="flex flex-col gap-2">
                    <h5>{plan.name}</h5>
                    <div className="flex items-baseline gap-1">
                      <span className="text-7xl font-bold">{plan.price}</span>
                      <h6
                        className={
                          plan.highlighted
                            ? 'text-c-accent-background font-normal'
                            : 'text-c-foreground font-normal'
                        }
                      >
                        / maand
                      </h6>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {plan.description && (
                      <p
                        className={
                          plan.highlighted
                            ? 'text-c-accent-background text-lg font-medium'
                            : 'text-c-foreground text-lg font-medium'
                        }
                      >
                        {plan.description}
                      </p>
                    )}

                    {plan.features && plan.features.length > 0 && (
                      <ul
                        className={`flex flex-col divide-y ${plan.highlighted ? 'divide-c-accent-background/20' : 'divide-c-foreground/10'}`}
                      >
                        {plan.features.map((feature) => (
                          <li
                            key={feature.id}
                            className="flex items-center gap-2 text-lg py-3 first:pt-0 last:pb-0"
                          >
                            <IconCheckmark
                              className={`size-6 shrink-0 ${plan.highlighted ? 'text-c-accent-background' : 'text-c-accent'}`}
                            />
                            <span className={plan.highlighted ? '' : 'text-c-foreground/80'}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

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
                      className={`text-sm text-center ${plan.highlighted ? 'text-c-accent-background/70' : 'text-c-foreground/50'}`}
                    >
                      Abonnement loopt via Patreon en is maandelijks opzegbaar
                    </p>
                  </div>
                </>
              )

              return plan.highlighted ? (
                <ShimmerCard key={plan.id} className={cardClass}>
                  {cardContent}
                </ShimmerCard>
              ) : (
                <div key={plan.id} className={cardClass}>
                  {cardContent}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Formats */}
      {formatItems.length > 0 && (
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="flex flex-col gap-8">
              <h3>{formatsHeading}</h3>
              <div className="grid grid-cols-2 gap-8 gap-y-18">
                {formatItems.map((format, i) => (
                  <div key={format.id} className="flex flex-col gap-5">
                    <span className="flex items-center justify-center size-12 rounded-full bg-c-accent-background text-c-accent font-normal text-3xl">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-2">
                      <h5>{format.title}</h5>
                      {format.description && <p>{format.description}</p>}
                    </div>
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
