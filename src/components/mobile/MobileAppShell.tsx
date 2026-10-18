'use client';

import React, { useState } from 'react';
import {
  Category,
  Item,
  ProductionRecord,
  ReportTemplate,
  Subcategory,
  UserProfile,
} from '@/types';
import { MobileTab } from './MobileBottomNav';
import { MobileLoginScreen } from './MobileLoginScreen';
import { MobileProfileSetupScreen } from './MobileProfileSetupScreen';
import { MobileDashboardScreen } from './MobileDashboardScreen';
import { MobileQuickEntryScreen } from './MobileQuickEntryScreen';
import { MobileProductionListScreen } from './MobileProductionListScreen';
import { MobileItemDetailsScreen } from './MobileItemDetailsScreen';
import { MobileCategoryManagementScreen } from './MobileCategoryManagementScreen';
import { MobileItemMasterScreen } from './MobileItemMasterScreen';
import { MobileProductionHistoryScreen } from './MobileProductionHistoryScreen';
import { MobileAnalyticsScreen } from './MobileAnalyticsScreen';
import { MobileReportCenterScreen } from './MobileReportCenterScreen';
import { MobileGenerateReportScreen } from './MobileGenerateReportScreen';
import { MobilePdfPreviewScreen } from './MobilePdfPreviewScreen';
import { MobileExportOptionsScreen } from './MobileExportOptionsScreen';
import { MobileNavigationDrawer, MobileScreenView } from './MobileNavigationDrawer';
import { exportProductionPdf } from '@/lib/exportPdf';

export const MOBILE_SCREENS_LIST: { id: MobileScreenView; num: number; label: string }[] = [
  { id: 'login', num: 1, label: 'Login Screen' },
  { id: 'profile_setup', num: 2, label: 'Profile Setup' },
  { id: 'dashboard', num: 3, label: 'Dashboard' },
  { id: 'quick_entry', num: 4, label: 'Quick Production Entry' },
  { id: 'production_list', num: 5, label: 'Production List' },
  { id: 'item_details', num: 6, label: 'Item Details' },
  { id: 'categories', num: 7, label: 'Categories' },
  { id: 'item_master', num: 8, label: 'Item Master' },
  { id: 'history', num: 9, label: 'Production History' },
  { id: 'analytics', num: 10, label: 'Weight Variance' },
  { id: 'reports', num: 11, label: 'Report Center' },
  { id: 'generate_report', num: 12, label: 'Generate Report' },
  { id: 'pdf_preview', num: 13, label: 'PDF Report Preview' },
  { id: 'export_options', num: 14, label: 'Export Options' },
  { id: 'more_menu', num: 15, label: 'Navigation Menu' },
];

interface MobileAppShellProps {
  currentUser: UserProfile;
  categories: Category[];
  subcategories: Subcategory[];
  items: Item[];
  records: ProductionRecord[];
  templates: ReportTemplate[];
  selectedDate: string;
  companyName: string;
  activeScreen?: MobileScreenView;
  onScreenChange?: (screen: MobileScreenView) => void;
  onSaveRecord: (record: Partial<ProductionRecord>) => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSaveItem?: (item: Item) => void;
  onSaveCategory?: (category: Category) => void;
  onLogout?: () => void;
}

