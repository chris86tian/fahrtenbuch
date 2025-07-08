// Vite Preview Script - Fixed DOM Access
(function() {
  'use strict';

  // Wait for DOM to be ready
  function waitForDOM(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  // Safe DOM element access with null checks
  function safeGetElement(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      console.warn('Preview script: Failed to find element with selector:', selector);
      return null;
    }
  }

  // Safe classList manipulation
  function safeToggleClass(element, className, add = true) {
    if (!element || !element.classList) {
      console.warn('Preview script: Element or classList not available');
      return false;
    }
    
    try {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
      return true;
    } catch (e) {
      console.warn('Preview script: Failed to toggle class:', className, e);
      return false;
    }
  }

  // Inspector functionality with proper error handling
  function setInspectorActive(active = true) {
    // Try multiple common selectors for the root element
    const selectors = ['#root', 'body', 'html', '[data-inspector-root]'];
    let targetElement = null;

    for (const selector of selectors) {
      targetElement = safeGetElement(selector);
      if (targetElement) break;
    }

    if (!targetElement) {
      console.warn('Preview script: No suitable target element found for inspector');
      return false;
    }

    const className = 'vite-inspector-active';
    return safeToggleClass(targetElement, className, active);
  }

  // Initialize inspector when DOM is ready
  function initializeInspector() {
    try {
      // Check if we're in development mode
      if (typeof window !== 'undefined' && window.location) {
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '3000';
        
        if (isDev) {
          console.log('Preview script: Inspector initialized in development mode');
          // Only activate inspector in development
          setInspectorActive(false); // Start inactive
        }
      }
    } catch (e) {
      console.warn('Preview script: Failed to initialize inspector:', e);
    }
  }

  // Keyboard shortcut handler
  function handleKeyboardShortcuts(event) {
    try {
      // Toggle inspector with Ctrl+Shift+I (or Cmd+Shift+I on Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        const root = safeGetElement('#root') || safeGetElement('body');
        if (root && root.classList) {
          const isActive = root.classList.contains('vite-inspector-active');
          setInspectorActive(!isActive);
        }
      }
    } catch (e) {
      console.warn('Preview script: Keyboard shortcut handler error:', e);
    }
  }

  // Main initialization
  waitForDOM(function() {
    try {
      initializeInspector();
      
      // Add keyboard event listener
      if (typeof document !== 'undefined') {
        document.addEventListener('keydown', handleKeyboardShortcuts);
      }
      
      console.log('Preview script: Successfully loaded');
    } catch (e) {
      console.error('Preview script: Initialization failed:', e);
    }
  });

  // Expose functions globally for debugging (development only)
  if (typeof window !== 'undefined' && window.location && 
      (window.location.hostname === 'localhost' || window.location.port === '3000')) {
    window.__vitePreview = {
      setInspectorActive,
      safeGetElement,
      safeToggleClass
    };
  }

})();
