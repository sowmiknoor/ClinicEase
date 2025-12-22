import { useLanguage } from './LanguageContext';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="language-toggle">
      <button 
        className="language-toggle-btn" 
        onClick={toggleLanguage}
        title={language === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন'}
      >
        <span className="lang-icon">🌐</span>
        <span className="lang-text">
          {language === 'en' ? 'বাংলা' : 'English'}
        </span>
      </button>
    </div>
  );
}
