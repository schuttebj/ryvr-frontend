/**
 * Centralized Z-Index Constants
 * 
 * This file defines the z-index hierarchy for the entire application
 * to prevent conflicts and ensure proper layering.
 */

export const Z_INDEX = {
  // Base levels (0-999)
  BASE: 0,
  ABOVE_BASE: 1,
  
  // UI Elements (1000-9999)
  HEADER: 1000,
  NAVIGATION: 1100,
  SIDEBAR: 1200,
  TOOLBAR: 1300,
  
  // Overlays and Panels (10000-49999)
  OVERLAY: 10000,
  SIDE_PANEL: 20000,
  WORKFLOW_CONTROLS: 30000,
  
  // Settings and Configuration Panels (50000-59999)
  NODE_SETTINGS_PANEL: 50000,
  INTEGRATION_PANEL: 51000,
  
  // Modals and Dialogs (60000-69999)
  MODAL: 60000,
  DIALOG: 61000,
  EXPANDABLE_TEXT_MODAL: 62000,
  CONFIRMATION_DIALOG: 63000,
  
  // High Priority Modals (70000-79999)
  VARIABLE_SELECTOR: 70000,
  JSON_SCHEMA_BUILDER: 71000,
  WORKFLOW_TEMPLATE_MODAL: 72000,
  
  // Dropdowns and Menus (80000-89999)
  DROPDOWN: 80000,
  CONTEXT_MENU: 81000,
  SELECT_MENU: 82000,
  AUTOCOMPLETE: 83000,
  
  // Critical System UI (90000-99999)
  NOTIFICATION: 90000,
  ERROR_BOUNDARY: 91000,
  LOADING_OVERLAY: 92000,
  
  // Maximum (99999+)
  MAXIMUM: 99999,
  
  // Special cases - use sparingly
  FORCE_TOP: 999999,
} as const;

/**
 * Helper function to get a z-index value with optional offset
 */
export const getZIndex = (key: keyof typeof Z_INDEX, offset: number = 0): number => {
  return Z_INDEX[key] + offset;
};

/**
 * Helper function for Material-UI components that need z-index
 */
export const createZIndexSx = (key: keyof typeof Z_INDEX, offset: number = 0) => ({
  zIndex: getZIndex(key, offset),
});

/**
 * Material-UI Menu/Popover props with proper z-index
 */
export const getMenuProps = (baseZIndex: keyof typeof Z_INDEX = 'DROPDOWN') => ({
  PaperProps: {
    sx: {
      zIndex: getZIndex(baseZIndex),
    },
  },
  MenuListProps: {
    sx: {
      zIndex: getZIndex(baseZIndex),
    },
  },
});

/**
 * Material-UI Dialog props with proper z-index
 */
export const getDialogProps = (baseZIndex: keyof typeof Z_INDEX = 'DIALOG') => ({
  sx: {
    zIndex: getZIndex(baseZIndex),
  },
  componentsProps: {
    backdrop: {
      sx: {
        zIndex: getZIndex(baseZIndex, -1),
      },
    },
  },
});
