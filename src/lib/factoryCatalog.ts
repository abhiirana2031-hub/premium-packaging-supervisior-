import { Category, Item, Subcategory } from '@/types';

export const FACTORY_COMPANY_ID = 'comp_premium_pkg';

export const REAL_CATEGORIES: Category[] = [
  {
    id: 'cat_15kg_matka',
    companyId: FACTORY_COMPANY_ID,
    name: '15 KG Matka Jars',
    code: '15KG-MJ',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat_5kg_matka',
    companyId: FACTORY_COMPANY_ID,
    name: '5 KG Matka Jars',
    code: '5KG-MJ',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat_dvp_gvp',
    companyId: FACTORY_COMPANY_ID,
    name: 'DVP & GVP Jars (Dalda & Gagan)',
    code: 'DVP-GVP',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat_dw_jerry',
    companyId: FACTORY_COMPANY_ID,
    name: 'DW Containers & Jerry Cans (5L - 10L)',
    code: 'DW-JC',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat_2kg_buckets',
    companyId: FACTORY_COMPANY_ID,
    name: 'Dahi Buckets & 2 KG Matka Jars',
    code: 'BK-2KG',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'cat_small_jars',
    companyId: FACTORY_COMPANY_ID,
    name: 'Small Jars & Closures (60g - 300g)',
    code: 'SM-JAR',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'cat_misc_industrial',
    companyId: FACTORY_COMPANY_ID,
    name: 'Misc Industrial & Electrical Molding',
    code: 'MISC-IND',
    sortOrder: 7,
    isActive: true,
  },
];

export const REAL_SUBCATEGORIES: Subcategory[] = [
  // 15 KG Matka
  { id: 'sub_15kg_amul', categoryId: 'cat_15kg_matka', name: 'Amul & Saras Series', sortOrder: 1, isActive: true },
  { id: 'sub_15kg_dairy', categoryId: 'cat_15kg_matka', name: 'Madhusudan & Dairy Brands', sortOrder: 2, isActive: true },
  { id: 'sub_15kg_verka', categoryId: 'cat_15kg_matka', name: 'Verka IML Dairy Series', sortOrder: 3, isActive: true },
  { id: 'sub_15kg_other', categoryId: 'cat_15kg_matka', name: 'Patanjali & Multi-brand Jars', sortOrder: 4, isActive: true },

  // 5 KG Matka
  { id: 'sub_5kg_dairy', categoryId: 'cat_5kg_matka', name: '5 KG Standard Dairy Jars', sortOrder: 1, isActive: true },
  { id: 'sub_5kg_iml', categoryId: 'cat_5kg_matka', name: '5 KG IML Decorated Jars', sortOrder: 2, isActive: true },
  { id: 'sub_5kg_slim', categoryId: 'cat_5kg_matka', name: '5 KG Slim Series', sortOrder: 3, isActive: true },

  // DVP & GVP
  { id: 'sub_dvp_heavy', categoryId: 'cat_dvp_gvp', name: '15 KG/LT Heavy Industrial Jars', sortOrder: 1, isActive: true },
  { id: 'sub_dvp_retail', categoryId: 'cat_dvp_gvp', name: '1.68 KG & 4.2 KG Jars', sortOrder: 2, isActive: true },

  // DW & Jerry Cans
  { id: 'sub_dw_10kg', categoryId: 'cat_dw_jerry', name: '10 KG DW Milk Foods Jars', sortOrder: 1, isActive: true },
  { id: 'sub_jerry_5lt', categoryId: 'cat_dw_jerry', name: '5 LT Ghee & Jerry Cans', sortOrder: 2, isActive: true },

  // Dahi Buckets & 2 KG
  { id: 'sub_matka_2kg', categoryId: 'cat_2kg_buckets', name: '2 KG Matka Jars', sortOrder: 1, isActive: true },
  { id: 'sub_sudha_buckets', categoryId: 'cat_2kg_buckets', name: 'Sudha Dahi Buckets (2KG - 5KG)', sortOrder: 2, isActive: true },

  // Small Jars
  { id: 'sub_hamdard', categoryId: 'cat_small_jars', name: 'Hamdard Jars (60g - 125g)', sortOrder: 1, isActive: true },
  { id: 'sub_ghee_small', categoryId: 'cat_small_jars', name: 'Ghee & Food Jars (200g - 300g)', sortOrder: 2, isActive: true },

  // Misc
  { id: 'sub_misc_electrical', categoryId: 'cat_misc_industrial', name: 'Insulators & Covers', sortOrder: 1, isActive: true },
  { id: 'sub_misc_sports', categoryId: 'cat_misc_industrial', name: 'Sports Bases & Special Parts', sortOrder: 2, isActive: true },
];

