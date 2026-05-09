'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { href: '/welcome', label: 'Home', icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { href: '/explore', label: 'Explore', icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    )},
    { href: '/post/new', label: 'Post', icon: (_active: boolean) => (
      <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center -mt-5 shadow-lg">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    )},
    { href: '/profile/edit', label: 'Profile', icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )},
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-safe">
      {tabs.map(({ href, label, icon }) => {
        const active = pathname === href || (href === '/welcome' && pathname === '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 py-3 px-4 min-w-0 ${
              href === '/post/new' ? '' : active ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            {icon(active)}
            {href !== '/post/new' && (
              <span className="text-[10px] font-medium">{label}</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
