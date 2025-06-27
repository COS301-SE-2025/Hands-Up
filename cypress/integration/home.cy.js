/* global describe, it, cy, before*/
describe('Home Page', () => {
    before('visit the demo site', () => {
    cy.visit('http://localhost:3000/signup');
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

      cy.contains('Your journey to mastering sign language starts here. Connect, learn, and translate with ease.').should('be.visible');
      cy.get('.learning-overview-section').should('be.visible');
      cy.contains('.learning-progress-card h3', 'Overall Progress').should('be.visible');
      cy.contains('.learning-stats-summary-card h3', 'Your Learning Stats').should('be.visible');
        cy.get('.sign-of-the-day-section').should('be.visible');
      cy.get('.sign-of-the-day-section .section-title').should('include.text', 'Sign of the Day:');
      cy.get('.sign-of-the-day-section video').should('be.visible').and('have.attr', 'src');
      cy.get('.sign-of-the-day-section .sign-description p').should('not.be.empty');
      cy.contains('.sign-of-the-day-section a', 'Explore More Signs').should('be.visible').and('have.attr', 'href', '/learnVideo');
    });

});