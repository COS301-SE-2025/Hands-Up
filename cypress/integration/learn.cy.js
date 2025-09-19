/* global describe, it, cy, beforeEach */
describe('Learn Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/signup');
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

      cy.contains('h1', 'Welcome to Hands UP!', { timeout: 15000 }).should('be.visible').and('not.have.css', 'opacity', '0');

      cy.visit('http://localhost:3000/learn');

      cy.get('body').then($body => {
        if ($body.find('[data-testid="placement-test"]').length > 0) {
          cy.get('[data-testid="placement-test-skip"]').click();
        }
      });
      
      cy.get('body').then($body => {
        if ($body.find('.help-message-overlay').length > 0) {
          cy.get('.help-message-overlay button').contains('Okay!').click();
        }
      });

      cy.get('.duo-app', { timeout: 15000 }).should('be.visible');
      cy.get('.learn-main-content', { timeout: 15000 }).should('be.visible');
      cy.get('.dashboard', { timeout: 15000 }).should('be.visible');
      cy.get('.category-tiles', { timeout: 15000 }).should('be.visible');
      cy.wait(2000); 
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

      cy.get('.category-tiles').children().should('have.length.at.least', 5);
      cy.wait(1000);
      expectedCategories.forEach(categoryName => {
        cy.get('.category-tiles').within(() => {
          cy.get('*').contains(categoryName, { timeout: 8000 })
            .should('exist')
            .scrollIntoView()
            .should('be.visible')
            .then($el => {
              const rect = $el[0].getBoundingClientRect();
              expect(rect.width).to.be.greaterThan(0);
              expect(rect.height).to.be.greaterThan(0);
            });
        });
      });
    });

    it('should have alphabet category unlocked by default', () => {
      cy.wait(1000);
      
      cy.get('.category-tiles').within(() => {
        cy.contains('The Alphabet')
          .scrollIntoView()
          .should('be.visible')
          .parent()
          .should('not.have.class', 'locked');
      });
    });

    // it('should allow clicking on unlocked alphabet category', () => {
    //   cy.contains('The Alphabet').click();
    //   cy.get('.category-levels').should('be.visible');
    //   cy.contains('h2', 'The Alphabet').should('be.visible');
    // });
  });

  describe('Alphabet Category Tests', () => {
    beforeEach(() => {
      cy.wait(1000);
    cy.get('body').then($body => {
        if ($body.find('.help-message-overlay').length > 0) {
          cy.get('.help-message-overlay button').contains('Okay!').click();
          cy.wait(500);
        }
      });

      cy.get('.category-tiles').should('be.visible');
      
      cy.get('.category-tiles').within(() => {
        cy.contains('The Alphabet')
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
      });

      cy.wait(1000);
    });

    it('should navigate back to dashboard when back button is clicked', () => {
      cy.get('.back-button').should('be.visible').click();
      cy.get('.dashboard', { timeout: 5000 }).should('be.visible');
      cy.get('.category-tiles', { timeout: 5000 }).should('be.visible');
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
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('.help-message-overlay').length > 0) {
          cy.get('.help-message-overlay button').contains('Okay!').click();
          cy.wait(500);
        }
      });

      cy.get('.category-tiles').within(() => {
        cy.contains('Numbers & Counting')
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
      });
      cy.wait(1000);
    });
    
    it('should display numbers category content', () => {
      cy.get('.category-levels').should('be.visible');
    });
  });

  describe('Other Categories Tests', () => {
    beforeEach(() => {
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('.help-message-overlay').length > 0) {
          cy.get('.help-message-overlay button').contains('Okay!').click();
          cy.wait(500);
        }
      });

      // Test with introduce category as example
      cy.get('.category-tiles').within(() => {
        cy.contains('Introduce Yourself')
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
      });
      cy.wait(1000);
    });
    
    
  });

  describe('Locked Categories Tests', () => {
    it('should render locked categories as unclickable', () => {
  cy.get('.category-tiles').within(() => {
    cy.contains('Family Members')
      .parent()
      .should('have.class', 'locked')
      .and('have.css', 'pointer-events', 'none'); 
      });
  });
});

  describe('Progress Integration Tests', () => {
    it('should display progress information in sidebar', () => {
      cy.get('.sidebar').should('be.visible');
    });

  });

  describe('Help Message Tests', () => {
    it('should handle help messages properly', () => {
      cy.get('body').then($body => {
        if ($body.find('.help-message-overlay').length > 0) {
          cy.get('.help-message-overlay').should('be.visible');
          cy.get('.help-message-overlay button').contains('Okay!').click();
          cy.get('.help-message-overlay').should('not.exist');
        }
      });
    });
  });

  describe('Responsive Design Tests', () => {
    it('should display properly on mobile viewport', () => {
      cy.viewport('iphone-6');
      cy.wait(3000);
      cy.get('.duo-app').should('be.visible');
      cy.get('.learn-main-content').should('be.visible');
      cy.get('.category-tiles').should('be.visible');
    });

    it('should display properly on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.wait(1000);
      cy.get('.duo-app').should('be.visible');
      cy.get('.learn-main-content').should('be.visible');
      cy.get('.category-tiles').should('be.visible');
  });
});
});