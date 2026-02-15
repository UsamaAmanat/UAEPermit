export type VisaEntryType = "single" | "multiple";

export interface VisaCard {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  price: number;
  currency: "USD";
  highlight?: boolean;
}

export interface CountrySEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}
export interface CountryContent {
  heading?: string;
  summary?: string;
  html?: string;
  updatedBy?: string;
  updatedAt?: any;
}

export interface CountryDocument {
  slug: string;
  name: string;
  code: string;
  region: string;
  status: "active" | "hidden" | "comingSoon";
  defaultVisaLabel?: string;
  defaultEntryType?: VisaEntryType;
  single: VisaCard[];
  multiple: VisaCard[];
  seo?: CountrySEO;

  content?: CountryContent;

  createdAt?: any;
  updatedAt?: any;
}


export type VisaPlan = {
  id: string;
  title: string;
  entryType: string;
  price: number;
  processingTime: string;
};
export type CountryAddons = {
  useGlobal?: boolean;
  extraFast?: {
    enabled: boolean;
    amount: number;
    currency: "USD";
    mode?: "per_applicant";
  } | null;
};

export type VisaConfig = {
  single: VisaPlan[];
  multiple: VisaPlan[];
  addons?: {
    extraFast?: {
      enabled: boolean;
      amount: number;
      currency: "USD";
      mode: "per_applicant";
    } | null;
  };
};

