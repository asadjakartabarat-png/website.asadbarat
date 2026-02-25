'use client';

import { useState } from 'react';
import { User } from '@/types/pasanggiri';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const MENU_ITEMS = {
  SUPER_ADMIN: [
    { id: 'users', label: 'Manajemen User', icon: '👥' },
    { id: 'competitions', label: 'Pertandingan', icon: '🥋' },
    { id: 'administrasi', label: 'Administrasi Pertandingan', icon: '📋' },
    { id: 'details', label: 'Detail Penilaian', icon: '📊' },
    { id: 'logs', label: 'Log Aktivitas', icon: '📝' },
    { id: 'system', label: 'Sistem', icon: '⚙️' },
  ],
  ADMIN: [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'competitions', label: 'Ranking', icon: '🥋' },
    { id: 'administrasi', label: 'Administrasi Pertandingan', icon: '📋' },
    { id: 'details', label: 'Detail Penilaian', icon: '📈' },
    { id: 'users', label: 'User', icon: '👥' },
    { id: 'logs', label: 'Log Aktivitas', icon: '📝' },
  ],
  KOORDINATOR: [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'competitions', label: 'Supervisi Sesi', icon: '🥋' },
    { id: 'results', label: 'Ranking', icon: '🏆' },
    { id: 'details', label: 'Detail Penilaian', icon: '📋' },
  ],
  SIRKULATOR: [
    { id: 'control', label: 'Kontrol Sesi', icon: '🥋' },
    { id: 'results', label: 'Hasil', icon: '🏆' },
  ],
  JURI: [
    { id: 'scoring', label: 'Penilaian', icon: '✍️' },
    { id: 'history', label: 'Riwayat', icon: '📚' },
  ],
  VIEWER: [
    { id: 'results', label: 'Hasil', icon: '🏆' },
    { id: 'ranking', label: 'Ranking', icon: '🥇' },
  ],
};

export default function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getRoleKey = (role: string) => {
    if (role.includes('KOORDINATOR')) return 'KOORDINATOR';
    if (role.includes('SIRKULATOR')) return 'SIRKULATOR';
    if (role.includes('JURI')) return 'JURI';
    return role;
  };

  const menuItems = MENU_ITEMS[getRoleKey(user.role) as keyof typeof MENU_ITEMS] || [];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🥋</span>
            <div>
              <h1 className="font-bold text-lg text-gray-900">PASANGGIRI</h1>
              <p className="text-xs text-gray-500">{user.username}</p>
            </div>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-gray-100">
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
              activeTab === item.id
                ? 'bg-red-100 text-red-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span className="font-medium flex-1 text-left">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <span>🚪</span>
            <span className="text-sm font-medium">Keluar</span>
          </button>
        )}
        {isCollapsed && (
          <button onClick={onLogout} className="w-full flex justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg">
            🚪
          </button>
        )}
      </div>
    </div>
  );
}
