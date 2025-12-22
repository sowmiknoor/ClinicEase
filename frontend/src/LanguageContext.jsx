import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get user-specific language preference
    const userId = localStorage.getItem('userId');
    if (userId) {
      // Check if user has language preference stored
      const userLanguage = localStorage.getItem(`userLanguage_${userId}`);
      if (userLanguage) {
        return userLanguage;
      }
      
      // Check if user object has language preference
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.language || 'en';
        } catch (e) {
          return 'en';
        }
      }
    }
    
    // Default to English if no user logged in or no preference found
    return 'en';
  });

  useEffect(() => {
    // Save user-specific language preference
    const userId = localStorage.getItem('userId');
    if (userId) {
      localStorage.setItem(`userLanguage_${userId}`, language);
      
      // Also update user object if exists
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.language = language;
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // Update document direction for Bengali (RTL support if needed in future)
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Update language when user changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const userLanguage = localStorage.getItem(`userLanguage_${userId}`);
        if (userLanguage && userLanguage !== language) {
          setLanguage(userLanguage);
        }
      } else {
        // User logged out, reset to English
        setLanguage('en');
      }
    };

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Check on component mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'bn' : 'en';
    setLanguage(newLanguage);
    
    // Save to backend if user is logged in
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        await fetch('/api/auth/update-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            language: newLanguage
          })
        });
      } catch (err) {
        console.error('Failed to save language preference:', err);
      }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English if translation not found
        value = translations['en'];
        for (const k2 of keys) {
          value = value?.[k2];
          if (value === undefined) return key;
        }
        return value;
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
