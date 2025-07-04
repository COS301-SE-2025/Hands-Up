import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    chromeWebSecurity: false,
    specPattern: [
      "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
      "cypress/integration/**/*.cy.{js,jsx,ts,tsx}",
    ],
    // Add these simple retry and timeout configurations
    retries: {
      runMode: 2,    // Retry failed tests 2 times when running in CI
      openMode: 0    // No retries when running interactively
    },
    defaultCommandTimeout: 10000,  // Wait up to 10 seconds for commands
    pageLoadTimeout: 30000,        // Wait up to 30 seconds for page loads
    requestTimeout: 10000,         // Wait up to 10 seconds for network requests
  },
  
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});