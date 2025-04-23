const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const config = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(__dirname, 'screenshots'),
  implicitWaitMs: 10000,
  testUsers: {
    citizen: {
      email: 'testbuerger@example.com',
      password: 'Test1234!',
      name: 'Test Bürger'
    },
    ministry: {
      email: 'testministerium@example.com',
      password: 'Test1234!',
      name: 'Test Ministerium'
    },
    admin: {
      email: 'testadmin@example.com',
      password: 'Test1234!',
      name: 'Test Admin'
    }
  }
};

// Hilfsfunktionen
function createScreenshotDir() {
  if (!fs.existsSync(config.screenshotDir)) {
    fs.mkdirSync(config.screenshotDir, { recursive: true });
  }
}

async function takeScreenshot(driver, name) {
  const screenshot = await driver.takeScreenshot();
  const filename = `${Date.now()}_${name}.png`;
  fs.writeFileSync(path.join(config.screenshotDir, filename), screenshot, 'base64');
  console.log(`Screenshot saved: ${filename}`);
  return filename;
}

async function setupDriver() {
  // Chrome-Optionen konfigurieren
  const options = new chrome.Options();
  options.addArguments('--headless'); // Headless-Modus für CI/CD-Umgebungen
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');

  // WebDriver erstellen
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Implizites Warten konfigurieren
  await driver.manage().setTimeouts({ implicit: config.implicitWaitMs });

  return driver;
}

// Testfunktionen
async function testRegistration(driver) {
  console.log('Test: Benutzerregistrierung');
  
  try {
    // Registrierungsseite öffnen
    await driver.get(`${config.baseUrl}/register.html`);
    
    // Zufällige E-Mail generieren, um Duplikate zu vermeiden
    const randomEmail = `testuser_${Date.now()}@example.com`;
    
    // Formular ausfüllen
    await driver.findElement(By.id('name')).sendKeys('Test User');
    await driver.findElement(By.id('email')).sendKeys(randomEmail);
    await driver.findElement(By.id('password')).sendKeys('Test1234!');
    await driver.findElement(By.id('confirmPassword')).sendKeys('Test1234!');
    
    // Datenschutz und Nutzungsbedingungen akzeptieren
    await driver.findElement(By.id('privacyConsent')).click();
    await driver.findElement(By.id('termsConsent')).click();
    
    // Screenshot vor dem Absenden
    await takeScreenshot(driver, 'registration_form_filled');
    
    // Formular absenden
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Warten auf Weiterleitung zur Startseite oder Bestätigungsmeldung
    await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
    
    // Screenshot nach erfolgreicher Registrierung
    await takeScreenshot(driver, 'registration_success');
    
    // Erfolg überprüfen
    const successMessage = await driver.findElement(By.css('.alert-success')).getText();
    assert(successMessage.includes('erfolgreich registriert'), 'Erfolgreiche Registrierungsmeldung nicht gefunden');
    
    console.log('✓ Benutzerregistrierung erfolgreich');
    return true;
  } catch (error) {
    console.error('✗ Fehler bei der Benutzerregistrierung:', error);
    await takeScreenshot(driver, 'registration_error');
    return false;
  }
}

async function testLogin(driver, userType = 'citizen') {
  console.log(`Test: Benutzeranmeldung (${userType})`);
  
  try {
    // Anmeldeseite öffnen
    await driver.get(`${config.baseUrl}/login.html`);
    
    // Anmeldedaten aus Konfiguration holen
    const user = config.testUsers[userType];
    
    // Formular ausfüllen
    await driver.findElement(By.id('email')).sendKeys(user.email);
    await driver.findElement(By.id('password')).sendKeys(user.password);
    
    // Screenshot vor dem Absenden
    await takeScreenshot(driver, `login_form_filled_${userType}`);
    
    // Formular absenden
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Warten auf Weiterleitung zur Startseite
    await driver.wait(until.elementLocated(By.css('.navbar-nav')), 5000);
    
    // Screenshot nach erfolgreicher Anmeldung
    await takeScreenshot(driver, `login_success_${userType}`);
    
    // Erfolg überprüfen: Benutzername sollte in der Navigationsleiste angezeigt werden
    const navbarText = await driver.findElement(By.css('.navbar')).getText();
    assert(navbarText.includes(user.name), 'Benutzername nicht in der Navigationsleiste gefunden');
    
    console.log(`✓ Benutzeranmeldung (${userType}) erfolgreich`);
    return true;
  } catch (error) {
    console.error(`✗ Fehler bei der Benutzeranmeldung (${userType}):`, error);
    await takeScreenshot(driver, `login_error_${userType}`);
    return false;
  }
}

