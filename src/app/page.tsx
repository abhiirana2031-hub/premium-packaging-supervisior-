'use client';

import React, { useState, useEffect } from 'react';
import {
  Category,
  Company,
  Item,
  ProductionAuditLog,
  ProductionRecord,
  ReportGenerationRecord,
  ReportTemplate,
  Subcategory,
  UserProfile,
} from '@/types';
import { storage } from '@/lib/storage';
import { authService } from '@/lib/authService';
import { getTodayString } from '@/lib/dateUtils';
import { Sidebar, NavPage } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { QuickEntryView } from '@/components/views/QuickEntryView';
import { AddProductionEntryView } from '@/components/views/AddProductionEntryView';
import { VarianceAnalysisView } from '@/components/views/VarianceAnalysisView';
import { HistoryView } from '@/components/views/HistoryView';
import { ReportCenterView } from '@/components/views/ReportCenterView';
import { ProductMasterView } from '@/components/views/ProductMasterView';
import { CategoryManagementView } from '@/components/views/CategoryManagementView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { AuditTrailView } from '@/components/views/AuditTrailView';
import { SettingsView } from '@/components/views/SettingsView';
import { UsersView } from '@/components/views/UsersView';
import { ProductionSlipModal } from '@/components/ProductionSlipModal';
import { ReportPreviewModal } from '@/components/ReportPreviewModal';
import { InspectRecordModal } from '@/components/views/InspectRecordModal';
import { AuthModal } from '@/components/views/AuthModal';
import { MobileAppShell } from '@/components/mobile/MobileAppShell';
import { Layers } from 'lucide-react';

