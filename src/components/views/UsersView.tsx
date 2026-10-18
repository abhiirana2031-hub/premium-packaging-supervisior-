'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Mail,
  Phone,
  Clock,
  Layers,
  CheckCircle2,
  X,
  Lock,
  Edit2,
  Trash2,
  Power,
  Copy,
  KeyRound,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, UserRole } from '@/types';
import { PackagingStorage } from '@/lib/storage';
import { authService } from '@/lib/authService';
import { SHIFT_OPTIONS, PRODUCTION_LINES } from '@/lib/constants';
import { getSupabaseClient } from '@/lib/supabaseClient';

interface UsersViewProps {
  currentUser: UserProfile;
  users?: UserProfile[];
}

export function UsersView({ currentUser, users: initialUsers }: UsersViewProps) {
  const [users, setUsers] = useState<UserProfile[]>(() => initialUsers || PackagingStorage.getInstance().getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string } | null>(null);

  // New user form state
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('Production Supervisor');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('supervisor');
  const [defaultShift, setDefaultShift] = useState(SHIFT_OPTIONS[0]);
  const [defaultLine, setDefaultLine] = useState(PRODUCTION_LINES[0]);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('Supervisor@2026');

  // Edit user form state
  const [editFullName, setEditFullName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('supervisor');
  const [editShift, setEditShift] = useState(SHIFT_OPTIONS[0]);
  const [editLine, setEditLine] = useState(PRODUCTION_LINES[0]);
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const loadUsers = async () => {
    // 1. Fetch fresh from Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: UserProfile[] = data.map((u: any) => ({
            id: u.id,
            companyId: u.company_id || 'comp_premium_pkg',
            companyName: 'Premium Packaging Industries',
            fullName: u.full_name,
            designation: u.designation,
            email: u.email || '',
            phone: u.phone || '',
            role: (u.role as UserRole) || 'supervisor',
            employeeId: u.employee_id || 'EMP001',
            status: u.preferences?.status || u.status || 'active',
            preferences: u.preferences || { defaultShift: 'Day Shift', defaultLine: 'Line 1', weightUnit: 'g', status: 'active' },
            createdAt: u.created_at || new Date().toISOString(),
            updatedAt: u.updated_at || new Date().toISOString(),
          }));
          setUsers(mapped);
          localStorage.setItem('pps_users_v2', JSON.stringify(mapped));
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch remote users:', err);
      }
    }

    // 2. Fallback to local storage
    const localUsers = PackagingStorage.getInstance().getUsers();
    setUsers(localUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditDesignation(user.designation);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditShift(user.preferences?.defaultShift || SHIFT_OPTIONS[0]);
    setEditLine(user.preferences?.defaultLine || PRODUCTION_LINES[0]);
    setEditEmployeeId(user.employeeId || '');
    setEditPassword(user.preferences?.password || user.password || '');
  };

  // Submit Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      alert('Full Name and Email are required.');
      return;
    }

    setIsLoading(true);
    try {
      const initialPass = password.trim() || 'Supervisor@2026';
      const res = await authService.adminCreateUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        designation: designation.trim(),
        employeeId: employeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
        defaultShift,
        defaultLine,
        password: initialPass,
      });

      if (res.error) {
        alert('Error creating user: ' + res.error);
        setIsLoading(false);
        return;
      }

      setCreatedCredentials({
        email: email.trim().toLowerCase(),
        pass: initialPass,
      });
      setSuccessMessage(`User "${fullName}" created successfully! Give the credentials to the user.`);

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setEmployeeId('');
      setPassword('Supervisor@2026');
      setShowAddModal(false);
      await loadUsers();
    } catch (err: any) {
      alert('Failed to create user: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Edit User
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const updates: Partial<UserProfile> = {
        fullName: editFullName.trim(),
        designation: editDesignation.trim(),
        phone: editPhone.trim(),
        role: editRole,
        employeeId: editEmployeeId.trim(),
        preferences: {
          ...editingUser.preferences,
          defaultShift: editShift,
          defaultLine: editLine,
          password: editPassword.trim() || editingUser.preferences?.password,
        },
      };

      const res = await authService.adminUpdateUser(editingUser.id, updates);
      if (res.error) {
        alert('Error updating user: ' + res.error);
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`User "${editFullName}" updated successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      alert('Failed to update user: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Deactivate / Activate
  const handleToggleStatus = async (user: UserProfile) => {
    if (user.id === currentUser.id || user.email.toLowerCase() === currentUser.email.toLowerCase()) {
      alert('You cannot deactivate your own active Administrator account.');
      return;
    }

    const currentStatus = user.preferences?.status || user.status || 'active';
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const confirmMsg = nextStatus === 'inactive'
      ? `Are you sure you want to deactivate ${user.fullName}? They will be blocked from logging in immediately.`
      : `Re-activate ${user.fullName}?`;

    if (!confirm(confirmMsg)) return;

    try {
      await authService.adminUpdateUser(user.id, {
        status: nextStatus,
        preferences: {
          ...user.preferences,
          status: nextStatus,
        },
      });
      await loadUsers();
    } catch (err: any) {
      alert('Error updating user status: ' + err.message);
    }
  };

  // Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    if (deletingUser.id === currentUser.id || deletingUser.email.toLowerCase() === currentUser.email.toLowerCase()) {
      alert('You cannot delete your own Administrator account.');
      setDeletingUser(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.adminDeleteUser(deletingUser.id);
      if (!res.success) {
        alert('Failed to delete user: ' + res.error);
      } else {
        setSuccessMessage(`User "${deletingUser.fullName}" permanently removed.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        await loadUsers();
      }
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
    } finally {
      setIsLoading(false);
      setDeletingUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      (u.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Admin Control Panel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Plant User & Supervisor Access Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Strict Whitelist Policy: Only personnel created here can log in via Work Email or Google OAuth.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Factory User</span>
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Created Credentials Modal Card */}
      {createdCredentials && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/50 border border-blue-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
              <KeyRound className="w-4 h-4" />
              <span>New User Login Credentials Generated</span>
            </div>
            <button
              onClick={() => setCreatedCredentials(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] font-sans font-bold uppercase">User Email (ID):</span>
              <span className="text-slate-900 dark:text-white font-bold">{createdCredentials.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans font-bold uppercase">Password:</span>
              <span className="text-slate-900 dark:text-white font-bold">{createdCredentials.pass}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-500">
              Share these credentials with the user. They can log in using either this Password or their matching Google account.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.pass}`);
                alert('Credentials copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Credentials</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="supervisor">Supervisors</option>
            <option value="manager">Production Managers</option>
            <option value="admin">Administrators</option>
          </select>
          <span className="text-xs text-slate-400 font-bold ml-2">{filteredUsers.length} Authorized Users</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User & Role</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Shift & Line</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredUsers.map((u) => {
                const isInactive = u.preferences?.status === 'inactive' || u.status === 'inactive';
                const isSelf = u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase();

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                      isInactive ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center shrink-0 ${
                            isInactive ? 'bg-slate-400' : 'bg-blue-600'
                          }`}
                        >
                          {u.fullName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {isSelf && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border mt-0.5 ${getRoleBadge(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{u.designation}</td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{u.preferences?.defaultShift || 'Day Shift'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{u.preferences?.defaultLine || 'Line 1'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{u.employeeId || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {isInactive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          title="Edit User Details & Password"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Deactivate/Activate Button */}
                        {!isSelf && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isInactive
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                            }`}
                            title={isInactive ? 'Activate User' : 'Deactivate User'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        {!isSelf && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete User Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Add New Authorized User</h3>
                  <p className="text-[11px] text-slate-500">Create plant credentials for employee or supervisor</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Shift In-Charge"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email (Login ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Production Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Default Shift</label>
                  <select
                    value={defaultShift}
                    onChange={(e) => setDefaultShift(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    {SHIFT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Default Line</label>
                  <select
                    value={defaultLine}
                    onChange={(e) => setDefaultLine(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold truncate"
                  >
                    {PRODUCTION_LINES.map((l) => (
                      <option key={l} value={l}>
                        {l.split('—')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-025"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Supervisor@2026"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium font-mono focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isLoading ? 'Creating User...' : 'Create User & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit User Details & Password</h3>
                  <p className="text-[11px] text-slate-500">Updating settings for {editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    disabled
                    value={editEmail}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-xl font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Production Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Default Shift</label>
                  <select
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    {SHIFT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Default Line</label>
                  <select
                    value={editLine}
                    onChange={(e) => setEditLine(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold truncate"
                  >
                    {PRODUCTION_LINES.map((l) => (
                      <option key={l} value={l}>
                        {l.split('—')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editEmployeeId}
                    onChange={(e) => setEditEmployeeId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Set / Reset Password
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium font-mono focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>{isLoading ? 'Saving Changes...' : 'Save Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm">Delete User Account?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deletingUser.fullName}</span> ({deletingUser.email})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
