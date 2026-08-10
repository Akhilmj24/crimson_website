/**
 * Universal Button & API Tracker
 * Automatically tracks button clicks across the entire application,
 * disables the clicked button, displays a sleek animated spinner,
 * and re-enables the button once all associated API/async calls finish.
 */

// Track active button and pending request counters
let lastClickedButton = null;
let lastClickTimestamp = 0;
const CLICK_WINDOW_MS = 600; // Time window after click to associate initiated API calls

const buttonRequestCounts = new WeakMap();
const buttonCleanupTimers = new WeakMap();

/**
 * Creates or retrieves the SVG spinner element
 */
const createSpinnerElement = () => {
  const span = document.createElement('span');
  span.className = 'btn-spinner-icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `
    <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  `;
  return span;
};

/**
 * Applies the loading and disabled state to a button element
 */
export const startButtonLoading = (btn) => {
  if (!btn || !(btn instanceof HTMLElement)) return;

  // Clear any pending cleanup timer
  if (buttonCleanupTimers.has(btn)) {
    clearTimeout(buttonCleanupTimers.get(btn));
    buttonCleanupTimers.delete(btn);
  }

  const currentCount = (buttonRequestCounts.get(btn) || 0) + 1;
  buttonRequestCounts.set(btn, currentCount);

  if (currentCount === 1) {
    btn.setAttribute('data-loading', 'true');
    btn.setAttribute('aria-busy', 'true');
    btn.classList.add('btn-loading-state');
    btn.disabled = true;

    // Check if spinner already exists
    if (!btn.querySelector('.btn-spinner-icon')) {
      const spinner = createSpinnerElement();
      // Insert at the beginning of the button
      if (btn.firstChild) {
        btn.insertBefore(spinner, btn.firstChild);
      } else {
        btn.appendChild(spinner);
      }
    }
  }
};

/**
 * Removes the loading state and re-enables the button element
 */
export const stopButtonLoading = (btn, immediate = false) => {
  if (!btn || !(btn instanceof HTMLElement)) return;

  const currentCount = Math.max(0, (buttonRequestCounts.get(btn) || 1) - 1);
  buttonRequestCounts.set(btn, currentCount);

  if (currentCount <= 0) {
    buttonRequestCounts.delete(btn);

    const cleanup = () => {
      // If a new request arrived during the debounce period, don't clean up
      if ((buttonRequestCounts.get(btn) || 0) > 0) return;

      btn.removeAttribute('data-loading');
      btn.removeAttribute('aria-busy');
      btn.classList.remove('btn-loading-state');
      btn.disabled = false;

      const spinner = btn.querySelector('.btn-spinner-icon');
      if (spinner) {
        spinner.remove();
      }
      buttonCleanupTimers.delete(btn);
    };

    if (immediate) {
      cleanup();
    } else {
      // 60ms grace window for sequential chained fetches (e.g., save -> refresh)
      const timer = setTimeout(cleanup, 60);
      buttonCleanupTimers.set(btn, timer);
    }
  }
};

/**
 * Tracks an explicit async function or promise for a specific button
 */
export const trackAsyncAction = async (buttonOrEvent, asyncFnOrPromise) => {
  let btn = null;
  if (buttonOrEvent) {
    if (buttonOrEvent instanceof HTMLElement) {
      btn = buttonOrEvent.closest('button') || buttonOrEvent;
    } else if (buttonOrEvent.target && buttonOrEvent.target.closest) {
      btn = buttonOrEvent.target.closest('button');
    }
  }

  if (!btn) {
    return typeof asyncFnOrPromise === 'function' ? await asyncFnOrPromise() : await asyncFnOrPromise;
  }

  startButtonLoading(btn);
  try {
    const res = typeof asyncFnOrPromise === 'function' ? await asyncFnOrPromise() : await asyncFnOrPromise;
    return res;
  } finally {
    stopButtonLoading(btn);
  }
};

/**
 * Initializes the universal DOM event and Fetch interceptors
 */
export const initApiButtonTracker = () => {
  if (typeof window === 'undefined') return;

  // Prevent multiple initializations
  if (window.__API_BUTTON_TRACKER_INITIALIZED__) return;
  window.__API_BUTTON_TRACKER_INITIALIZED__ = true;

  // 1. Capture click events across the entire DOM
  window.addEventListener(
    'click',
    (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      // If button is currently in loading state, block duplicate actions
      if (btn.getAttribute('data-loading') === 'true' || btn.classList.contains('btn-loading-state')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Record this button as the most recently activated button
      lastClickedButton = btn;
      lastClickTimestamp = Date.now();
    },
    true // Capture phase to guarantee interception before React handlers
  );

  // 2. Capture form submit events
  window.addEventListener(
    'submit',
    (e) => {
      const form = e.target;
      if (!form || !(form instanceof HTMLFormElement)) return;

      let submitBtn = e.submitter;
      if (!submitBtn || !(submitBtn instanceof HTMLButtonElement)) {
        submitBtn =
          form.querySelector('button[type="submit"]') ||
          form.querySelector('button:not([type="button"])');
      }

      if (submitBtn) {
        if (submitBtn.getAttribute('data-loading') === 'true' || submitBtn.classList.contains('btn-loading-state')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        lastClickedButton = submitBtn;
        lastClickTimestamp = Date.now();
      }
    },
    true
  );

  // 3. Intercept window.fetch to automatically link API calls to active buttons
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    let associatedBtn = null;
    const now = Date.now();

    // Check if an action button was clicked recently or is still active
    if (lastClickedButton && (now - lastClickTimestamp <= CLICK_WINDOW_MS || (buttonRequestCounts.get(lastClickedButton) || 0) > 0)) {
      associatedBtn = lastClickedButton;
    }

    if (associatedBtn) {
      startButtonLoading(associatedBtn);
    }

    try {
      const response = await originalFetch.apply(this, args);
      return response;
    } catch (error) {
      throw error;
    } finally {
      if (associatedBtn) {
        stopButtonLoading(associatedBtn);
      }
    }
  };
};

// Auto-run initialization immediately on module import
initApiButtonTracker();
