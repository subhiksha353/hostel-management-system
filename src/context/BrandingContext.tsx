import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BrandingConfig {
  siteName: string;
  tagline: string;
  collegeName: string;
  logoUrl: string | null;
  logoType: 'shield' | 'graduation-cap' | 'sparkles' | 'building' | 'megaphone' | 'custom';
  supportEmail: string;
  emergencyPhone: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  siteName: 'CampusVoice',
  tagline: 'Your Voice. Your Privacy. Better Campus.',
  collegeName: 'National Institute of Technology',
  logoUrl: null,
  logoType: 'shield',
  supportEmail: 'grievance-support@campus.edu',
  emergencyPhone: '+91 1800-425-9999',
};

const STORAGE_KEY = 'campusvoice_branding_config_v1';

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (newConfig: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_BRANDING, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_BRANDING;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    } catch {
      // ignore
    }
    document.title = branding.siteName + ' — ' + branding.tagline;
  }, [branding]);

  const updateBranding = (newConfig: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...newConfig }));
  };

  const resetBranding = () => {
    setBranding(DEFAULT_BRANDING);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
