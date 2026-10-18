'use client';

import React, { useState } from 'react';
import { Company, UserProfile } from '@/types';
import { Settings, User, Building, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';
import { formatDateTimeIST } from '@/lib/dateUtils';
import { SHIFT_OPTIONS, PRODUCTION_LINES } from '@/lib/constants';

interface SettingsViewProps {
  currentUser: UserProfile;
  company: Company;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUpdateCompany: (name: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  company,
  onUpdateProfile,
  onUpdateCompany,
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [designation, setDesignation] = useState(currentUser.designation);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [employeeId, setEmployeeId] = useState(currentUser.employeeId || '');
  const [companyName, setCompanyName] = useState(company.name);

  // Preferences
  const [defaultShift, setDefaultShift] = useState(
    currentUser.preferences?.defaultShift || SHIFT_OPTIONS[0]
  );
  const [defaultLine, setDefaultLine] = useState(
    currentUser.preferences?.defaultLine || PRODUCTION_LINES[0]
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [stampTime, setStampTime] = useState('18-10-2026, 10:00 AM IST');

  React.useEffect(() => {
    setStampTime(formatDateTimeIST(new Date()));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      fullName: fullName.trim(),
      designation: designation.trim(),
      phone: phone.trim(),
      email: email.trim(),
      employeeId: employeeId.trim(),
      preferences: {
        defaultShift,
        defaultLine,
        weightUnit: 'g',
      },
    });

    if (companyName.trim() && companyName !== company.name) {
      onUpdateCompany(companyName.trim());
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Settings className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              User Profile & Authority Settings (Section 3)
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Supervisor Credentials & Plant Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Changes to your name and designation will immediately update on all generated reports, slips, and exports.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile & plant settings updated successfully! New signatures are now active.</span>
        </div>
      )}

      {/* Live Report Stamp Preview (Section 3 requirement) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Live Report & Slip Header Stamp Preview
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Auto-Stamped on Every Export
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-extrabold text-white text-sm">
              {companyName.toUpperCase()}
            </p>
            <p className="text-emerald-400 font-semibold text-xs mt-0.5">
              Verified by Supervisor: {fullName}
            </p>
            <p className="text-slate-400 text-[11px]">
              Designation: <span className="text-slate-200 font-medium">{designation}</span> • Emp ID: {employeeId || 'N/A'}
            </p>
          </div>

          <div className="sm:text-right text-[11px] text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
            <p>Certified Stamp • Premium Packaging Supervisor</p>
            <p className="font-mono text-emerald-400">{stampTime}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Supervisor Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Designation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Production Supervisor"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company Name (Defaults to Premium Packaging)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>
        </div>

        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pt-4 pb-2 flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-600" />
          Plant Defaults & Operational Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Shift
            </label>
            <select
              value={defaultShift}
              onChange={(e) => setDefaultShift(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
            >
              {SHIFT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Production Line
            </label>
            <select
              value={defaultLine}
              onChange={(e) => setDefaultLine(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
            >
              {PRODUCTION_LINES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Update Profile & Authority Stamp
          </button>
        </div>
      </form>
    </div>
  );
};
