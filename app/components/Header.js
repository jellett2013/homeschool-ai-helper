'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timeout = setTimeout(() => setLogoLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/logo.svg"
            alt="Homeschool Helper logo"
            className={`h-8 w-auto transform transition duration-500 ease-in-out group-hover:scale-110 ${
              logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          />
          <span className="text-xl font-bold text-blue-700 tracking-tight">Homeschool Helper</span>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-blue-600 transition">Curriculum Explorer</Link>
          <Link href="/schedule" className="hover:text-blue-600 transition">Weekly Schedule</Link>
          <Link href="/profiles" className="hover:text-blue-600 transition">Student Profiles</Link>
          <Link href="/about" className="hover:text-blue-600 transition">About</Link>
        </nav>
      </div>

      {/* Animated Mobile Menu */}
      <div
        className={`sm:hidden px-4 pb-4 space-y-2 text-sm font-medium text-gray-700 transition-all duration-300 ease-in-out origin-top ${
          menuOpen ? 'max-h-40 opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95 overflow-hidden'
        }`}
      >
        <Link href="/" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Curriculum Explorer</Link>
        <Link href="/schedule" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Weekly Schedule</Link>
        <Link href="/profiles" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>Student Profiles</Link>
        <Link href="/about" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>About</Link>
      </div>
    </header>
  );
}
