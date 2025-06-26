/* global describe, it, cy, beforeEach */
describe('Learn Page Tests', () => {
  beforeEach(() => {
    cy.visit('https://localhost:3000/signup');
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

      cy.visit('https://localhost:3000/learn');

  });

  describe('Learn Dashboard Tests', () => {
    it('should be on the right page and display main elements', () => {
      cy.get('.duo-app').should('be.visible');
      cy.get('.learn-main-content').should('be.visible');
      cy.get('.dashboard').should('be.visible');
      cy.get('.category-tiles').should('be.visible');
    });

    it('should display sidebar with progress information', () => {
      cy.get('.sidebar').should('be.visible'); 
    });

    it('should display all category tiles', () => {
      const expectedCategories = [
        'The Alphabet',
        'Numbers & Counting',
        'Introduce Yourself',
        'Family Members',
        'Emotions & Feelings'
      ];

      expectedCategories.forEach(categoryName => {
        cy.contains(categoryName).should('be.visible');
      });
    });

    it('should have alphabet category unlocked by default', () => {
      cy.contains('The Alphabet').should('be.visible');
      cy.contains('The Alphabet').parent().should('not.have.class', 'locked');
    });

    it('should allow clicking on unlocked alphabet category', () => {
      cy.contains('The Alphabet').click();
      cy.get('.category-levels').should('be.visible');
      cy.contains('h2', 'The Alphabet Levels').should('be.visible');
    });
  });

  describe('Alphabet Category Tests', () => {
    beforeEach(() => {
      cy.contains('The Alphabet').click();
    });

    it('should display alphabet category levels page', () => {
      cy.get('.category-levels').should('be.visible');
      cy.contains('h2', 'The Alphabet Levels').should('be.visible');
      cy.get('.stepping-poles').should('be.visible');
    });

    it('should display all 26 alphabet level tiles', () => {
      cy.get('.stepping-poles').children().should('have.length', 27);
      
      cy.contains('A').should('be.visible');
      cy.contains('B').should('be.visible');
      cy.contains('C').should('be.visible');
      

    });

    

    it('should navigate back to dashboard when back button is clicked', () => {
      cy.get('.back-button').click();
      cy.get('.dashboard').should('be.visible');
      cy.get('.category-tiles').should('be.visible');
      cy.get('.category-levels').should('not.exist');
    });

    it('should navigate to individual sign page when letter is clicked', () => {
      cy.get('.stepping-poles').within(() => {
      cy.contains('A').click();
        });
      cy.url().should('include', '/sign/A');
    });
  });

  describe('Numbers Category Tests', () => {
    beforeEach(() => {
      cy.contains('Numbers & Counting').click();
    });

  });

  describe('Other Categories Tests', () => {
    beforeEach(() => {
      // Test with introduce category as example
      cy.contains('Introduce Yourself').click();
    });

  });

  describe('Locked Categories Tests', () => {
    it('should display locked categories as non-clickable', () => {

      cy.get('.category-tiles').within(() => {
      });
    });
  });

  describe('Progress Integration Tests', () => {
    it('should display progress information in sidebar', () => {
      cy.get('.sidebar').should('be.visible');
    });

  });

  describe('Navigation Tests', () => {

    it('should handle direct navigation to category levels', () => {
      cy.visit('https://localhost:3000/learn');
      cy.contains('The Alphabet').click();
      cy.reload();
    });
  });

  describe('Responsive Design Tests', () => {
    it('should display properly on mobile viewport', () => {
      cy.viewport('iphone-6');
      cy.get('.duo-app').should('be.visible');
      cy.get('.learn-main-content').should('be.visible');
      cy.get('.category-tiles').should('be.visible');
    });

    it('should display properly on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.get('.duo-app').should('be.visible');
      cy.get('.learn-main-content').should('be.visible');
      cy.get('.category-tiles').should('be.visible');
    });
  });
});