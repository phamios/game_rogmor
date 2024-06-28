describe('template spec', () => {
  it('live app still work', () => {
    cy.visit('https://rogmor.vercel.app')
  })

  
  
    it('is empty and then typed into', () => {
      cy.visit('localhost:3000')
      cy
        //.focused()
        .get('article')
        .snapshot('rogmor-snapshot-v2')
    })
  
  it('local test', () => {
    cy.visit('localhost:3000')
    cy.get('article').should('have.length', 1);
    cy.get('button').click();
    // cy.get('input').type('Check the UI');
    // cy.get('.send-btn').click();
    // cy.get('.mobil-font-setup').snapshot({
    //   name: 'rogmor-snapshot',
    //   json: true,
    // });
 
  })


})