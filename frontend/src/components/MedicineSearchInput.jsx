import { useState, useEffect, useRef, useCallback } from 'react'
import { getMedicineSuggestions, searchMedicine } from '../services/api'

function MedicineSearchInput({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Enter medicine name (e.g., Dolo, Pantop D, Crocin)",
  disabled = false 
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceTimer = useRef(null)

  // Debounced function to fetch suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await getMedicineSuggestions(query.trim(), 8)
      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions)
        setShowSuggestions(response.suggestions.length > 0)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer for debounced API call
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const selectedValue = suggestion.genericName || suggestion.value || suggestion.display
    onChange(selectedValue)
    if (onSelect) {
      onSelect(suggestion)
    }
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      
      case 'Escape':
        setSuggestions([])
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return (
    <div className="medicine-search-container">
      <div className="medicine-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="medicine-input"
          autoComplete="off"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-owns={showSuggestions ? "medicine-suggestions" : undefined}
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
          }
        />
        
        {isLoading && (
          <div className="loading-indicator">
            <span className="loading-spinner">⟳</span>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          id="medicine-suggestions"
          className="suggestions-dropdown"
          role="listbox"
          aria-label="Medicine suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              id={`suggestion-${index}`}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSuggestionSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="suggestion-main">
                {suggestion.commonName || suggestion.display}
              </div>
              <div className="suggestion-generic">
                {suggestion.genericName}
              </div>
            </div>
          ))}
          
          <div className="suggestions-footer">
            <small>Use ↑↓ to navigate, Enter to select, Esc to close</small>
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 2 && (
        <div className="no-suggestions">
          <div className="no-suggestions-message">
            No suggestions found. Try entering generic name or brand name.
          </div>
          <div className="common-examples">
            <small>Common examples: Dolo, Pantop D, Crocin, Brufen, Omez</small>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineSearchInput
