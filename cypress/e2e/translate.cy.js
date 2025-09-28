/* global describe, it, cy, beforeEach */
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
      
      // Navigate to translator page
      cy.visit('http://localhost:3000/translator');

      // Test page structure and initial elements
      cy.contains('h2', 'Sign Language Recognizer').should('be.visible');
      cy.get('.recognizer-status-key"').should('be.visible');
      // cy.get('.recognizer-banner p').should('contain', 'Swipe your hand in the camera to switch models');
      cy.get('.recognizer-camera-container').should('be.visible');
      cy.get('video.recognizer-video').should('be.visible');
      // cy.get('.recognizer-live-indicator').should('be.visible');
      // cy.get('.recognizer-live-indicator span').should('contain', 'Live');

      // Test control buttons are present
      cy.get('.recognizer-control-button').contains('Clear Results').should('be.visible');
      cy.get('.recognizer-control-button').contains('Start Signing').should('be.visible');
      cy.get('.recognizer-control-button').contains('Test Your Setup').should('be.visible'); 

      // Test results section
      cy.get('.recognizer-results-title').should('contain', 'Translation Results');
      cy.get('.recognizer-confidence').should('contain', 'Confidence:');

      // Test history section
      // cy.get('.recognizer-history-title').should('contain', 'Recent Captures');
      // cy.get('.recognizer-history-items').should('be.visible');

      // Test tips section
      cy.get('.recognizer-tips-title').should('contain', 'Tips for Better Recognition');
      cy.get('.recognizer-tips-list').children().should('have.length.at.least', 4);
      cy.contains('a', 'Learn more signs').should('be.visible').and('have.attr', 'href', '/learn');

      // Test support section
      cy.get('.recognizer-support-text').should('contain', 'Need help?');
      cy.get('.recognizer-support-link').should('contain', 'Contact Support');

      // Test Clear Results functionality
      cy.contains('button', 'Clear Results').should('be.visible').and('not.be.disabled');
      cy.contains('button', 'Clear Results').click();

      // Test recording functionality
      cy.get('.recognizer-record-button').should('be.visible').and('contain', 'Start Signing');
      
      // Start recording
      cy.get('.recognizer-record-button').click();
      
      // Check that button text changes and recording indicator appears
      cy.get('.recognizer-stop-button').should('be.visible').and('contain', 'Stop Signing');
      cy.get('.recognizer-recording-indicator').should('be.visible').and('contain', 'Recording...');
      
      // Stop recording by clicking the button again
      cy.get('.recognizer-stop-button').click();
      
      // Check that button text changes back and recording indicator disappears
      cy.get('.recognizer-record-button').should('be.visible').and('contain', 'Start Signing');
      cy.get('.recognizer-recording-indicator').should('not.exist');

      // Test speak button exists (may be disabled initially)
      cy.get('.recognizer-speak-button').should('exist');

      // Test fingerspelling toggle if it exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="fingerspelling-toggle"]').length > 0) {
          cy.get('[data-testid="fingerspelling-toggle"]').should('be.visible');
        }
      });
    });
  });

  // Helper function to create authenticated user
  function createAuthenticatedUser() {
    const uniqueId = Date.now();
    const testEmail = `testuser${uniqueId}@example.com`;
    const testUsername = `testuser${uniqueId}`;

    cy.visit('http://localhost:3000/signup');
    cy.intercept('POST', 'http://localhost:2000/handsUPApi/signup').as('signupApi');

    cy.get('input[name="name"]').type('Test');
    cy.get('input[name="surname"]').type('User');
    cy.get('input[name="username"]').type(testUsername);
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type('Password!123');
    cy.get('input[name="confirmPassword"]').type('Password!123');
    cy.get('#termsAccepted').check();
    cy.get('button[type="submit"]').click();

    // Wait for successful signup
    cy.contains('Your journey to mastering sign language starts here', { timeout: 10000 });
  }

  // Additional Translator-specific tests
  describe('Translator Page Tests (Authenticated)', () => {
    beforeEach(() => {
      // Create authenticated user session
      createAuthenticatedUser();
      
      // Navigate to translator page
      cy.visit('http://localhost:3000/translator');
      
      // Ensure we're actually on the translator page
      cy.url().should('include', '/translator');
    });

    it('should display all required UI elements', () => {
      // Header and title
      cy.get('.recognizer-title').should('contain', 'Sign Language Recognizer');
      cy.get('.recognizer-title-icon').should('have.class', 'fas');

      // Banner
      cy.get('.recognizer-status-key-list').should('be.visible');
      
      // Camera section
      cy.get('video.recognizer-video').should('be.visible');
      // cy.get('.recognizer-live-indicator').should('be.visible');
      
      // Camera controls
      cy.get('.recognizer-camera-button').should('have.length', 1);
      
      // Main controls
      cy.get('.recognizer-control-button').should('have.length', 3);
      
      // Results section
      cy.get('.recognizer-results-display').should('be.visible');
      // cy.get('.recognizer-results-text').should('be.visible');
      
      // Audio controls
      cy.get('.recognizer-speak-button').should('have.length', 2);
      
      // Confidence display
      cy.get('.recognizer-confidence-value').should('be.visible');
      // cy.get('.recognizer-alternative-value').should('be.visible');
    });

    // it('should handle file upload button', () => {
    //   cy.get('.recognizer-upload-button').should('be.visible');
    //   cy.get('.recognizer-file-input').should('exist').and('not.be.visible');
      
    //   // Test that the input accepts the correct file types
    //   cy.get('.recognizer-file-input').should('have.attr', 'accept', 'image/*,video/*');
    // }); removed temporaily

    it('should display tips correctly', () => {
      const expectedTips = [
        'Ensure good lighting on your hands',
        'Position your hands in the center of the frame',
        'Hold the sign steady for 2 seconds',
        'Make sure your hand is clearly visible against the background'
      ];

      expectedTips.forEach(tip => {
        cy.get('.recognizer-tips-list').should('contain', tip);
      });

      // Check that each tip has an icon
      cy.get('.recognizer-tip-item .recognizer-tip-icon').should('have.length', 4);
    });

    it('should handle recording state changes correctly', () => {
      // Initial state
      cy.get('.recognizer-record-button').should('contain', 'Start Signing');
      cy.get('.recognizer-recording-indicator').should('not.exist');
      
      // Start recording
      cy.get('.recognizer-record-button').click();
      cy.get('.recognizer-stop-button').should('be.visible');
      cy.get('.recognizer-recording-indicator').should('be.visible');
      
      // Stop recording
      cy.get('.recognizer-stop-button').click();
      cy.get('.recognizer-record-button').should('be.visible');
      cy.get('.recognizer-recording-indicator').should('not.exist');
    });

    it('should display history items correctly', () => {
      // cy.get('.recognizer-history-items').should('be.visible');
      
      // Should show 5 history slots (empty or filled)
      // cy.get('.recognizer-history-items').children().should('have.length', 5);
      
      // Initially should be empty placeholders
      // cy.get('.recognizer-history-item').each(($item) => {
      //   cy.wrap($item).should('be.visible');
      // });
    });

    it('should have accessible buttons', () => {
      // Check ARIA labels and accessibility
      cy.get('button[title="Play translation audio"]').should('exist');
      cy.get('button[title="Switch Model"]').should('exist');
      // cy.get('button[title="Toggle fullscreen"]').should('exist');
      cy.get('button[title="Translate Gloss to English"]').should('exist');
    });

    it('should handle clear results functionality', () => {
      // Click clear results button
      cy.get('.recognizer-control-button').contains('Clear Results').click();
      
      // The result should be cleared (you might need to adjust this based on your actual implementation)
      cy.get('.recognizer-results-text').should('not.contain', 'Detected:');
    });

    it('should navigate to learn page from tips section', () => {
      cy.get('.recognizer-learn-link').should('have.attr', 'href', '/learn');
      cy.get('.recognizer-learn-link').should('contain', 'Learn more signs');
    });

    it('should display confidence and alternative values', () => {
      cy.get('.recognizer-confidence-value').should('exist');
      // cy.get('.recognizer-alternative-value').should('contain', 'None');
    });

    it('should show support section', () => {
      cy.get('.recognizer-support-text').should('contain', 'Need help?');
      cy.get('.recognizer-support-link').should('be.visible').and('contain', 'Contact Support');
    });
  });

  // Tests using real authentication flow (more reliable)
  describe('Translator Page Tests (Real Auth)', () => {
    beforeEach(() => {
      // Use the working signup flow from your original test
      const uniqueId = Date.now();
      const testEmail = `testuser${uniqueId}@example.com`;
      const testUsername = `testuser${uniqueId}`;

      cy.visit('http://localhost:3000/signup');
      cy.intercept('POST', 'http://localhost:2000/handsUPApi/signup').as('signupApi');

      cy.get('input[name="name"]').type('Test');
      cy.get('input[name="surname"]').type('User');
      cy.get('input[name="username"]').type(testUsername);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('Password!123');
      cy.get('input[name="confirmPassword"]').type('Password!123');
      cy.get('#termsAccepted').check();
      cy.get('button[type="submit"]').click();

      // Wait for successful signup
      cy.contains('Your journey to mastering sign language starts here', { timeout: 10000 });
      
      // Navigate to translator
      cy.visit('http://localhost:3000/translator');
      
      // Ensure we're on the translator page
      cy.url().should('include', '/translator');
      cy.get('.recognizer-container', { timeout: 10000 }).should('be.visible');
    });

    it('should display translator page after real authentication', () => {
      // Test core elements that should be visible
      cy.get('.recognizer-title').should('contain', 'Sign Language Recognizer');
      cy.get('.recognizer-status-key-column').should('be.visible');
      cy.get('video.recognizer-video').should('be.visible');
      // cy.get('.recognizer-live-indicator').should('be.visible');
      cy.get('.recognizer-control-button').should('have.length.at.least', 2);
    });

    it('should handle recording with real auth', () => {
      // Test recording functionality
      cy.get('.recognizer-record-button').should('contain', 'Start Signing');
      cy.get('.recognizer-record-button').click();
      cy.get('.recognizer-stop-button').should('be.visible');
      cy.get('.recognizer-recording-indicator').should('be.visible');
      cy.get('.recognizer-stop-button').click();
      cy.get('.recognizer-record-button').should('be.visible');
    });
  });


});