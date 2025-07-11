// Accessibility enhancements and keyboard navigation for Phase 3
import { useEffect, useRef } from 'react'

const AccessibilityEnhancements = ({ children }) => {
  const skipLinkRef = useRef(null)
  const mainContentRef = useRef(null)

  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyDown = (e) => {
      // Skip to main content shortcut (Alt + S)
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        mainContentRef.current?.focus()
      }

      // Focus trap for modals (if any are open)
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), a[href]:not([disabled])'
        )
        
        const modal = document.querySelector('[role="dialog"]')
        if (modal) {
          const modalFocusable = Array.from(modal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), a[href]:not([disabled])'
          ))
          
          if (modalFocusable.length > 0) {
            const firstElement = modalFocusable[0]
            const lastElement = modalFocusable[modalFocusable.length - 1]
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      // Close modal on Escape
      if (e.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]')
        if (modal) {
          const closeButton = modal.querySelector('[aria-label*="close"], [data-dismiss]')
          closeButton?.click()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSkipToMain = (e) => {
    e.preventDefault()
    mainContentRef.current?.focus()
  }

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <a 
        ref={skipLinkRef}
        href="#main-content" 
        className="skip-link"
        onClick={handleSkipToMain}
      >
        Skip to main content
      </a>
      
      {/* Main content wrapper with proper focus management */}
      <div 
        ref={mainContentRef}
        id="main-content"
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        {children}
      </div>
    </>
  )
}

// Hook for managing focus and announcements
export const useAccessibility = () => {
  const announceRef = useRef(null)

  // Announce messages to screen readers
  const announce = (message, priority = 'polite') => {
    if (!announceRef.current) {
      // Create announcement element if it doesn't exist
      const announcer = document.createElement('div')
      announcer.setAttribute('aria-live', priority)
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      announcer.style.cssText = `
        position: absolute !important;
        left: -10000px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      `
      document.body.appendChild(announcer)
      announceRef.current = announcer
    }

    // Clear previous message and announce new one
    announceRef.current.textContent = ''
    setTimeout(() => {
      announceRef.current.textContent = message
    }, 100)
  }

  // Focus management
  const focusElement = (selector, delay = 0) => {
    setTimeout(() => {
      const element = document.querySelector(selector)
      if (element) {
        element.focus()
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, delay)
  }

  // Set page title for navigation
  const setPageTitle = (title) => {
    document.title = `${title} - AI Medicine Safety Checker`
  }

  return {
    announce,
    focusElement,
    setPageTitle
  }
}

// Enhanced form accessibility hook
export const useFormAccessibility = (formRef) => {
  const { announce } = useAccessibility()

  const validateFormAccessibility = () => {
    if (!formRef.current) return

    const form = formRef.current
    const errors = []

    // Check for labels
    const inputs = form.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      const label = form.querySelector(`label[for="${input.id}"]`)
      const ariaLabel = input.getAttribute('aria-label')
      const ariaLabelledBy = input.getAttribute('aria-labelledby')
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        errors.push(`Input missing label: ${input.name || input.type}`)
      }
    })

    // Check for required field indicators
    const requiredInputs = form.querySelectorAll('[required]')
    requiredInputs.forEach(input => {
      const label = form.querySelector(`label[for="${input.id}"]`)
      if (label && !label.textContent.includes('*') && !input.getAttribute('aria-required')) {
        console.warn(`Required field may not be clearly indicated: ${input.name}`)
      }
    })

    return errors
  }

  const announceFormErrors = (errors) => {
    if (Object.keys(errors).length > 0) {
      const errorCount = Object.keys(errors).length
      const message = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}: ${Object.values(errors)[0]}`
      announce(message, 'assertive')
    }
  }

  return {
    validateFormAccessibility,
    announceFormErrors
  }
}

// Color contrast checker
export const checkColorContrast = (foreground, background) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  if (!fg || !bg) return null

  const fgLum = getLuminance(fg)
  const bgLum = getLuminance(bg)

  const ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05)

  return {
    ratio: ratio.toFixed(2),
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
  }
}

export default AccessibilityEnhancements