export function MobileAppShell({
  currentUser,
  categories,
  subcategories,
  items,
  records,
  templates,
  selectedDate,
  companyName,
  activeScreen: controlledScreen,
  onScreenChange,
  onSaveRecord,
  onUpdateProfile,
  onSaveItem,
  onSaveCategory,
  onLogout,
}: MobileAppShellProps) {
  // Current screen state
  const [internalScreen, setInternalScreen] = useState<MobileScreenView>(controlledScreen || 'dashboard');
  const [screenHistory, setScreenHistory] = useState<MobileScreenView[]>(['dashboard']);

  const currentScreen = controlledScreen || internalScreen;

  // Selected item for details
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Item>(items[0] || null);

  // Filter category in item master
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');

  // Preview records
  const [previewRecords, setPreviewRecords] = useState<ProductionRecord[]>(records);
  const [reportTitle, setReportTitle] = useState('Daily Production Report');
  const [dateRangeDisplay, setDateRangeDisplay] = useState('Today / Current Shift');

  // Navigation helpers
  const navigateTo = (screen: MobileScreenView) => {
    setScreenHistory((prev) => [...prev, screen]);
    setInternalScreen(screen);
    if (onScreenChange) onScreenChange(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setInternalScreen(prevScreen);
      if (onScreenChange) onScreenChange(prevScreen);
    } else {
      setInternalScreen('dashboard');
      if (onScreenChange) onScreenChange('dashboard');
    }
  };

  // Bottom Navigation tab click
  const handleSelectTab = (tab: MobileTab) => {
    switch (tab) {
      case 'home':
        navigateTo('dashboard');
        break;
      case 'production':
        navigateTo('quick_entry');
        break;
      case 'items':
        setActiveCategoryId('all');
        navigateTo('item_master');
        break;
      case 'reports':
        navigateTo('reports');
        break;
      case 'more':
        navigateTo('more_menu');
        break;
    }
  };

  // PDF Export wrapper
  const handleDownloadPdf = async () => {
    try {
      await exportProductionPdf({
        reportTitle,
        companyName,
        dateRangeDisplay,
        records: previewRecords,
        currentUser,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 overflow-hidden">
      {/* 1. Login Screen */}
      {currentScreen === 'login' && (
        <MobileLoginScreen
          onContinue={() => navigateTo('dashboard')}
          onOpenProfileSetup={() => navigateTo('profile_setup')}
        />
      )}

      {/* 2. Profile Setup */}
      {currentScreen === 'profile_setup' && (
        <MobileProfileSetupScreen
          currentUser={currentUser}
          onSave={(updated) => {
            onUpdateProfile(updated);
            navigateTo('dashboard');
          }}
          onBack={goBack}
        />
      )}

      {/* 3. Dashboard */}
      {currentScreen === 'dashboard' && (
        <MobileDashboardScreen
          currentUser={currentUser}
          records={records}
          selectedDate={selectedDate}
          onOpenQuickEntry={() => navigateTo('quick_entry')}
          onOpenProductionList={() => navigateTo('production_list')}
          onSelectTab={handleSelectTab}
          onOpenProfile={() => navigateTo('more_menu')}
          onSelectRecord={(rec) => {
            const matchedItem = items.find((i) => i.id === rec.itemId);
            if (matchedItem) {
              setSelectedItemForDetails(matchedItem);
              navigateTo('item_details');
            }
          }}
        />
      )}

      {/* 4. Quick Production Entry */}
      {currentScreen === 'quick_entry' && (
        <MobileQuickEntryScreen
          items={items}
          categories={categories}
          currentUser={currentUser}
          onSaveRecord={onSaveRecord}
          onBack={goBack}
        />
      )}

      {/* 5. Production List */}
      {currentScreen === 'production_list' && (
        <MobileProductionListScreen
          records={records}
          selectedDate={selectedDate}
          onBack={goBack}
          onOpenQuickEntry={() => navigateTo('quick_entry')}
          onSelectRecord={(rec) => {
            const matchedItem = items.find((i) => i.id === rec.itemId);
            if (matchedItem) {
              setSelectedItemForDetails(matchedItem);
              navigateTo('item_details');
            }
          }}
        />
      )}

      {/* 6. Item Details */}
      {currentScreen === 'item_details' && selectedItemForDetails && (
        <MobileItemDetailsScreen
          item={selectedItemForDetails}
          category={categories.find((c) => c.id === selectedItemForDetails.categoryId)}
          subcategory={subcategories.find((s) => s.id === selectedItemForDetails.subcategoryId)}
          onBack={goBack}
          onEdit={() => navigateTo('quick_entry')}
        />
      )}

      {/* 7. Category Management */}
      {currentScreen === 'categories' && (
        <MobileCategoryManagementScreen
          categories={categories}
          subcategories={subcategories}
          items={items}
          onBack={goBack}
          onSelectCategory={(catId) => {
            setActiveCategoryId(catId);
            navigateTo('item_master');
          }}
          onAddCategory={() => {}}
        />
      )}

      {/* 8. Item Master */}
      {currentScreen === 'item_master' && (
        <MobileItemMasterScreen
          items={items}
          categories={categories}
          initialCategoryId={activeCategoryId}
          onBack={goBack}
          onSelectItem={(item) => {
            setSelectedItemForDetails(item);
            navigateTo('item_details');
          }}
          onAddItem={() => navigateTo('quick_entry')}
        />
      )}

      {/* 9. Production History */}
      {currentScreen === 'history' && (
        <MobileProductionHistoryScreen
          records={records}
          onBack={goBack}
          onSelectRecord={(rec) => {
            const matchedItem = items.find((i) => i.id === rec.itemId);
            if (matchedItem) {
              setSelectedItemForDetails(matchedItem);
              navigateTo('item_details');
            }
          }}
        />
      )}

      {/* 10. Analytics / Variance */}
      {currentScreen === 'analytics' && (
        <MobileAnalyticsScreen records={records} onBack={goBack} />
      )}

      {/* 11. Report Center / Templates */}
      {currentScreen === 'reports' && (
        <MobileReportCenterScreen
          templates={templates}
          records={records}
          onBack={goBack}
          onOpenGenerateTab={() => navigateTo('generate_report')}
          onSelectTemplate={(tpl) => {
            setReportTitle(tpl.name);
            setDateRangeDisplay('Filtered Template Period');
            setPreviewRecords(records);
            navigateTo('pdf_preview');
          }}
          onCreateTemplate={() => navigateTo('generate_report')}
        />
      )}

      {/* 12. Generate Report Form */}
      {currentScreen === 'generate_report' && (
        <MobileGenerateReportScreen
          categories={categories}
          items={items}
          records={records}
          onBack={goBack}
          onOpenTemplates={() => navigateTo('reports')}
          onPreviewReport={(filtered, title, range) => {
            setPreviewRecords(filtered);
            setReportTitle(title);
            setDateRangeDisplay(range);
            navigateTo('pdf_preview');
          }}
        />
      )}

      {/* 13. PDF Report Preview */}
      {currentScreen === 'pdf_preview' && (
        <MobilePdfPreviewScreen
          records={previewRecords}
          currentUser={currentUser}
          reportTitle={reportTitle}
          dateRangeDisplay={dateRangeDisplay}
          onBack={goBack}
          onDownloadPdf={handleDownloadPdf}
          onOpenExportOptions={() => navigateTo('export_options')}
        />
      )}

      {/* 14. Export Options */}
      {currentScreen === 'export_options' && (
        <MobileExportOptionsScreen
          records={previewRecords}
          currentUser={currentUser}
          companyName={companyName}
          reportTitle={reportTitle}
          dateRangeDisplay={dateRangeDisplay}
          onBack={goBack}
        />
      )}

      {/* 15. More Navigation Menu Drawer */}
      {currentScreen === 'more_menu' && (
        <MobileNavigationDrawer
          currentUser={currentUser}
          onNavigate={(screen) => navigateTo(screen)}
          onClose={goBack}
          onLogout={() => {
            if (onLogout) onLogout();
            else navigateTo('login');
          }}
        />
      )}
    </div>
  );
}
