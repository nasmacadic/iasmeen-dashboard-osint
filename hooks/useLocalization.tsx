import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Language, Translations } from '../types';
import { translations } from '../constants';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string | { [key: string]: any };
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = useCallback((key: string): string | { [key: string]: any } => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        result = result[k];
      } else {
        return key; // Return key if not found
      }
    }
    return result as string | { [key: string]: any };
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};