async function testSubmitProposal(driver) {
  console.log('Test: Vorschlag einreichen');
  
  try {
    // Sicherstellen, dass der Benutzer angemeldet ist
    if (!(await isLoggedIn(driver))) {
      await testLogin(driver, 'citizen');
    }
    
    // Vorschlagsformular öffnen
    await driver.get(`${config.baseUrl}/submit-proposal.html`);
    
    // Formular ausfüllen
    const title = `Testvorschlag ${Date.now()}`;
    await driver.findElement(By.id('proposalTitle')).sendKeys(title);
    await driver.findElement(By.id('proposalCategory')).click();
    await driver.findElement(By.css('option[value="umwelt"]')).click();
    
    await driver.findElement(By.id('proposalDescription')).sendKeys(
      'Dies ist ein Testvorschlag für automatisierte End-to-End-Tests. ' +
      'Der Vorschlag betrifft Umweltthemen und sollte vom System entsprechend kategorisiert werden. ' +
      'Es wäre gut, wenn mehr Bäume in der Stadt gepflanzt würden, um die Luftqualität zu verbessern ' +
      'und den CO2-Ausstoß zu reduzieren. Außerdem sollten mehr Grünflächen geschaffen werden.'
    );
    
    await driver.findElement(By.id('proposalTags')).sendKeys('Umwelt, Bäume, Luftqualität, Test');
    
    // Datenschutz und Nutzungsbedingungen akzeptieren
    await driver.findElement(By.id('privacyConsent')).click();
    await driver.findElement(By.id('termsConsent')).click();
    
    // Screenshot vor dem Absenden
    await takeScreenshot(driver, 'proposal_form_filled');
    
    // Formular absenden
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Warten auf Erfolgsmeldung oder Weiterleitung
    await driver.wait(until.elementLocated(By.css('.alert-success')), 10000);
    
    // Screenshot nach erfolgreicher Einreichung
    await takeScreenshot(driver, 'proposal_submit_success');
    
    // Erfolg überprüfen
    const successMessage = await driver.findElement(By.css('.alert-success')).getText();
    assert(successMessage.includes('erfolgreich eingereicht'), 'Erfolgreiche Einreichungsmeldung nicht gefunden');
    
    console.log('✓ Vorschlag einreichen erfolgreich');
    return title; // Titel zurückgeben für spätere Tests
  } catch (error) {
    console.error('✗ Fehler beim Einreichen des Vorschlags:', error);
    await takeScreenshot(driver, 'proposal_submit_error');
    return null;
  }
}

async function testViewProposals(driver) {
  console.log('Test: Vorschläge anzeigen');
  
  try {
    // Vorschlagsliste öffnen
    await driver.get(`${config.baseUrl}/proposals.html`);
    
    // Warten, bis die Vorschläge geladen sind
    await driver.wait(until.elementLocated(By.css('.proposal-card')), 5000);
    
    // Screenshot der Vorschlagsliste
    await takeScreenshot(driver, 'proposals_list');
    
    // Überprüfen, ob Vorschläge angezeigt werden
    const proposalCards = await driver.findElements(By.css('.proposal-card'));
    assert(proposalCards.length > 0, 'Keine Vorschläge gefunden');
    
    // Ersten Vorschlag öffnen
    await proposalCards[0].findElement(By.css('a.btn')).click();
    
    // Warten, bis die Detailseite geladen ist
    await driver.wait(until.elementLocated(By.css('.proposal-details')), 5000);
    
    // Screenshot der Detailseite
    await takeScreenshot(driver, 'proposal_details');
    
    // Überprüfen, ob die Detailseite Informationen enthält
    const detailsText = await driver.findElement(By.css('.proposal-details')).getText();
    assert(detailsText.length > 0, 'Keine Details zum Vorschlag gefunden');
    
    console.log('✓ Vorschläge anzeigen erfolgreich');
    return true;
  } catch (error) {
    console.error('✗ Fehler beim Anzeigen der Vorschläge:', error);
    await takeScreenshot(driver, 'proposals_view_error');
    return false;
  }
}

