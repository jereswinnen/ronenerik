import React from 'react'
import type { FC, SVGProps } from 'react'
import Link from 'next/link'
import IconHeadphones from '../../../public/IconHeadphones.svg'
import IconPencil from '../../../public/IconPencil.svg'
import IconPatreon from '../../../public/IconPatreonSmall.svg'

const cards: {
  href: string
  icon: FC<SVGProps<SVGSVGElement>>
  title: string
  description: string
  cta: string
}[] = [
  {
    href: '/podcast',
    icon: IconHeadphones,
    title: 'Alle afleveringen',
    description: 'Luister alle afleveringen van de Ron en Erik podcast terug.',
    cta: 'Bekijken',
  },
  {
    href: '/artikels',
    icon: IconPencil,
    title: 'Alle artikelen',
    description: 'Lees onze artikelen over games, tech en meer.',
    cta: 'Bekijken',
  },
  {
    href: '/patreon',
    icon: IconPatreon,
    title: 'Steun Ron en Erik',
    description: 'Word Patreon-supporter en krijg toegang tot exclusieve content.',
    cta: 'Meer informatie',
  },
]

export function AllContentLinks() {
  return (
    <section className="container">
      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2>Nee, jij bedankt!</h2>
          <p className="text-c-foreground/70">
            Luister naar de podcast of vind een van de vele artikelen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col gap-6 rounded-2xl border border-c-foreground/10 p-8 transition-colors hover:border-c-foreground/30"
            >
              <card.icon width={32} height={32} className="text-c-accent" />
              <div className="flex flex-col gap-2">
                <h5 className="font-semibold">{card.title}</h5>
                <p className="text-sm text-c-foreground/60 leading-relaxed">
                  {card.description}
                </p>
              </div>
              <span className="mt-auto self-end flex items-center gap-2 text-sm font-medium text-c-accent">
                {card.cta}
                <span className="text-lg leading-none">&#x2197;</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
