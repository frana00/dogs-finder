// Network configuration example for development
// Copy this file to network.config.js and update with your local settings

export const NETWORK_CONFIG = {
  // Your current local development IP (find it with `ipconfig` on Windows or `ifconfig` on Mac/Linux)
  DEV_IP: '192.168.1.100', // Replace with your actual IP
  
  // API port
  API_PORT: 8080,
  
  // Override IP if needed (set to null to use DEV_IP)
  OVERRIDE_IP: null, // e.g., '10.0.0.5' for specific network setup
  
  // Production URL (replace with your actual production server)
  PRODUCTION_URL: 'https://your-production-server.com'
};
