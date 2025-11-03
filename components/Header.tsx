'use client';

import React from 'react';
import { UserIcon, AdminIcon, LogoutIcon } from './icons';

interface HeaderProps {
  currentMode: 'user' | 'admin';
  onToggleMode: () => void;
  isAdminAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, onToggleMode, isAdminAuthenticated, onLogout }) => {
  const renderButton = () => {
    if (currentMode === 'admin' && isAdminAuthenticated) {
      return (
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600 dark:focus:ring-offset-gray-900"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      );
    }
    
    const isUserView = currentMode === 'user';
    const text = isUserView ? 'Admin View' : 'User View';
    const Icon = isUserView ? AdminIcon : UserIcon;
    
    return (
      <button
        onClick={onToggleMode}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-900"
      >
        <Icon />
        <span>{text}</span>
      </button>
    );
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Club Points Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage member attendance, activity performance, and total points.
          </p>
        </div>
        {renderButton()}
      </div>
    </header>
  );
};

export default Header;
