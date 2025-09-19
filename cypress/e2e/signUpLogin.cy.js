/* global describe, it, cy, before, beforeEach */
describe('Landing Page', () => {
  before('visit the demo site', () => {
    cy.visit('http://localhost:3000');
  });

  it('should display the correct page title', () => {
    cy.contains('h1', 'Hands UP').should('be.visible');
  });

  describe('SignUp Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/signup');
      cy.intercept('POST', 'http://localhost:2000/handsUPApi/signup').as('signupApi');
    });

    it('should be on the right page', () => {
      cy.contains('h2', 'Join Us!').should('be.visible');
    });

    it('should display an error message when submitting with empty fields', () => {
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('contain', 'Please fill in all fields.');
    });

    it('should display an error message when submitting without accepting terms and conditions', () => {
      // Fill in all fields except for checking the terms and conditions
      cy.get('input[name="name"]').type('Test');
      cy.get('input[name="surname"]').type('User');
      cy.get('input[name="username"]').type('testuser123');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('Password!123');
      cy.get('input[name="confirmPassword"]').type('Password!123');

      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('contain', 'You must accept the terms and conditions to sign up.');
    });

    it('should successfully sign up with valid credentials and accepted terms', () => {
      const uniqueId = Date.now();
      const testEmail = `testuser${uniqueId}@example.com`;
      const testUsername = `testuser${uniqueId}`;

      cy.get('input[name="name"]').type('Valid');
      cy.get('input[name="surname"]').type('User');
      cy.get('input[name="username"]').type(testUsername);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('Password!123');
      cy.get('input[name="confirmPassword"]').type('Password!123');

      cy.get('#termsAccepted').check();

      cy.get('button[type="submit"]').click();

      cy.contains('h1', 'Welcome back').should('be.visible');
    });
  });

  describe('Login Page tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/login');
    });

    it('should display the correct page title', () => {
      cy.contains('h1', 'Welcome Back!').should('be.visible');
    });

    it('should display error messages for invalid input', () => {
      cy.get('[data-testid="login-button"]').click();
      cy.get('.error-message').should('contain', 'Please enter both email and password.');
    });

    // it('should singu with valid credentials', () => {
    // cy.intercept()
    // } )
  });
});