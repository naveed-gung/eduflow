/**
 * EduFlow App State Reset Utility
 * ---------------------------------
 * This script can be copy-pasted into your browser console to reset
 * the application state when you encounter issues after deployment.
 * 
 * It clears:
 * - Local storage
 * - Session storage
 * - IndexedDB databases
 * - Cookies
 * 
 * Usage:
 * 1. Open your browser's developer tools (F12 or right-click > Inspect)
 * 2. Go to the Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter to execute
 */

(async function resetAppState() {
  console.log('🧹 EduFlow App State Reset Starting...');
  
  // Clear localStorage
  console.log('Clearing localStorage...');
  const localStorageItems = { ...localStorage };
  Object.keys(localStorageItems).forEach(key => {
    console.log(`Removing localStorage item: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage
  console.log('Clearing sessionStorage...');
  const sessionStorageItems = { ...sessionStorage };
  Object.keys(sessionStorageItems).forEach(key => {
    console.log(`Removing sessionStorage item: ${key}`);
    sessionStorage.removeItem(key);
  });
  
  // Clear cookies
  console.log('Clearing cookies...');
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    console.log(`Removing cookie: ${name}`);
  }
  
  // Attempt to clear IndexedDB
  console.log('Attempting to clear IndexedDB...');
  const databases = await window.indexedDB.databases();
  databases.forEach(db => {
    console.log(`Deleting IndexedDB database: ${db.name}`);
    try {
      window.indexedDB.deleteDatabase(db.name);
    } catch (e) {
      console.error(`Failed to delete database ${db.name}:`, e);
    }
  });
  
  console.log('✅ App state reset complete!');
  console.log('Reloading page in 3 seconds...');
  
  // Reload the page after a short delay
  setTimeout(() => {
    window.location.reload(true); // Force reload from server
  }, 3000);
})(); 