async function testFilterProposals(driver) {
  console.log('Test: Vorschläge filtern');
  
  try {
    // Vorschlagsliste öffnen
    await driver.get(`${config.baseUrl}/proposals.html`);
    
    // Warten, bis die Vorschläge geladen sind
    await driver.wait(until.elementLocated(By.css('.proposal-card')), 5000);
    
    // Anzahl der Vorschläge vor dem Filtern zählen
    const initialProposalCount = (await driver.findElements(By.css('.proposal-card'))).length;
    
    // Nach Kategorie filtern
    await driver.findElement(By.id('categoryFilter')).click();
    await driver.findElement(By.css('option[value="umwelt"]')).click();
    
    // Auf Filter-Button klicken
    await driver.findElement(By.id('applyFilters')).click();
    
    // Warten, bis die gefilterten Ergebnisse geladen sind
    await driver.sleep(2000); // Kurze Pause für die Aktualisierung
    
    // Screenshot der gefilterten Liste
    await takeScreenshot(driver, 'proposals_filtered');
    
    // Anzahl der Vorschläge nach dem Filtern zählen
    const filteredProposalCount = (await driver.findElements(By.css('.proposal-card'))).length;
    
    // Überprüfen, ob die Filterung funktioniert hat
    // Hinweis: Dies könnte auch bedeuten, dass weniger Vorschläge angezeigt werden
    console.log(`Vorschläge vor dem Filtern: ${initialProposalCount}, nach dem Filtern: ${filteredProposalCount}`);
    
    // Überprüfen, ob die angezeigten Vorschläge zur Kategorie passen
    const categoryLabels = await driver.findElements(By.css('.category-badge'));
    for (const label of categoryLabels) {
      const categoryText = await label.getText();
      assert(categoryText.toLowerCase().includes('umwelt'), 'Gefilterter Vorschlag hat nicht die richtige Kategorie');
    }
    
    console.log('✓ Vorschläge filtern erfolgreich');
    return true;
  } catch (error) {
    console.error('✗ Fehler beim Filtern der Vorschläge:', error);
    await takeScreenshot(driver, 'proposals_filter_error');
    return false;
  }
}

async function testVoteForProposal(driver) {
  console.log('Test: Für Vorschlag abstimmen');
  
  try {
    // Sicherstellen, dass der Benutzer angemeldet ist
    if (!(await isLoggedIn(driver))) {
      await testLogin(driver, 'citizen');
    }
    
    // Vorschlagsliste öffnen
    await driver.get(`${config.baseUrl}/proposals.html`);
    
    // Warten, bis die Vorschläge geladen sind
    await driver.wait(until.elementLocated(By.css('.proposal-card')), 5000);
    
    // Ersten Vorschlag öffnen
    const proposalCards = await driver.findElements(By.css('.proposal-card'));
    await proposalCards[0].findElement(By.css('a.btn')).click();
    
    // Warten, bis die Detailseite geladen ist
    await driver.wait(until.elementLocated(By.css('.proposal-details')), 5000);
    
    // Aktuelle Stimmenzahl erfassen
    const voteCountElement = await driver.findElement(By.css('.vote-count'));
    const initialVoteCount = parseInt(await voteCountElement.getText(), 10);
    
    // Screenshot vor der Abstimmung
    await takeScreenshot(driver, 'proposal_before_vote');
    
    // Für den Vorschlag abstimmen
    await driver.findElement(By.css('.vote-button')).click();
    
    // Warten, bis die Abstimmung verarbeitet wurde
    await driver.sleep(2000); // Kurze Pause für die Aktualisierung
    
    // Screenshot nach der Abstimmung
    await takeScreenshot(driver, 'proposal_after_vote');
    
    // Neue Stimmenzahl erfassen
    const updatedVoteCount = parseInt(await driver.findElement(By.css('.vote-count')).getText(), 10);
    
    // Überprüfen, ob die Stimmenzahl aktualisiert wurde
    // Hinweis: Die Stimmenzahl könnte um 1 erhöht oder um 1 verringert werden, je nachdem, ob der Benutzer bereits abgestimmt hatte
    assert(updatedVoteCount !== initialVoteCount, 'Stimmenzahl wurde nicht aktualisiert');
    
    console.log('✓ Für Vorschlag abstimmen erfolgreich');
    return true;
  } catch (error) {
    console.error('✗ Fehler beim Abstimmen für den Vorschlag:', error);
    await takeScreenshot(driver, 'proposal_vote_error');
    return false;
  }
}