interface RawItemDef {
  name: string;
  catId: string;
  subCatId: string;
  code: string;
  jar: number;
  cap: number;
  plastic: number;
  steel: number;
  notes?: string;
}

const RAW_FACTORY_ITEMS: RawItemDef[] = [
  // --- 15 KG Matka Jars ---
  { name: '15 KG Matka Jar Amul Lite', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-AMUL-LITE', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Amul Lite HW', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-AMUL-LTHW', jar: 400, cap: 80, plastic: 0, steel: 50, notes: 'Heavy Weight Spec' },
  { name: '15 KG Matka Jar Amul Masti', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-AMUL-MASTI', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Amul Masti HW', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-AMUL-MSTHW', jar: 400, cap: 80, plastic: 0, steel: 50, notes: 'Heavy Weight Spec' },
  { name: '15 KG Matka Jar Ananda SKM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-ANANDA-SKM', jar: 350, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Ananda SKM G+', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-ANANDA-G+', jar: 350, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Ananda TM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-ANANDA-TM', jar: 350, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Dev Milk SKM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-DEV-SKM', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Indo Milk', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-INDO-MILK', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar E1 Saras DTM Alwar', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-SARAS-ALWAR', jar: 360, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar E1 Saras DTM Ajmer', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-SARAS-AJMER', jar: 360, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Sindh Dairy', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-SINDH-DAIRY', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Terrestrial Food Top', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-TERRESTRIAL', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Nova Green', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_amul', code: '15MJ-NOVA-GREEN', jar: 380, cap: 80, plastic: 0, steel: 40 },

  // 15 KG Matka - Madhusudan & Other Dairy
  { name: '15 KG Matka Jar Madhusudan Active', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MADHU-ACT', jar: 405, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Madhusudan Active IML', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MADHU-ACT-IML', jar: 405, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Madhusudan Dhaba IML', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MADHU-DHABA', jar: 405, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Madhusudan Lite Vasudev', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MADHU-VASU', jar: 405, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Madhusudan Magic', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MADHU-MAGIC', jar: 405, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Madhusudan Magic IML', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MADHU-MAG-IML', jar: 405, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Modern Dairy SKM-Orange', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MOD-ORANGE', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Modern Dairy TM-Green', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MOD-GREEN', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Moo Spring Pahalwan', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MOO-PAHAL', jar: 360, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Moo Spring Super', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MOO-SUPER', jar: 360, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Moo Spring TM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MOO-TM', jar: 360, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Mother Dairy SKM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-MD-SKM', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar ONPO Milk', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-ONPO-MILK', jar: 385, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Param SKM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-PARAM-SKM', jar: 405, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Param TM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_dairy', code: '15MJ-PARAM-TM', jar: 405, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Patanjali SKM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_other', code: '15MJ-PATAN-SKM', jar: 385, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar Patanjali TM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_other', code: '15MJ-PATAN-TM', jar: 385, cap: 80, plastic: 0, steel: 40 },
  { name: '15 KG Matka Jar RS Foods TM', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_other', code: '15MJ-RS-TM', jar: 385, cap: 80, plastic: 0, steel: 40 },

  // 15 KG Matka - Verka IML Series
  { name: '15 KG Matka Jar Verka DTM AGHF IML', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_verka', code: '15MJ-VRK-DTM-AGHF', jar: 380, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Verka DTM BPLJSR IML', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_verka', code: '15MJ-VRK-DTM-BPL', jar: 380, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Verka SM BPLJSR IML', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_verka', code: '15MJ-VRK-SM-BPL', jar: 380, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Verka TM BPLJSR IML', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_verka', code: '15MJ-VRK-TM-BPL', jar: 380, cap: 80, plastic: 0, steel: 50 },
  { name: '15 KG Matka Jar Verka TM AGHF IML', catId: 'cat_15kg_matka', subCatId: 'sub_15kg_verka', code: '15MJ-VRK-TM-AGHF', jar: 380, cap: 80, plastic: 0, steel: 50 },

  // --- 5 KG Matka Jars ---
  { name: '5 KG Matka Jar Amul Kadhi', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-AMUL-KADHI', jar: 145, cap: 37, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Amul Lite', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-AMUL-LITE', jar: 145, cap: 37, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Amul Masti', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-AMUL-MASTI', jar: 145, cap: 37, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Ananda G+', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-ANANDA-G+', jar: 131, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Dev Milk SKM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-DEV-SKM', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Dev Milk TM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-DEV-TM', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Indo Milk', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-INDO-MILK', jar: 131, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Modern Dairy DTM-Blue', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-MOD-BLUE', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Modern Dairy SKM-Orange', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-MOD-ORANGE', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Modern Dairy TM-Green', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-MOD-GREEN', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Moo Spring Pahalwan', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-MOO-PAHAL', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Mother Dairy SKM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-MD-SKM', jar: 131, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Mother Dairy TM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-MD-TM', jar: 131, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar ONPO Milk', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-ONPO-MILK', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar ONPO Milk Light', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-ONPO-LIGHT', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Param DHAMAL', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-PARAM-DHAM', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Paras Lite', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-PARAS-LITE', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Paras Slim Mazedaar Lite', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-PARAS-SLIM', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Patanjali SKM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-PATAN-SKM', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Patanjali TM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-PATAN-TM', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar RS Foods TM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-RS-TM', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar RS Foods SKM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-RS-SKM', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Sardhana Dairy TM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-SARDHANA-TM', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Sindh Dairy', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-SINDH-DAIRY', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG MATKA Jar Snowcap Green', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-SNOW-GREEN', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Snowcap DTM Red', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-SNOW-RED', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Sudha', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-SUDHA', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Zum Zum Blue', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-ZUM-BLUE', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Zum Zum Red', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-ZUM-RED', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar E1 Saras SKM', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_dairy', code: '5MJ-SARAS-SKM', jar: 150, cap: 36, plastic: 8, steel: 0 },

  // 5 KG Matka - IML & Slim Series
  { name: '5 KG Matka Jar Madhusudan Active IML', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-MADHU-ACT-IML', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Madhusudan Dhaba IML', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-MADHU-DHABA-IML', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Madhusudan Lite Vasudev', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-MADHU-VASU', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Madhusudan Magic IML', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-MADHU-MAG-IML', jar: 155, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Verka DTM AGHF IML', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-VRK-DTM-AGHF', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Verka DTM BPLJSR IML', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-VRK-DTM-BPL', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Verka SM AGHF IML', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-VRK-SM-AGHF', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Verka SM BPLJSR IML', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-VRK-SM-BPL', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Verka TM BPLJSR IML', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_iml', code: '5MJ-VRK-TM-BPL', jar: 145, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Nova Slim Green', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_slim', code: '5MJ-NOVA-SLIM-GRN', jar: 136, cap: 36, plastic: 8, steel: 0 },
  { name: '5 KG Matka Jar Nova Slim Dhaba 4 5 Red', catId: 'cat_5kg_matka', subCatId: 'sub_5kg_slim', code: '5MJ-NOVA-SLIM-RED', jar: 136, cap: 36, plastic: 8, steel: 0 },

  // --- DVP & GVP Jars (Dalda & Gagan) ---
  { name: '1.68 KG DVP Jar KR Foods Dalda', catId: 'cat_dvp_gvp', subCatId: 'sub_dvp_retail', code: '1.68DVP-DALDA', jar: 73, cap: 23, plastic: 8, steel: 0 },
  { name: '4.2 KG DVP Jar KR Foods Dalda', catId: 'cat_dvp_gvp', subCatId: 'sub_dvp_retail', code: '4.2DVP-DALDA', jar: 164, cap: 23, plastic: 8, steel: 0 },
  { name: '15 KG DVP Jar KR Foods Dalda', catId: 'cat_dvp_gvp', subCatId: 'sub_dvp_heavy', code: '15DVP-DALDA', jar: 482, cap: 58, plastic: 0, steel: 40 },
  { name: '15 KG DVP Jar KR Foods Dalda Summer', catId: 'cat_dvp_gvp', subCatId: 'sub_dvp_heavy', code: '15DVP-DALDA-SMR', jar: 505, cap: 58, plastic: 0, steel: 40 },
  { name: '15 LT DVP Jar KR Foods Dalda', catId: 'cat_dvp_gvp', subCatId: 'sub_dvp_heavy', code: '15LT-DVP-DALDA', jar: 475, cap: 58, plastic: 0, steel: 40 },
  { name: '15 LT DVP Jar KR Foods Dalda Summer', catId: 'cat_dvp_gvp', subCatId: 'sub_dvp_heavy', code: '15LT-DVP-SMR', jar: 495, cap: 58, plastic: 0, steel: 40 },
  { name: '15 LT GVP Jar KR Foods Gagan', catId: 'cat_dvp_gvp', subCatId: 'sub_dvp_heavy', code: '15LT-GVP-GAGAN', jar: 475, cap: 58, plastic: 0, steel: 40 },
  { name: '15 LT GVP Jar KR Foods Gagan Summer', catId: 'cat_dvp_gvp', subCatId: 'sub_dvp_heavy', code: '15LT-GVP-SMR', jar: 495, cap: 58, plastic: 0, steel: 40 },

  // --- DW Containers & Jerry Cans ---
  { name: '10 KG DW Jar Alpha Milk Foods White Tea Time', catId: 'cat_dw_jerry', subCatId: 'sub_dw_10kg', code: '10DW-ALPHA-WTT', jar: 560, cap: 35, plastic: 12, steel: 0 },
  { name: '10 KG DW Jar Verka Blue', catId: 'cat_dw_jerry', subCatId: 'sub_dw_10kg', code: '10DW-VERKA-BLUE', jar: 560, cap: 35, plastic: 12, steel: 0 },
  { name: '5 LT Ghee Jar Mahaan Milk Foods', catId: 'cat_dw_jerry', subCatId: 'sub_jerry_5lt', code: '5LT-GHEE-MAHAAN', jar: 205, cap: 32, plastic: 8, steel: 0 },
  { name: '5 LT Jerry Can 200 Plain', catId: 'cat_dw_jerry', subCatId: 'sub_jerry_5lt', code: '5LT-JC-200-PLAIN', jar: 185, cap: 10, plastic: 0, steel: 0 },

  // --- Dahi Buckets & 2 KG Matka Jars ---
  { name: '2 KG Matka Jar ONPO Milk', catId: 'cat_2kg_buckets', subCatId: 'sub_matka_2kg', code: '2MJ-ONPO-MILK', jar: 74, cap: 15, plastic: 6, steel: 0 },
  { name: '2 KG Matka Jar Zum Zum Blue', catId: 'cat_2kg_buckets', subCatId: 'sub_matka_2kg', code: '2MJ-ZUM-BLUE', jar: 74, cap: 15, plastic: 6, steel: 0 },
  { name: '2 KG Matka Jar Zum Zum Red', catId: 'cat_2kg_buckets', subCatId: 'sub_matka_2kg', code: '2MJ-ZUM-RED', jar: 74, cap: 15, plastic: 6, steel: 0 },
  { name: '2 Kg Sudha Bucket Dahi Premium Supaul', catId: 'cat_2kg_buckets', subCatId: 'sub_sudha_buckets', code: '2BK-SUDHA-SUPAUL', jar: 77, cap: 20, plastic: 0, steel: 10 },
  { name: '2 Kg Sudha Bucket Dahi Premium Purnea', catId: 'cat_2kg_buckets', subCatId: 'sub_sudha_buckets', code: '2BK-SUDHA-PURNEA', jar: 77, cap: 20, plastic: 0, steel: 10 },
  { name: '5 Kg Bucket Sudha Dahi Smart Patna', catId: 'cat_2kg_buckets', subCatId: 'sub_sudha_buckets', code: '5BK-SUDHA-PATNA', jar: 173, cap: 50, plastic: 0, steel: 24 },
  { name: '5 Kg Bucket Sudha Dahi Smart Purnea', catId: 'cat_2kg_buckets', subCatId: 'sub_sudha_buckets', code: '5BK-SUDHA-PURNEA', jar: 173, cap: 50, plastic: 0, steel: 24 },
  { name: '5 Kg Bucket Sudha Dahi Smart Supaul', catId: 'cat_2kg_buckets', subCatId: 'sub_sudha_buckets', code: '5BK-SUDHA-SUPAUL', jar: 173, cap: 50, plastic: 0, steel: 24 },

  // --- Small Jars & Closures ---
  { name: '60 GM Hamdard Jar with Cap', catId: 'cat_small_jars', subCatId: 'sub_hamdard', code: '60G-HAMDARD-CAP', jar: 12, cap: 4.0, plastic: 0, steel: 0 },
  { name: '60 GM Hamdard Jar with Cap 10 gm', catId: 'cat_small_jars', subCatId: 'sub_hamdard', code: '60G-HAMDARD-10G', jar: 10, cap: 4.0, plastic: 0, steel: 0 },
  { name: '125 GM Hamdard Jar with Cap', catId: 'cat_small_jars', subCatId: 'sub_hamdard', code: '125G-HAMDARD-CAP', jar: 16, cap: 5.6, plastic: 0, steel: 0 },
  { name: '125 GM Hamdard Jar with Cap 15 gm', catId: 'cat_small_jars', subCatId: 'sub_hamdard', code: '125G-HAMDARD-15G', jar: 15, cap: 5.6, plastic: 0, steel: 0 },
  { name: '200 GM Ghee Jar Madhusudan Plain', catId: 'cat_small_jars', subCatId: 'sub_ghee_small', code: '200G-GHEE-MADHU', jar: 15.0, cap: 7.5, plastic: 0, steel: 0 },
  { name: '250/300 GM Hamdard Jar with Cap', catId: 'cat_small_jars', subCatId: 'sub_ghee_small', code: '250-300G-HAMDARD', jar: 27.5, cap: 7.0, plastic: 0, steel: 0 },
  { name: '250/300 GM Hamdard Jar with Cap 25 gm', catId: 'cat_small_jars', subCatId: 'sub_ghee_small', code: '250-300G-HAMD-25G', jar: 25.0, cap: 7.0, plastic: 0, steel: 0 },

  // --- Misc Industrial & Electrical Molding ---
  { name: 'Misc Diverter Cover', catId: 'cat_misc_industrial', subCatId: 'sub_misc_electrical', code: 'MISC-DIV-COVER', jar: 80, cap: 0, plastic: 0, steel: 0 },
  { name: 'Misc Lower Insulator M-20 Big', catId: 'cat_misc_industrial', subCatId: 'sub_misc_electrical', code: 'MISC-INSUL-M20-BIG', jar: 45, cap: 0, plastic: 0, steel: 0 },
  { name: 'Misc Lower Insulator M-20 Big 140', catId: 'cat_misc_industrial', subCatId: 'sub_misc_electrical', code: 'MISC-INSUL-M20-140', jar: 140, cap: 0, plastic: 0, steel: 0 },
  { name: 'Misc Lower Insulator', catId: 'cat_misc_industrial', subCatId: 'sub_misc_electrical', code: 'MISC-INSUL-STD', jar: 148, cap: 0, plastic: 0, steel: 0 },
  { name: 'Misc Lower Insulator 12', catId: 'cat_misc_industrial', subCatId: 'sub_misc_electrical', code: 'MISC-INSUL-12', jar: 12, cap: 0, plastic: 0, steel: 0 },
  { name: 'Misc Nylon Caps 250A', catId: 'cat_misc_industrial', subCatId: 'sub_misc_electrical', code: 'MISC-NYLON-CAP-250A', jar: 45, cap: 0, plastic: 0, steel: 0 },
  { name: 'MISC Basket Ball Base Medium Stag 2100 Pink', catId: 'cat_misc_industrial', subCatId: 'sub_misc_sports', code: 'MISC-STAG-2100-PNK', jar: 2100, cap: 0, plastic: 0, steel: 0 },
  { name: 'MISC Basket Ball Base Medium Stag 2100 Red', catId: 'cat_misc_industrial', subCatId: 'sub_misc_sports', code: 'MISC-STAG-2100-RED', jar: 2100, cap: 0, plastic: 0, steel: 0 },
  { name: 'MISC Basket Ball Base Medium Stag 2100 Black', catId: 'cat_misc_industrial', subCatId: 'sub_misc_sports', code: 'MISC-STAG-2100-BLK', jar: 2100, cap: 0, plastic: 0, steel: 0 },
];

export const REAL_FACTORY_ITEMS: Item[] = RAW_FACTORY_ITEMS.map((item, idx) => {
  const compTotal = Number((item.jar + item.cap + item.plastic + item.steel).toFixed(2));
  const tolPercentage = compTotal > 500 ? 1.8 : compTotal > 150 ? 2.0 : 2.5;
  const tolDelta = Number(((compTotal * tolPercentage) / 100).toFixed(2));

  return {
    id: `item_real_${idx + 1}`,
    companyId: FACTORY_COMPANY_ID,
    categoryId: item.catId,
    subcategoryId: item.subCatId,
    itemCode: item.code,
    itemName: item.name,
    itemDescription: `${item.name} packaging specification with approved component weights.`,
    jarWeight: item.jar > 0 ? item.jar : null,
    capWeight: item.cap > 0 ? item.cap : null,
    plasticHandleWeight: item.plastic > 0 ? item.plastic : null,
    steelHandleWeight: item.steel > 0 ? item.steel : null,
    otherComponentWeight: null,
    idealWeightMode: 'calculated',
    approvedIdealWeight: compTotal,
    calculatedComponentTotal: compTotal,
    toleranceLimits: {
      percentage: tolPercentage,
      minWeight: Number((compTotal - tolDelta).toFixed(2)),
      maxWeight: Number((compTotal + tolDelta).toFixed(2)),
    },
    targetProductionQty: compTotal > 500 ? 2500 : compTotal > 100 ? 6000 : 15000,
    notes: item.notes || 'Verified factory specification sheet.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z',
  };
});
