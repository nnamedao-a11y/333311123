/**
 * Public Header Component
 * 
 * Навігація для публічного сайту
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MagnifyingGlass, Car, House, List } from '@phosphor-icons/react';

const PublicHeader = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Головна', icon: House },
    { path: '/vehicles', label: 'Авто', icon: Car },
    { path: '/vin-check', label: 'VIN перевірка', icon: MagnifyingGlass },
  ];

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/images/logo.svg" 
              alt="BIBI Cars" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-zinc-900' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                >
                  <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-zinc-600"
            data-testid="mobile-menu-btn"
          >
            <List size={24} />
          </button>

          {/* Admin Link */}
          <Link
            to="/admin"
            className="hidden md:block text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            data-testid="admin-link"
          >
            Адмін
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
