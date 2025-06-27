/* global describe, it, cy,  beforeEach */
describe('Overall Application Tests', () => {

  // Signup Tests
  describe('SignUp Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/signup');
      cy.intercept('POST', 'http://localhost:2000/handsUPApi/signup').as('signupApi');
    });

    it('should be on the right page', () => {
      cy.contains('h2', 'Join Us!').should('be.visible');
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

        cy.contains('Your journey to mastering sign language starts here. Connect, learn, and translate with ease.').should('be.visible');
      
        cy.visit('http://localhost:3000/translator');

        cy.contains('h2', 'Sign Language Recognizer').should('be.visible');
        cy.get('.recognizer-banner').should('be.visible');
        cy.get('.recognizer-banner p').should('contain', 'Position your hand clearly in frame for best recognition results');
        cy.get('.recognizer-camera-container').should('be.visible');
        cy.get('video.recognizer-video').should('be.visible');
        cy.get('.recognizer-live-indicator').should('be.visible');
        cy.get('.recognizer-live-indicator span').should('contain', 'Live');

        cy.get('.recognizer-control-button').contains('Clear Results').should('be.visible');
        cy.get('.recognizer-control-button').contains('Record Sequence').should('be.visible');
        cy.get('.recognizer-control-button').contains('Upload Sign').should('be.visible');

        cy.get('.recognizer-results-title').should('contain', 'Translation Results');

      cy.get('.recognizer-confidence').should('contain', 'Confidence:');
        
      

      cy.get('.recognizer-history-title').should('contain', 'Recent Captures');
      cy.get('.recognizer-history-items').should('be.visible'); // Should be empty initially


      cy.get('.recognizer-tips-title').should('contain', 'Tips for Better Recognition');
      cy.get('.recognizer-tips-list').children().should('have.length.at.least', 4); // At least 4 tips
      cy.contains('a', 'Learn more signs').should('be.visible').and('have.attr', 'href', '/learn');

      cy.get('.recognizer-support-text').should('contain', 'Need help?');
      cy.get('.recognizer-support-link').should('contain', 'Contact Support');

        cy.contains('button', 'Clear Results').should('be.visible').and('not.be.disabled');
      
      cy.contains('button', 'Clear Results').click();

      
         cy.get('.recognizer-record-button').should('be.visible').and('contain', 'Record Sequence');

      cy.get('.recognizer-record-button').click();


      cy.get('.recognizer-stop-button').should('be.visible').and('contain', 'Stop Recording');


      cy.get('.recognizer-recording-indicator').should('be.visible').and('contain', 'Recording...');


      cy.get('.recognizer-stop-button').click();
      cy.get('.recognizer-record-button').should('be.visible').and('contain', 'Record Sequence');
      cy.get('.recognizer-recording-indicator').should('not.exist');

       cy.get('.recognizer-speak-button').should('be.disabled');

      
      cy.get('.recognizer-speak-button').should('exist');

      
      cy.get('.recognizer-history-items').should('be.visible');
      

      cy.get('.recognizer-history-items').should('exist');

    });
  });
});