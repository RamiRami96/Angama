// Single source of truth for brand colors.
// CommonJS so tailwind.config.js can require it; TypeScript code imports it via "@/shared/config".
const colors = {
  primary: "#4F46E5",
  secondary: "#06B6D4",
  accent: "#F59E0B",
  background: "#F8FAFC",
};

module.exports = { colors };
