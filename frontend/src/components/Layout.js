import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  ChartPieSlice,
  UsersThree,
  UserCircle,
  Handshake,
  Wallet,
  FileText,
  CarProfile,
  MagnifyingGlass,
  Calculator,
  UsersFour,
  ClipboardText,
  GearSix,
  Database,
  SignOut,
  Bell,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    crm: true,
    finance: false,
    auto: false,
    team: false,
    settings: false
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if any item in section is active
  const isSectionActive = (items) => {
    return items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
  };

  // Navigation structure with groups
  const navGroups = [
    {
      id: 'dashboard',
      type: 'single',
      item: { path: '/admin', icon: ChartPieSlice, label: 'Дашборд' }
    },
    {
      id: 'crm',
      type: 'group',
      label: 'CRM',
      icon: UsersThree,
      items: [
        { path: '/admin/leads', icon: UsersThree, label: 'Ліди' },
        { path: '/admin/customers', icon: UserCircle, label: 'Клієнти' },
        { path: '/admin/deals', icon: Handshake, label: 'Угоди' },
      ]
    },
    {
      id: 'finance',
      type: 'group',
      label: 'Фінанси',
      icon: Wallet,
      items: [
        { path: '/admin/deposits', icon: Wallet, label: 'Депозити' },
        { path: '/admin/documents', icon: FileText, label: 'Документи' },
      ]
    },
    {
      id: 'auto',
      type: 'group',
      label: 'Авто',
      icon: CarProfile,
      items: [
        { path: '/admin/vehicles', icon: CarProfile, label: 'База авто' },
        { path: '/admin/vin', icon: MagnifyingGlass, label: 'VIN Пошук' },
        { path: '/admin/calculator', icon: Calculator, label: 'Калькулятор' },
      ],
      roles: ['master_admin', 'moderator']
    },
    {
      id: 'team',
      type: 'group',
      label: 'Команда',
      icon: UsersFour,
      items: [
        { path: '/admin/staff', icon: UsersFour, label: 'Співробітники' },
        { path: '/admin/tasks', icon: ClipboardText, label: 'Завдання' },
      ]
    },
    {
      id: 'settings',
      type: 'group',
      label: 'Налаштування',
      icon: GearSix,
      items: [
        { path: '/admin/parser', icon: Database, label: 'Парсер' },
        { path: '/admin/settings', icon: GearSix, label: 'Система' },
      ],
      roles: ['master_admin', 'moderator']
    }
  ];

  // Filter groups based on user role
  const visibleGroups = navGroups.filter(group => {
    if (!group.roles) return true;
    return group.roles.includes(user?.role);
  });

  const roleLabels = {
    master_admin: 'Головний адмін',
    admin: 'Адміністратор',
    moderator: 'Модератор',
    manager: 'Менеджер',
    finance: 'Фінанси'
  };

  return (
    <div className="flex h-screen bg-[#F7F7F8]">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="p-5 border-b border-[#E4E4E7]">
          <img 
            src="/images/logo.svg" 
            alt="Logo" 
            className="h-10 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto" data-testid="sidebar-nav">
          {visibleGroups.map((group) => {
            if (group.type === 'single') {
              // Single item (Dashboard)
              const { path, icon: Icon, label } = group.item;
              return (
                <NavLink
                  key={group.id}
                  to={path}
                  end
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                  data-testid={`nav-${label.toLowerCase()}`}
                >
                  <Icon size={20} weight="duotone" />
                  <span>{label}</span>
                </NavLink>
              );
            }

            // Group with items
            const isExpanded = expandedSections[group.id];
            const isActive = isSectionActive(group.items);
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="mb-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleSection(group.id)}
                  className={`sidebar-group-header ${isActive ? 'active' : ''}`}
                  data-testid={`nav-group-${group.id}`}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon size={20} weight="duotone" />
                    <span>{group.label}</span>
                  </div>
                  {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                </button>

                {/* Group Items */}
                {isExpanded && (
                  <div className="sidebar-group-items">
                    {group.items.map(({ path, icon: Icon, label }) => (
                      <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                          `sidebar-subitem ${isActive ? 'active' : ''}`
                        }
                        data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
                      >
                        <Icon size={16} weight="duotone" />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#E4E4E7]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#18181B] to-[#3F3F46] rounded-xl flex items-center justify-center text-sm font-semibold text-white shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#18181B] truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-[#71717A]">{roleLabels[user?.role] || user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#71717A] hover:text-[#DC2626] rounded-xl hover:bg-[#FEE2E2] transition-all"
            data-testid="logout-btn"
          >
            <SignOut size={18} weight="duotone" />
            <span>Вийти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-8">
          {/* Search */}
          <div className="w-80">
            <input 
              type="text" 
              placeholder="Пошук..." 
              className="input"
              data-testid="search-input"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="relative p-2.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] rounded-xl transition-all"
              data-testid="notifications-btn"
            >
              <Bell size={20} weight="duotone" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#DC2626] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
