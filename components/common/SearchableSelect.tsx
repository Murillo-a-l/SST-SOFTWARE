import React, { useState, useEffect, useRef } from 'react';

interface Option {
  id: number | string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  onAddNew?: (searchTerm: string) => void;
  addNewLabel?: (searchTerm: string) => string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, onAddNew, addNewLabel, disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    } else {
      setSearchTerm('');
    }
  }, [value, selectedOption]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(selectedOption ? selectedOption.label : '');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, selectedOption]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const exactMatchFound = options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase());

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (e.target.value === '') {
        onChange(null);
    }
  };
  
  const handleAddNew = () => {
      if (onAddNew && searchTerm) {
          onAddNew(searchTerm);
          setSearchTerm('');
          setIsOpen(false);
      }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
      />
      {isOpen && !disabled && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.map(option => (
            <li
              key={option.id}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 cursor-pointer hover:bg-indigo-50"
            >
              {option.label}
            </li>
          ))}
          {onAddNew && addNewLabel && searchTerm && !exactMatchFound && (
            <li className="px-3 py-2 border-t">
                <button type="button" onClick={handleAddNew} className="text-indigo-600 hover:underline w-full text-left text-sm">
                    {addNewLabel(searchTerm)}
                </button>
            </li>
          )}
          {filteredOptions.length === 0 && (!onAddNew || !addNewLabel || !searchTerm || exactMatchFound) && (
             <li className="px-3 py-2 text-sm text-gray-500">Nenhuma opção encontrada</li>
          )}
        </ul>
      )}
    </div>
  );
};