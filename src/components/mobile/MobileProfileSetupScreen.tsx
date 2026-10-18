'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Camera, User, Briefcase, Building, Phone, Hash } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { UserProfile } from '@/types';

interface MobileProfileSetupScreenProps {
  currentUser: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onBack: () => void;
}

export function MobileProfileSetupScreen({
  currentUser,
  onSave,
  onBack,
}: MobileProfileSetupScreenProps) {
  const [fullName, setFullName] = useState(currentUser.fullName || 'Rohit Sharma');
  const [designation, setDesignation] = useState(currentUser.designation || 'Production Supervisor');
  const [companyName, setCompanyName] = useState(currentUser.companyName || 'Premium Packaging');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [employeeId, setEmployeeId] = useState(currentUser.employeeId || 'EMP001');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName,
      designation,
      companyName,
      phone,
      employeeId,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <MobileStatusBar />

      {/* Top App Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1"
        >
          Skip
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between px-6 py-5 overflow-y-auto">
        <div className="space-y-5">
          {/* Header Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Complete Your Profile</h1>
            <p className="text-xs text-slate-500 mt-0.5">Please provide your details to continue</p>
          </div>

          {/* Avatar Section */}
          <div className="flex justify-center my-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/30 p-0.5 shadow-md bg-slate-100">
                <Image
                  src="/images/rohit_avatar.jpg"
                  alt="Profile Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 active:scale-95 transition-transform"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Designation
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Production Supervisor"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Company Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Premium Packaging"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP001"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] transition-all"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}
