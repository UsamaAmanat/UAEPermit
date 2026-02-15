/**
 * Global Color Palette
 * Single source of truth for all app colors
 * Update here to change colors everywhere
 */

export const COLORS = {
  // Primary Brand Colors
  primary: {
    navy: "#3C4161", // Main navy blue
    teal: "#62E9C9", // Teal accent
    darkTeal: "#0c4d3d", // Dark teal (backgrounds)
  },

  // Semantic Aliases (for clarity in specific contexts)
  brand: {
    primary: "#3C4161",
    secondary: "#62E9C9",
    tertiary: "#0c4d3d",
  },

  // Usage-specific shortcuts
  button: {
    primary: "#62E9C9", // Teal for primary CTAs
    primaryText: "#0c4d3d", // Dark text on teal buttons
    secondary: "#3C4161", // Navy for secondary buttons
  },

  text: {
    primary: "#3C4161", // Navy for primary text
    accent: "#62E9C9", // Teal for accented text
    dark: "#0c4d3d", // Dark teal for emphasis
  },

  background: {
    primary: "#3C4161", // Navy backgrounds
    accent: "#62E9C9", // Teal accents
    dark: "#0c4d3d", // Dark backgrounds
    light: "#F8FAFF", // Light blue-gray
  },

  border: {
    primary: "#62E9C9", // Teal borders
    secondary: "#3C4161", // Navy borders
  },

  gradient: {
    primary: {
      from: "#3C4161",
      to: "#0c4d3d",
    },
    accent: {
      from: "#62E9C9",
      to: "#7ff5de",
    },
  },

  // Opacity variations (for creating tints)
  opacity: {
    primary: {
      10: "rgba(60, 65, 97, 0.10)",
      15: "rgba(60, 65, 97, 0.15)",
      20: "rgba(60, 65, 97, 0.20)",
      30: "rgba(60, 65, 97, 0.30)",
    },
    accent: {
      8: "rgba(98, 233, 201, 0.08)",
      10: "rgba(98, 233, 201, 0.10)",
      15: "rgba(98, 233, 201, 0.15)",
      20: "rgba(98, 233, 201, 0.20)",
      30: "rgba(98, 233, 201, 0.30)",
      60: "rgba(98, 233, 201, 0.60)",
    },
    dark: {
      15: "rgba(12, 77, 61, 0.15)",
      20: "rgba(12, 77, 61, 0.20)",
    },
  },
} as const;

// Export individual colors for convenience
export const {
  primary: { navy, teal, darkTeal },
  button: { primaryText },
  gradient: { primary: primaryGradient, accent: accentGradient },
} = COLORS;