async function testCommentOnProposal(driver) {
  console.log('Test: Vorschlag kommentieren');
  
  try {
    // Sicherstellen, dass der Benutzer angemeldet ist
    if (!(await isLoggedIn(driver))) {
      await testLogin(driver, 'citizen');
    }
    
    // Vorschlagsliste öffnen
    await driver.get(`${config.baseUrl}/proposals.html`);
    
    // Warten, bis die Vorschläge geladen sind
    await driver.wait(until.elementLocated(By.css('.proposal-card')), 5000);
    
    // Ersten Vorschlag öffnen
    const proposalCards = await driver.findElements(By.css('.proposal-card'));
    await proposalCards[0].findElement(By.css('a.btn')).click();
    
    // Warten, bis die Detailseite geladen ist
    await driver.wait(until.elementLocated(By.css('.proposal-details')), 5000);
    
    // Zum Kommentarbereich scrollen
    await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
    
    // Kommentar schreiben
    const commentText = `Testkommentar ${Date.now()}`;
    await driver.findElement(By.id('commentContent')).sendKeys(commentText);
    
    // Screenshot vor dem Absenden
    await takeScreenshot(driver, 'comment_form_filled');
    
    // Kommentar absenden
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Warten, bis der Kommentar angezeigt wird
    await driver.sleep(2000); // Kurze Pause für die Aktualisierung
    
    // Screenshot nach dem Absenden
    await takeScreenshot(driver, 'comment_submitted');
    
    // Überprüfen, ob der Kommentar angezeigt wird
    const comments = await driver.findElements(By.css('.comment-item'));
    const commentTexts = await Promise.all(comments.map(comment => comment.getText()));
    assert(commentTexts.some(text => text.includes(commentText)), 'Kommentar wurde nicht gefunden');
    
    console.log('✓ Vorschlag kommentieren erfolgreich');
    return true;
  } catch (error) {
    console.error('✗ Fehler beim Kommentieren des Vorschlags:', error);
    await takeScreenshot(driver, 'comment_error');
    return false;
  }
}

async function testMinistryPortal(driver) {
  console.log('Test: Ministeriumsportal');
  
  try {
    // Als Ministeriumsmitarbeiter anmelden
    await testLogin(driver, 'ministry');
    
    // Ministeriumsportal öffnen
    await driver.get(`${config.baseUrl}/ministry-portal.html`);
    
    // Warten, bis die Vorschläge geladen sind
    await driver.wait(until.elementLocated(By.css('.proposal-item')), 5000);
    
    // Screenshot des Ministeriumsportals
    await takeScreenshot(driver, 'ministry_portal');
    
    // Überprüfen, ob Vorschläge angezeigt werden
    const proposalItems = await driver.findElements(By.css('.proposal-item'));
    assert(proposalItems.length > 0, 'Keine Vorschläge im Ministeriumsportal gefunden');
    
    // Ersten Vorschlag öffnen
    await proposalItems[0].click();
    
    // Warten, bis die Detailansicht geladen ist
    await driver.wait(until.elementLocated(By.css('.proposal-details')), 5000);
    
    // Screenshot der Detailansicht
    await takeScreenshot(driver, 'ministry_proposal_details');
    
    // Status des Vorschlags ändern
    await driver.findElement(By.id('statusSelect')).click();
    await driver.findElement(By.css('option[value="processing"]')).click();
    
    // Priorität setzen
    await driver.findElement(By.id('prioritySelect')).click();
    await driver.findElement(By.css('option[value="high"]')).click();
    
    // Interne Notizen hinzufügen
    await driver.findElement(By.id('internalNotes')).sendKeys('Testnotiz für den Vorschlag');
    
    // Screenshot vor dem Speichern
    await takeScreenshot(driver, 'ministry_proposal_edited');
    
    // Änderungen speichern
    await driver.findElement(By.id('saveChanges')).click();
    
    // Warten auf Erfolgsmeldung
    await driver.wait(until.elementLocated(By.css('.alert-success')), 5000);
    
    // Screenshot nach dem Speichern
    await takeScreenshot(driver, 'ministry_proposal_saved');
    
    // Erfolg überprüfen
    const successMessage = await driver.findElement(By.css('.alert-success')).getText();
    assert(successMessage.includes('erfolgreich aktualisiert'), 'Erfolgsmeldung nicht gefunden');
    
    console.log('✓ Ministeriumsportal erfolgreich getestet');
    return true;
  } catch (error) {
    console.error('✗ Fehler beim Testen des Ministeriumsportals:', error);
    await takeScreenshot(driver, 'ministry_portal_error');
    return false;
  }
}

