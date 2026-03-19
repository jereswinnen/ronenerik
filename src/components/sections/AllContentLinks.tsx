import React from 'react'
import type { FC, SVGProps } from 'react'
import Link from 'next/link'
import IconArrow from '../../../public/IconArrow.svg'
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
      <div className="flex flex-col items-center gap-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2>Nee, jij bedankt!</h2>
          <p className="text-lg">Luister naar de podcast of vind een van de vele artikelen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col gap-4 p-6 rounded-2xl bg-c-muted"
            >
              <div className="w-fit p-2 rounded-full bg-c-accent-background text-c-accent">
                <card.icon className="size-7" />
              </div>
              <div className="flex flex-col gap-2">
                <h5>{card.title}</h5>
                <p>{card.description}</p>
              </div>
              <span className="mt-auto self-end inline-flex items-center gap-2 font-semibold text-base text-c-accent group-hover:text-white transition-all ease-in-out duration-300">
                {card.cta}
                <IconArrow className="size-4 shrink-0" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
