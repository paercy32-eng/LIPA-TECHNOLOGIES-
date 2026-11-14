"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/dashboard/home', icon: '🏠' },
    { name: 'Team', path: '/dashboard/team', icon: '👥' },
    { name: 'Profile', path: '/dashboard/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Page Content goes here */}
      <main className="p-4">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-gray-800 border-t border-gray-700 flex justify-around p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex flex-col items-center text-sm ${isActive ? 'text-green-500' : 'text-gray-400'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
