/* global describe, it, cy, before*/
describe('User Profile Page tests', () => {
    before('visit the demo site', () => {
    cy.visit('http://localhost:3000/signup');
  });
    it('should update user profile with valid data', () => {
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

      cy.visit('http://localhost:3000/userProfile');
      cy.contains('button', 'Edit Profile').should('be.visible');
      cy.contains('button', 'View Terms and Conditions').should('be.visible');
      cy.contains('button', 'Log Out').should('be.visible');
      cy.contains('button', 'Delete Account').should('be.visible');
      cy.contains('button', 'Edit Profile').click();
      cy.get('.edit-form-overlay').should('be.visible');
      cy.get('.edit-form-container h3').should('contain', 'Edit Profile');
      cy.get('.edit-form-container').contains('button', 'Cancel').click();
      cy.get('.edit-form-overlay').should('not.exist');

      cy.contains('button', 'Edit Profile').click();
      cy.get('input#username').type('123');
      cy.get('input#name').type('cc');
    cy.get('input#surname').type('NewSurname');
    cy.get('input#username').type('newusername123');
      cy.contains('button', 'Save Changes').click();

        cy.contains('h1', 'Validcc UserNewSurname').should('be.visible');
        
      cy.contains('button', 'Delete Account').click();
      cy.get('.modal-overlay').should('be.visible');
      cy.get('.modal-content h2').should('contain', 'Confirm Account Deletion');
      cy.get('.modal-content').should('contain', 'Deleting your account is a permanent action.');

      cy.contains('.modal-footer button', 'Proceed').click();
      cy.get('.modal-content h2').should('contain', 'Final Confirmation');
      cy.get('.modal-content').should('contain', 'To confirm deletion, please type "DELETE"');

      cy.get('.confirmation-input').type('WRONG');

    cy.contains('.modal-footer button', 'Cancel').click();
    cy.contains('button', 'Log Out').click();
    cy.url().should('include', '/login');

    });

  });