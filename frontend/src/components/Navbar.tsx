import { Link, NavLink } from 'react-router';

const NAV_ITEMS = [
  { to: '/movies', label: 'Movies' },
  { to: '/rewatch-plan', label: 'Rewatch Plan' },
  { to: '/booking', label: 'Watch-Party Booking' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
        <Link to="/movies" className="group inline-block">
          <span className="font-heading block text-3xl leading-none tracking-wider text-slate-900 sm:text-4xl">
            DOOMSDAY{' '}
            <span className="text-indigo-600 transition group-hover:text-indigo-500">
              READY
            </span>
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            MCU Rewatch Planner &amp; Opening-Night Booking
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
