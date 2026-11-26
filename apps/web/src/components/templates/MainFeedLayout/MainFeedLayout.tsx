import { useId, useState, type ReactNode } from 'react'
import { Badge, type BadgeVariant } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'
import { Sidebar } from '../../organisms/Sidebar'
import type { User } from '../../../types/domain'

export interface MainFeedLayoutProps {
  title: string
  subtitle: string
  badgeText: string
  badgeVariant?: BadgeVariant
  user: User | null
  onLogout?: () => void
  children: ReactNode
}

export function MainFeedLayout({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'info',
  user,
  onLogout,
  children,
}: MainFeedLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileDrawerId = useId()

  return (
    <div className="flex min-h-svh w-full flex-col bg-ocean-abyss text-parchment lg:flex-row">
      <header className="flex items-center justify-between border-b border-mist-gray/15 bg-ship-deck/90 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-grand-line.jpg"
            alt="Emblema do Grand Line Hub"
            className="h-9 w-9 rounded-full border border-treasure-gold/40 object-cover"
          />
          <span className="font-display text-base font-bold tracking-wider text-treasure-gold">
            Grand Line Hub
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-expanded={mobileMenuOpen}
          aria-controls={mobileDrawerId}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? 'Fechar Menu' : 'Menu'}
        </Button>
      </header>

      <div
        id={mobileDrawerId}
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:sticky lg:top-0 lg:block lg:h-svh lg:shrink-0`}
      >
        <Sidebar
          user={user}
          onLogout={onLogout}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      </div>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-3 border-b border-mist-gray/15 pb-6">
            <Badge variant={badgeVariant}>{badgeText}</Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base text-mist-gray">{subtitle}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
