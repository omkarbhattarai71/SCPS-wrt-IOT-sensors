/**
 * Main Dashboard Container Component
 * 
 * This is the refactored version of the Dashboard component.
 * 
 * Key improvements:
 * - Split into 8 focused components
 * - Custom hooks for data fetching  
 * - Centralized constants
 * - Memoized computed values
 * - Proper error handling and loading states
 * - Removed anti-patterns (window.location.href)
 * 
 * Props:
 * @param {string} token - Authentication token
 * @param {function} setToken - Function to update token state
 */

export { default } from "./Dashboard/index";
