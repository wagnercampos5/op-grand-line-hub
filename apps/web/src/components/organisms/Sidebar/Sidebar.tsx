import { Link, NavLink } from 'react-router-dom'
import { Avatar } from '../../atoms/Avatar'
import { Button } from '../../atoms/Button'
import { WantedStamp } from '../../atoms/WantedStamp'
import { AffiliationBadge } from '../../molecules/AffiliationBadge'
import type { User } from '../../../types/domain'

export interface SidebarProps {
  user: User | null
  onLogout?: () => void
  onNavigate?: () => void
}

const navItems = [
  {
    to: '/feed',
    label: 'Crônicas da Grand Line',
    description: 'Relatos, ilhas e Século Perdido',
  },
  {
    to: '/contracts',
    label: 'Mural de Contratos',
    description: 'Tripulações e caçadas ativas',
  },
] as const

export function Sidebar({ user, onLogout, onNavigate }: SidebarProps) {
  return (
    <aside
      aria-label="Menu lateral da plataforma"
      className="flex h-full w-full flex-col justify-between border-b border-mist-gray/15 bg-ship-deck/85 p-6 lg:w-72 lg:border-r lg:border-b-0"
    >
      <div className="space-y-8">
        <Link
          to="/feed"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-log-pose-cyan"
        >
          <img
            src="/logo-grand-line.jpg"
            alt="Emblema do Grand Line Hub"
            className="h-11 w-11 rounded-full border border-treasure-gold/45 object-cover"
          />
          <div>
            <span className="block font-display text-lg font-bold tracking-wider text-treasure-gold">
              Grand Line Hub
            </span>
            <span className="block text-xs text-mist-gray">
              Log Pose &amp; Editais
            </span>
          </div>
        </Link>

        <nav aria-label="Navegação principal" className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block rounded-xl border px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-log-pose-cyan ${
                  isActive
                    ? 'border-log-pose-cyan/45 bg-log-pose-cyan/15 text-log-pose-cyan'
                    : 'border-transparent text-parchment hover:border-mist-gray/25 hover:bg-ocean-abyss/50'
                }`
              }
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-0.5 block text-xs text-mist-gray">
                {item.description}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-8 border-t border-mist-gray/20 pt-6">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-parchment">
                  {user.name}
                </p>
                <div className="mt-1">
                  <AffiliationBadge affiliation={user.affiliation} />
                </div>
              </div>
            </div>

            <div>
              <WantedStamp
                amount={user.bounty}
                labelPrefix="Recompensa:"
                className="w-full justify-between"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => {
                onLogout?.()
                onNavigate?.()
              }}
            >
              Sair
            </Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-mist-gray/20 bg-ocean-abyss/60 p-4">
            <p className="text-xs leading-relaxed text-mist-gray">
              Navegando como visitante. Entre no convés para publicar crônicas,
              curtir, comentar e emitir contratos.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={onNavigate}
                className="inline-flex w-full items-center justify-center rounded-lg bg-treasure-gold px-4 py-2 text-sm font-semibold text-ocean-abyss transition-colors hover:bg-treasure-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-treasure-gold"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={onNavigate}
                className="inline-flex w-full items-center justify-center rounded-lg border border-parchment/35 px-4 py-2 text-sm font-medium text-parchment transition-colors hover:border-treasure-gold hover:text-treasure-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-treasure-gold"
              >
                Alistar-se
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
