import type { ReactNode } from 'react'
import { Badge, type BadgeVariant } from '../../atoms/Badge'

export interface AuthLayoutProps {
  title: string
  subtitle: string
  badgeText: string
  badgeVariant?: BadgeVariant
  bannerSrc: string
  bannerAlt: string
  bannerCaptionTitle?: string
  bannerCaptionText?: string
  children: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'info',
  bannerSrc,
  bannerAlt,
  bannerCaptionTitle,
  bannerCaptionText,
  children,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh w-full grid-cols-1 bg-ocean-abyss text-parchment lg:grid-cols-2">
      <main className="flex flex-col items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="w-full max-w-md space-y-8">
          <header className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-grand-line.jpg"
                  alt="Emblema do Grand Line Hub"
                  className="h-12 w-12 rounded-full border border-treasure-gold/40 object-cover"
                />
                <span className="font-display text-lg font-bold tracking-wider text-treasure-gold">
                  Grand Line Hub
                </span>
              </div>
              <Badge variant={badgeVariant}>{badgeText}</Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="text-base text-mist-gray">{subtitle}</p>
            </div>
          </header>

          <section className="rounded-2xl border border-mist-gray/20 bg-ship-deck/60 p-6 sm:p-8">
            {children}
          </section>
        </div>
      </main>

      <aside
        aria-label="Ilustração temática da Grand Line"
        className="relative hidden overflow-hidden border-l border-mist-gray/15 bg-ship-deck lg:block"
      >
        <img
          src={bannerSrc}
          alt={bannerAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ocean-abyss via-ocean-abyss/40 to-transparent"
        />

        {(bannerCaptionTitle || bannerCaptionText) && (
          <div className="absolute inset-x-8 bottom-8 rounded-xl border border-mist-gray/20 bg-ocean-abyss/80 p-6 backdrop-blur-sm">
            {bannerCaptionTitle && (
              <h2 className="font-display text-xl font-bold text-treasure-gold">
                {bannerCaptionTitle}
              </h2>
            )}
            {bannerCaptionText && (
              <p className="mt-1.5 text-sm leading-relaxed text-parchment/90">
                {bannerCaptionText}
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