async function testAdminFunctions(driver) {
  console.log('Test: Administratorfunktionen');
  
  try {
    // Als Administrator anmelden
    await testLogin(driver, 'admin');
    
    // Administrationsbereich öffnen
    await driver.get(`${config.baseUrl}/admin.html`);
    
    // Warten, bis die Benutzerübersicht geladen ist
    await driver.wait(until.elementLocated(By.css('.user-table')), 5000);
    
    // Screenshot des Administrationsbereichs
    await takeScreenshot(driver, 'admin_panel');
    
    // Überprüfen, ob Benutzer angezeigt werden
    const userRows = await driver.findElements(By.css('.user-table tbody tr'));
    assert(userRows.length > 0, 'Keine Benutzer in der Administrationsübersicht gefunden');
    
    // Zur Kategorienverwaltung wechseln
    await driver.findElement(By.css('a[href="#categories"]')).click();
    
    // Warten, bis die Kategorienübersicht geladen ist
    await driver.wait(until.elementLocated(By.css('.category-table')), 5000);
    
    // Screenshot der Kategorienverwaltung
    await takeScreenshot(driver, 'admin_categories');
    
    // Überprüfen, ob Kategorien angezeigt werden
    const categoryRows = await driver.findElements(By.css('.category-table tbody tr'));
    assert(categoryRows.length > 0, 'Keine Kategorien in der Administrationsübersicht gefunden');
    
    // Zur Ministeriumsverwaltung wechseln
    await driver.findElement(By.css('a[href="#ministries"]')).click();
    
    // Warten, bis die Ministeriumsübersicht geladen ist
    await driver.wait(until.elementLocated(By.css('.ministry-table')), 5000);
    
    // Screenshot der Ministeriumsverwaltung
    await takeScreenshot(driver, 'admin_ministries');
    
    // Überprüfen, ob Ministerien angezeigt werden
    const ministryRows = await driver.findElements(By.css('.ministry-table tbody tr'));
    assert(ministryRows.length > 0, 'Keine Ministerien in der Administrationsübersicht gefunden');
    
    console.log('✓ Administratorfunktionen erfolgreich getestet');
    return true;
  } catch (error) {
    console.error('✗ Fehler beim Testen der Administratorfunktionen:', error);
    await takeScreenshot(driver, 'admin_functions_error');
    return false;
  }
}

async function testStatistics(driver) {
  console.log('Test: Statistiken');
  
  try {
    // Statistikseite öffnen
    await driver.get(`${config.baseUrl}/statistics.html`);
    
    // Warten, bis die Statistiken geladen sind
    await driver.wait(until.elementLocated(By.css('.statistics-container')), 5000);
    
    // Screenshot der Statistikseite
    await takeScreenshot(driver, 'statistics_page');
    
    // Überprüfen, ob Statistiken angezeigt werden
    const charts = await driver.findElements(By.css('.chart-container'));
    assert(charts.length > 0, 'Keine Statistikdiagramme gefunden');
    
    // Zeitraum ändern
    await driver.findElement(By.id('periodSelect')).click();
    await driver.findElement(By.css('option[value="month"]')).click();
    
    // Warten, bis die Statistiken aktualisiert sind
    await driver.sleep(2000); // Kurze Pause für die Aktualisierung
    
    // Screenshot der aktualisierten Statistiken
    await takeScreenshot(driver, 'statistics_filtered');
    
    console.log('✓ Statistiken erfolgreich getestet');
    return true;
  } catch (error) {
    console.error('✗ Fehler beim Testen der Statistiken:', error);
    await takeScreenshot(driver, 'statistics_error');
    return false;
  }
}