export default function PackagingSupervisorApp() {
  const [isClient, setIsClient] = useState(false);

  // Core Data States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => storage.getCurrentUser());
  const [company, setCompany] = useState<Company>(() => storage.getCompany());
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [subcategories, setSubcategories] = useState<Subcategory[]>(() => storage.getSubcategories());
  const [items, setItems] = useState<Item[]>(() => storage.getItems());
  const [records, setRecords] = useState<ProductionRecord[]>(() => storage.getProductionRecords());
  const [templates, setTemplates] = useState<ReportTemplate[]>(() => storage.getReportTemplates());
  const [auditLogs, setAuditLogs] = useState<ProductionAuditLog[]>(() => storage.getAuditLogs());
  const [reportLogs, setReportLogs] = useState<ReportGenerationRecord[]>(() => storage.getReportLogs());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => storage.getUsers());

  // UI States (Desktop portal)
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-18');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modals
  const [activeSlipRecord, setActiveSlipRecord] = useState<ProductionRecord | null>(null);
  const [inspectingRecord, setInspectingRecord] = useState<ProductionRecord | null>(null);
  const [activeReportPreview, setActiveReportPreview] = useState<{
    title: string;
    dateRangeDisplay: string;
    records: ProductionRecord[];
  } | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    storage.ensureInitialized();
    setSelectedDate(getTodayString());
    refreshAllData();

    // Listen to Google OAuth / Supabase login state changes with Whitelist rejection handler
    const unsubscribe = authService.initAuthListener(
      (newProfile) => {
        setAuthErrorMessage(null);
        setCurrentUser(newProfile);
        setAllUsers(storage.getUsers());
      },
      (unauthorizedErr) => {
        setAuthErrorMessage(unauthorizedErr);
        setCurrentUser(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const refreshAllData = () => {
    setCurrentUser(storage.getCurrentUser());
    setCompany(storage.getCompany());
    setCategories(storage.getCategories());
    setSubcategories(storage.getSubcategories());
    setItems(storage.getItems());
    setRecords(storage.getProductionRecords());
    setTemplates(storage.getReportTemplates());
    setAuditLogs(storage.getAuditLogs());
    setReportLogs(storage.getReportLogs());
    setAllUsers(storage.getUsers());
  };

  // Sign out and clear active session
  const handleLogout = async () => {
    await authService.signOut();
    storage.clearCurrentUser();
    setCurrentUser(null);
  };

  // Switch Active User / Persona
  const handleSwitchUser = (user: UserProfile) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
  };

  // Update Profile
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const res = storage.updateUserProfile(updated);
    setCurrentUser(res);
    setAllUsers(storage.getUsers());
  };

  // Update Company
  const handleUpdateCompany = (name: string) => {
    const res = storage.updateCompany(name);
    setCompany(res);
  };

  // Save new record
  const handleSaveRecord = (record: Partial<ProductionRecord>) => {
    const saved = storage.addProductionRecord(record as any);
    setRecords(storage.getProductionRecords());
    setAuditLogs(storage.getAuditLogs());
    return saved;
  };

  // Save batch
  const handleSaveBatch = (newRecords: Partial<ProductionRecord>[]) => {
    storage.addBatchProductionRecords(newRecords as any);
    setRecords(storage.getProductionRecords());
    setAuditLogs(storage.getAuditLogs());
  };

  // Delete Record
  const handleDeleteRecord = (id: string, reason?: string) => {
    storage.deleteProductionRecord(id, reason || 'Deleted by supervisor');
    setRecords(storage.getProductionRecords());
    setAuditLogs(storage.getAuditLogs());
  };

  // Save Item
  const handleSaveItem = (itemData: Partial<Item> & { itemName: string; itemCode: string; categoryId: string; subcategoryId: string }) => {
    storage.saveItem(itemData);
    setItems(storage.getItems());
    setAuditLogs(storage.getAuditLogs());
  };

  // Save Category & Subcategory
  const handleSaveCategory = (cat: Partial<Category> & { name: string }) => {
    storage.saveCategory(cat);
    setCategories(storage.getCategories());
  };

  const handleSaveSubcategory = (sub: Partial<Subcategory> & { categoryId: string; name: string }) => {
    storage.saveSubcategory(sub);
    setSubcategories(storage.getSubcategories());
  };

  const handleDeleteCategory = (catId: string) => {
    storage.deleteCategory(catId);
    setCategories(storage.getCategories());
    setSubcategories(storage.getSubcategories());
    setItems(storage.getItems());
  };

  // Save / Delete Report Template
  const handleSaveTemplate = (template: Partial<ReportTemplate> & { name: string }) => {
    storage.saveReportTemplate(template);
    setTemplates(storage.getReportTemplates());
  };

  const handleDeleteTemplate = (id: string) => {
    storage.deleteReportTemplate(id);
    setTemplates(storage.getReportTemplates());
  };

  // Log report export
  const handleLogReport = (format: 'pdf' | 'excel' | 'csv' | 'slip', reportNo: string) => {
    storage.logReportGeneration({
      templateName: activeReportPreview?.title || 'Production Report',
      reportNumber: reportNo,
      dateRangeDisplay: activeReportPreview?.dateRangeDisplay || 'Production Period',
      recordCount: activeReportPreview?.records.length || 0,
      format,
    });
    setReportLogs(storage.getReportLogs());
  };

  // Reset to seed defaults
  const handleResetData = () => {
    if (confirm('Are you sure you want to reload the real factory product catalog and reset all demo data?')) {
      storage.resetToDefaults();
      refreshAllData();
      alert('All 70 factory products & categories loaded successfully!');
    }
  };

  // Today count for badge
  const todayCount = records.filter((r) => r.productionDate === selectedDate).length;

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse mb-3 shadow-lg shadow-blue-500/30">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold tracking-wide">Loading Premium Packaging Supervisor...</p>
      </div>
    );
  }

  // Strict Authentication Gate: Show full-screen Sign In if not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full font-sans bg-slate-950 flex items-center justify-center p-4">
        <AuthModal
          isOpen={true}
          initialError={authErrorMessage}
          onLoginSuccess={(user) => {
            setAuthErrorMessage(null);
            storage.setCurrentUser(user);
            setCurrentUser(user);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. MOBILE INTERFACE: Automatically shown on mobile screens (< 768px), hidden on desktop */}
      <div className="block md:hidden min-h-screen w-full bg-slate-50">
        <MobileAppShell
          currentUser={currentUser}
          categories={categories}
          subcategories={subcategories}
          items={items}
          records={records}
          templates={templates}
          selectedDate={selectedDate}
          companyName={company.name}
          onSaveRecord={handleSaveRecord}
          onUpdateProfile={handleUpdateProfile}
          onSaveItem={handleSaveItem}
          onSaveCategory={handleSaveCategory}
          onLogout={handleLogout}
        />
      </div>

      {/* 2. DESKTOP DASHBOARD: Automatically shown on desktop (>= 768px), hidden on mobile */}
      <div className="hidden md:flex min-h-screen bg-slate-100 flex-col">
        <div className="flex-1 flex min-w-0">
        {/* Desktop Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page: NavPage) => {
            setCurrentPage(page);
            setMobileNavOpen(false);
          }}
          currentUser={currentUser}
          isOpenMobile={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          onLogout={handleLogout}
          todayCount={todayCount}
        />

        {/* Main App Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky Header */}
          <Header
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onQuickAction={(action) => {
              if (action === 'quick-entry') setCurrentPage('quick-entry');
              else if (action === 'add-entry') setCurrentPage('add-entry');
              else if (action === 'reports') setCurrentPage('reports');
            }}
            onResetData={handleResetData}
            onLogout={handleLogout}
          />

          {/* Dynamic Page Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {currentPage === 'dashboard' && (
              <DashboardView
                selectedDate={selectedDate}
                records={records}
                items={items}
                categories={categories}
                currentUser={currentUser}
                onNavigate={setCurrentPage}
                onOpenSlip={(rec) => setActiveSlipRecord(rec)}
                onInspectRecord={(rec) => setInspectingRecord(rec)}
              />
            )}

            {currentPage === 'quick-entry' && (
              <QuickEntryView
                items={items}
                categories={categories}
                subcategories={subcategories}
                currentUser={currentUser}
                onSaveBatch={handleSaveBatch}
                onNavigateHome={() => setCurrentPage('dashboard')}
              />
            )}

            {currentPage === 'add-entry' && (
              <AddProductionEntryView
                items={items}
                categories={categories}
                subcategories={subcategories}
                currentUser={currentUser}
                initialDate={selectedDate}
                onSaveRecord={handleSaveRecord}
                onCancel={() => setCurrentPage('dashboard')}
              />
            )}

            {currentPage === 'variance' && (
              <VarianceAnalysisView
                records={records}
                items={items}
                categories={categories}
                subcategories={subcategories}
                currentUser={currentUser}
              />
            )}

            {currentPage === 'history' && (
              <HistoryView
                records={records}
                items={items}
                categories={categories}
                subcategories={subcategories}
                currentUser={currentUser}
                onOpenSlip={(rec) => setActiveSlipRecord(rec)}
                onInspectRecord={(rec) => setInspectingRecord(rec)}
                onDeleteRecord={handleDeleteRecord}
                onTriggerExport={(filtered) =>
                  setActiveReportPreview({
                    title: 'Filtered Production Audit Report',
                    dateRangeDisplay: 'Selected Filter Period',
                    records: filtered,
                  })
                }
              />
            )}

            {currentPage === 'reports' && (
              <ReportCenterView
                templates={templates}
                records={records}
                items={items}
                categories={categories}
                currentUser={currentUser}
                reportLogs={reportLogs}
                onOpenReportPreview={(title, dateRangeDisplay, filteredRecords) =>
                  setActiveReportPreview({
                    title,
                    dateRangeDisplay,
                    records: filteredRecords,
                  })
                }
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
              />
            )}

            {currentPage === 'items' && (
              <ProductMasterView
                items={items}
                categories={categories}
                subcategories={subcategories}
                currentUser={currentUser}
                onSaveItem={handleSaveItem}
              />
            )}

            {currentPage === 'categories' && (
              <CategoryManagementView
                categories={categories}
                subcategories={subcategories}
                items={items}
                currentUser={currentUser}
                onSaveCategory={handleSaveCategory}
                onSaveSubcategory={handleSaveSubcategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {currentPage === 'analytics' && (
              <AnalyticsView
                records={records}
                items={items}
                categories={categories}
                currentUser={currentUser}
              />
            )}

            {currentPage === 'audit' && <AuditTrailView logs={auditLogs} />}

            {currentPage === 'settings' && (
              <SettingsView
                currentUser={currentUser}
                company={company}
                onUpdateProfile={handleUpdateProfile}
                onUpdateCompany={handleUpdateCompany}
              />
            )}

            {currentPage === 'users' && (
              <UsersView users={allUsers} currentUser={currentUser} />
            )}
          </main>
        </div>
      </div>
    </div>

      {/* Production Slip Modal */}
      <ProductionSlipModal
        record={activeSlipRecord}
        currentUser={currentUser}
        companyName={company.name}
        onClose={() => setActiveSlipRecord(null)}
      />

      {/* Report Preview & Export Center Modal */}
      {activeReportPreview && (
        <ReportPreviewModal
          reportTitle={activeReportPreview.title}
          dateRangeDisplay={activeReportPreview.dateRangeDisplay}
          records={activeReportPreview.records}
          items={items}
          currentUser={currentUser}
          companyName={company.name}
          onClose={() => setActiveReportPreview(null)}
          onLogReport={handleLogReport}
        />
      )}

      {/* Historical Record Inspection Modal */}
      <InspectRecordModal
        record={inspectingRecord}
        currentUser={currentUser}
        onClose={() => setInspectingRecord(null)}
        onOpenSlip={(rec) => {
          setInspectingRecord(null);
          setActiveSlipRecord(rec);
        }}
      />

    </div>
  );
}
