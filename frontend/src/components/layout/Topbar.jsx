import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function Topbar({ onOpenMobileNav, onTriggerSignOut }) {
  const { user, role } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMockNotificationClick = () => {
    addToast({
      title: 'Governance Notice',
      message: 'Monthly audit review scheduled for Nov 1st.',
      type: 'info',
    });
    setIsNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      {/* Left: Mobile Nav Toggle & Community Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 border-l border-slate-200 pl-3">
          <Building2 size={16} className="text-slate-400" />
          <span className="font-semibold text-slate-800">Greenwood Heights RWA</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            Reg. No: RWA/2021/489
          </span>
        </div>
      </div>

      {/* Right: Notification and User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Notifications Popover */}
        <div className="relative" ref={notifMenuRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            aria-label="Notifications"
            aria-expanded={isNotifOpen}
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-900">Governance Alerts</span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                  1 New
                </span>
              </div>
              <div className="mt-2 space-y-2">
                <div
                  onClick={handleMockNotificationClick}
                  className="cursor-pointer rounded-lg p-2 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-xs font-medium text-slate-800">FY 26-27 Audit Cycle</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click to view notice. Ledger verification scheduled.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-1.5 pr-2.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white uppercase">
              {user?.name ? user.name.charAt(0) : <User size={15} />}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.name || 'Member'}
              </div>
              <div className="text-[10px] font-medium text-slate-500 leading-tight">
                {role || 'Resident'}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50">
              <div className="border-b border-slate-100 px-3.5 py-2">
                <p className="text-xs font-semibold text-slate-900">{user?.name || 'Active Member'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'No email attached'}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit">
                  <Shield size={11} />
                  <span>Role: {role || 'Resident'}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onTriggerSignOut();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