async function testResponsiveDesign(driver) {
  console.log('Test: Responsives Design');
  
  try {
    // Verschiedene Bildschirmgrößen testen
    const screenSizes = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 812, name: 'mobile' }
    ];
    
    for (const size of screenSizes) {
      console.log(`Teste Bildschirmgröße: ${size.name} (${size.width}x${size.height})`);
      
      // Fenstergröße anpassen
      await driver.manage().window().setRect({
        width: size.width,
        height: size.height
      });
      
      // Startseite öffnen
      await driver.get(config.baseUrl);
      
      // Warten, bis die Seite geladen ist
      await driver.wait(until.elementLocated(By.css('.navbar')), 5000);
      
      // Screenshot der Startseite
      await takeScreenshot(driver, `responsive_home_${size.name}`);
      
      // Vorschlagsseite öffnen
      await driver.get(`${config.baseUrl}/proposals.html`);
      
      // Warten, bis die Seite geladen ist
      await driver.wait(until.elementLocated(By.css('.proposal-card')), 5000);
      
      // Screenshot der Vorschlagsseite
      await takeScreenshot(driver, `responsive_proposals_${size.name}`);
    }
    
    console.log('✓ Responsives Design erfolgreich getestet');
    return true;
  } catch (error) {
    console.error('✗ Fehler beim Testen des responsiven Designs:', error);
    await takeScreenshot(driver, 'responsive_design_error');
    return false;
  }
}

// Hilfsfunktion: Überprüfen, ob der Benutzer angemeldet ist
async function isLoggedIn(driver) {
  try {
    // Überprüfen, ob ein Logout-Button vorhanden ist
    const logoutButtons = await driver.findElements(By.css('.logout-button'));
    return logoutButtons.length > 0;
  } catch (error) {
    return false;
  }
}

// Haupttestfunktion
async function runTests() {
  console.log('Starte End-to-End-Tests für das Bürgerbeteiligungssystem');
  createScreenshotDir();
  
  // Starten des Servers (falls nicht bereits gestartet)
  try {
    console.log('Starte den Server...');
    execSync('cd /home/ubuntu/buergervorschlaege && node backend/server.js &');
    console.log('Server gestartet');
    
    // Kurze Pause, um dem Server Zeit zum Starten zu geben
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (error) {
    console.warn('Server konnte nicht gestartet werden, möglicherweise läuft er bereits:', error.message);
  }
  
  const driver = await setupDriver();
  
  try {
    // Tests ausführen
    const testResults = {
      registration: await testRegistration(driver),
      login: await testLogin(driver, 'citizen'),
      submitProposal: await testSubmitProposal(driver),
      viewProposals: await testViewProposals(driver),
      filterProposals: await testFilterProposals(driver),
      voteForProposal: await testVoteForProposal(driver),
      commentOnProposal: await testCommentOnProposal(driver),
      ministryPortal: await testMinistryPortal(driver),
      adminFunctions: await testAdminFunctions(driver),
      statistics: await testStatistics(driver),
      responsiveDesign: await testResponsiveDesign(driver)
    };
    
    // Testergebnisse zusammenfassen
    console.log('\n--- Testergebnisse ---');
    let passedTests = 0;
    let totalTests = 0;
    
    for (const [testName, result] of Object.entries(testResults)) {
      totalTests++;
      if (result) passedTests++;
      console.log(`${result ? '✓' : '✗'} ${testName}`);
    }
    
    console.log(`\n${passedTests} von ${totalTests} Tests bestanden (${Math.round(passedTests / totalTests * 100)}%)`);
    
    // Testbericht erstellen
    const reportContent = `
# End-to-End-Testbericht

Datum: ${new Date().toISOString()}

## Zusammenfassung
- Durchgeführte Tests: ${totalTests}
- Erfolgreiche Tests: ${passedTests}
- Fehlgeschlagene Tests: ${totalTests - passedTests}
- Erfolgsrate: ${Math.round(passedTests / totalTests * 100)}%

## Detaillierte Ergebnisse
${Object.entries(testResults).map(([testName, result]) => `- ${result ? '✓' : '✗'} ${testName}`).join('\n')}

## Screenshots
Die Screenshots der Tests befinden sich im Verzeichnis: ${config.screenshotDir}
`;
    
    fs.writeFileSync(path.join(__dirname, 'e2e_test_report.md'), reportContent);
    console.log(`\nTestbericht erstellt: ${path.join(__dirname, 'e2e_test_report.md')}`);
    
  } finally {
    // Browser schließen
    await driver.quit();
    console.log('Browser geschlossen');
    
    // Server beenden (optional, je nach Umgebung)
    // execSync('pkill -f "node backend/server.js"');
  }
}

// Tests ausführen
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fehler beim Ausführen der Tests:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testRegistration,
  testLogin,
  testSubmitProposal,
  testViewProposals,
  testFilterProposals,
  testVoteForProposal,
  testCommentOnProposal,
  testMinistryPortal,
  testAdminFunctions,
  testStatistics,
  testResponsiveDesign
};
