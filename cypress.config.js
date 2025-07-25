import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    chromeWebSecurity: false,
    specPattern: [
      "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
      "cypress/integration/**/*.cy.{js,jsx,ts,tsx}",
    ],
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
