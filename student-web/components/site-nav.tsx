'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '../lib/site-data';

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Primary">
      <div className="site-nav-track">
        {NAV_ITEMS.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <div className="site-nav-item" key={item.href}>
              <Link className={`site-nav-link ${isActive ? 'is-active' : ''}`} href={item.href}>
                {item.label}
              </Link>
              {index < NAV_ITEMS.length - 1 ? <span className="site-nav-divider" aria-hidden="true" /> : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
