import { useState, useEffect, useRef } from 'react';
import './MedicineAutocomplete.css';

export default function MedicineAutocomplete({ value, onChange, onSelect, placeholder, index }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch medicines from API
  const fetchMedicines = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using DIMS API or fallback to our backend
      const response = await fetch(`/api/medicines/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.ok && data.medicines) {
        setSuggestions(data.medicines);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && value.length >= 2) {
        fetchMedicines(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSelect = (medicine) => {
    onChange(medicine.name);
    if (onSelect) {
      onSelect(medicine);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestions([]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="medicine-autocomplete" ref={wrapperRef}>
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Start typing medicine name..."}
          className="medicine-input"
          autoComplete="off"
        />
        {loading && (
          <div className="autocomplete-loader">
            <div className="spinner-small"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((medicine, idx) => (
            <li
              key={medicine.id || idx}
              className={`suggestion-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(medicine)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div className="medicine-info">
                <div className="medicine-name">{medicine.name}</div>
                {medicine.genericName && (
                  <div className="medicine-generic">{medicine.genericName}</div>
                )}
                {medicine.manufacturer && (
                  <div className="medicine-manufacturer">
                    {medicine.manufacturer}
                  </div>
                )}
                <div className="medicine-meta">
                  {medicine.strength && (
                    <span className="medicine-strength">{medicine.strength}</span>
                  )}
                  {medicine.form && (
                    <span className="medicine-form">{medicine.form}</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && !loading && suggestions.length === 0 && value.length >= 2 && (
        <div className="no-suggestions">
          No medicines found. You can still enter manually.
        </div>
      )}
    </div>
  );
}
