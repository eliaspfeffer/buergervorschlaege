// Hauptanwendungslogik für das Bürgerbeteiligungssystem

// API-Basis-URL
const API_BASE_URL = "/api";

// DOM-Elemente laden, wenn das Dokument bereit ist
document.addEventListener("DOMContentLoaded", function () {
  // Aktuelle Seite ermitteln
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Seiten-spezifische Funktionen aufrufen
  switch (currentPage) {
    case "index.html":
      loadRecentProposals();
      loadCategories();
      loadStatisticsOverview();
      break;
    case "proposals.html":
      loadAllProposals();
      loadCategories();
      setupFilters();
      break;
    case "submit-proposal.html":
      loadCategories();
      setupSubmitForm();
      break;
    case "statistics.html":
      loadDetailedStatistics();
      break;
    case "proposal-detail.html":
      const proposalId = getUrlParameter("id");
      if (proposalId) {
        loadProposalDetails(proposalId);
      } else {
        window.location.href = "proposals.html";
      }
      break;
  }
});

// Aktuelle Vorschläge für die Startseite laden
async function loadRecentProposals() {
  try {
    const response = await fetch(`${API_BASE_URL}/proposals?limit=3`);
    const data = await response.json();

    // Anpassen für neue API-Struktur mit Pagination
    const proposals = data.proposals || data;

    if (proposals && Array.isArray(proposals)) {
      const proposalsContainer = document.getElementById("recent-proposals");
      if (proposalsContainer) {
        proposalsContainer.innerHTML = "";

        proposals.slice(0, 3).forEach((proposal) => {
          proposalsContainer.appendChild(createProposalCard(proposal));
        });
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der aktuellen Vorschläge:", error);
  }
}

// Alle Vorschläge mit Paginierung laden
async function loadAllProposals(page = 1, filters = {}) {
  try {
    let url = `${API_BASE_URL}/proposals?page=${page}&limit=10`;

    // Filter hinzufügen
    if (filters.category) url += `&category=${filters.category}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.ministry) url += `&ministry=${filters.ministry}`;
    if (filters.search) url += `&search=${filters.search}`;

    const response = await fetch(url);
    const data = await response.json();

    // Anpassen für neue API-Struktur mit Pagination
    const proposals = data.proposals || data;
    const pagination = data.pagination || {
      total: proposals.length,
      page: page,
      pages: Math.ceil(proposals.length / 10),
    };

    if (proposals && Array.isArray(proposals)) {
      const proposalsContainer = document.getElementById("proposals-list");
      if (proposalsContainer) {
        proposalsContainer.innerHTML = "";

        if (proposals.length === 0) {
          proposalsContainer.innerHTML =
            '<div class="alert alert-info">Keine Vorschläge gefunden.</div>';
          return;
        }

        proposals.forEach((proposal) => {
          proposalsContainer.appendChild(createProposalCard(proposal, true));
        });

        // Paginierung mit Gesamtseiten aus API-Antwort
        setupPagination(pagination.page, pagination.pages);
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der Vorschläge:", error);
  }
}

// Kategorien laden
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();

    // Anpassen für neue API-Struktur
    const categories = data;

    if (categories && Array.isArray(categories)) {
      const categoriesList = document.getElementById("categories-list");
      if (categoriesList) {
        categoriesList.innerHTML = "";

        categories.forEach((category) => {
          const li = document.createElement("li");
          li.className =
            "list-group-item d-flex justify-content-between align-items-center";
          li.innerHTML = `
                        ${category.name}
                        <span class="badge bg-primary rounded-pill">
                            ${Math.floor(Math.random() * 50) + 5}
                        </span>
                    `;
          categoriesList.appendChild(li);
        });
      }

      // Kategorien für Filter-Dropdown
      const categoryFilter = document.getElementById("category-filter");
      if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">Alle Kategorien</option>';

        categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.name;
          option.textContent = category.name;
          categoryFilter.appendChild(option);
        });
      }

      // Kategorien für Einreichungsformular
      const categorySelect = document.getElementById("proposal-category");
      if (categorySelect) {
        categorySelect.innerHTML =
          '<option value="">Kategorie auswählen</option>';

        categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.name;
          option.textContent = category.name;
          categorySelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der Kategorien:", error);
  }
}

// Statistik-Übersicht laden
async function loadStatisticsOverview() {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const data = await response.json();

    // Anpassen für neue API-Struktur
    const stats = data;

    if (stats) {
      const statsContainer = document.getElementById("statistics-overview");
      if (statsContainer) {
        statsContainer.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Vorschläge gesamt:</span>
                        <span class="stat-value">${
                          stats.total_proposals || 0
                        }</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">In Bearbeitung:</span>
                        <span class="stat-value">${
                          stats.proposals_by_status?.processing || 0
                        }</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Beantwortet:</span>
                        <span class="stat-value">${
                          stats.proposals_by_status?.answered || 0
                        }</span>
                    </div>
                `;
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der Statistiken:", error);
  }
}

// Detaillierte Statistiken laden
async function loadDetailedStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const data = await response.json();

    if (data.success) {
      const stats = data.statistics;

      // Status-Verteilung
      const statusChart = document.getElementById("status-chart");
      if (statusChart) {
        const statusData = stats.proposals_by_status;

        // Hier würde normalerweise ein Chart.js-Diagramm erstellt werden
        // Für diese Demo verwenden wir eine einfache Tabelle
        statusChart.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Anzahl</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Eingereicht</td>
                                <td>${statusData.submitted}</td>
                            </tr>
                            <tr>
                                <td>In Bearbeitung</td>
                                <td>${statusData.processing}</td>
                            </tr>
                            <tr>
                                <td>Beantwortet</td>
                                <td>${statusData.answered}</td>
                            </tr>
                            <tr>
                                <td>Umgesetzt</td>
                                <td>${statusData.completed}</td>
                            </tr>
                            <tr>
                                <td>Abgelehnt</td>
                                <td>${statusData.rejected}</td>
                            </tr>
                        </tbody>
                    </table>
                `;
      }

      // Kategorie-Verteilung
      const categoryChart = document.getElementById("category-chart");
      if (categoryChart) {
        const categoryData = stats.proposals_by_category;

        // Einfache Tabelle für die Demo
        categoryChart.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Kategorie</th>
                                <th>Anzahl</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categoryData
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.category}</td>
                                    <td>${item.count}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                `;
      }

      // Ministeriums-Verteilung
      const ministryChart = document.getElementById("ministry-chart");
      if (ministryChart) {
        const ministryData = stats.proposals_by_ministry;

        // Einfache Tabelle für die Demo
        ministryChart.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ministerium</th>
                                <th>Anzahl</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ministryData
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.ministry}</td>
                                    <td>${item.count}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                `;
      }

      // Weitere Statistiken
      const additionalStats = document.getElementById("additional-stats");
      if (additionalStats) {
        additionalStats.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Weitere Kennzahlen</h5>
                            <div class="stat-item">
                                <span class="stat-label">Durchschnittliche Bearbeitungszeit:</span>
                                <span class="stat-value">${
                                  stats.average_processing_time
                                } Tage</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Umsetzungsrate:</span>
                                <span class="stat-value">${Math.round(
                                  stats.implementation_rate * 100
                                )}%</span>
                            </div>
                        </div>
                    </div>
                `;
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der detaillierten Statistiken:", error);
  }
}

// Vorschlagsdetails laden
async function loadProposalDetails(proposalId) {
  try {
    // Hauptcontainer für Fehlermeldungen vorbereiten
    const mainContainer = document.querySelector(".container .row");
    if (mainContainer) {
      // Lade-Indikator hinzufügen
      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "col-12 text-center my-4";
      loadingIndicator.innerHTML = `
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Lade...</span>
        </div>
        <p class="mt-2">Vorschlag wird geladen...</p>
      `;
      mainContainer.innerHTML = "";
      mainContainer.appendChild(loadingIndicator);
    }

    console.log(`Lade Vorschlag mit ID: ${proposalId}`);
    const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`);

    if (!response.ok) {
      throw new Error(
        `HTTP-Fehler beim Laden des Vorschlags: ${response.status}`
      );
    }

    const proposal = await response.json();
    console.log("Vorschlag geladen:", proposal);

    if (!proposal || !proposal._id) {
      throw new Error("Der geladene Vorschlag enthält keine gültigen Daten");
    }

    // Hauptcontainer zurücksetzen
    if (mainContainer) {
      mainContainer.innerHTML = "";

      // Ursprünglichen HTML-Aufbau wiederherstellen
      mainContainer.innerHTML = `
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-body">
              <h1 id="proposal-title" class="card-title mb-3">Vorschlagstitel wird geladen...</h1>
              <div class="d-flex flex-wrap align-items-center mb-3">
                <span id="proposal-category" class="proposal-category me-2">Kategorie</span>
                <span id="proposal-status" class="status-badge me-2">Status</span>
                <small class="text-muted me-3">Eingereicht am <span id="proposal-date">Datum</span></small>
                <small class="text-muted">Von <span id="proposal-author">Autor</span></small>
              </div>
              <div class="mb-4">
                <p id="proposal-content" class="card-text">Inhalt wird geladen...</p>
              </div>
              <div class="mb-3">
                <h6>Schlagwörter:</h6>
                <div id="proposal-tags"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <button class="btn btn-primary" onclick="voteForProposal('${proposalId}')">
                  <i class="bi bi-hand-thumbs-up me-1"></i> Unterstützen (<span id="proposal-votes">0</span>)
                </button>
                <div>
                  <button class="btn btn-outline-primary me-2">
                    <i class="bi bi-share me-1"></i> Teilen
                  </button>
                  <button class="btn btn-outline-primary">
                    <i class="bi bi-flag me-1"></i> Melden
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">KI-Analyse</h5>
            </div>
            <div class="card-body" id="ai-analysis-container">
              <div class="mb-3">
                <label class="form-label">Qualität:</label>
                <div class="progress">
                  <div id="ai-quality" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Relevanz:</label>
                <div class="progress">
                  <div id="ai-relevance" class="progress-bar bg-info" role="progressbar" style="width: 0%"></div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Umsetzbarkeit:</label>
                <div class="progress">
                  <div id="ai-feasibility" class="progress-bar bg-warning" role="progressbar" style="width: 0%"></div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Nachhaltigkeit:</label>
                <div class="progress">
                  <div id="ai-sustainability" class="progress-bar bg-primary" role="progressbar" style="width: 0%"></div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Innovationsgrad:</label>
                <div class="progress">
                  <div id="ai-innovation" class="progress-bar bg-danger" role="progressbar" style="width: 0%"></div>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-md-6 mb-3">
                  <h6>Stärken:</h6>
                  <ul id="ai-strengths" class="list-group list-group-flush">
                    <li class="list-group-item text-muted">Wird geladen...</li>
                  </ul>
                </div>
                <div class="col-md-6 mb-3">
                  <h6>Verbesserungspotenziale:</h6>
                  <ul id="ai-weaknesses" class="list-group list-group-flush">
                    <li class="list-group-item text-muted">Wird geladen...</li>
                  </ul>
                </div>
              </div>
              <div class="mb-3">
                <h6>Zusammenfassung:</h6>
                <p id="ai-summary" class="card-text">Wird geladen...</p>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <h6>Kosten-Nutzen-Verhältnis:</h6>
                  <p id="ai-cost-benefit">Wird geladen...</p>
                </div>
                <div class="col-md-6 mb-3">
                  <h6>Politische Zuständigkeiten:</h6>
                  <p id="ai-political-domains">Wird geladen...</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Neuer Abschnitt für Zusammenfassungserstellung und -analyse -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Zusammenfassung erstellen und analysieren</h5>
            </div>
            <div class="card-body">
              <p class="mb-3">
                Sie können eine eigene Zusammenfassung dieses Vorschlags erstellen und diese von der KI analysieren lassen.
                Die Analyse wird die Qualität, Relevanz, Umsetzbarkeit, Nachhaltigkeit und den Innovationsgrad der Zusammenfassung bewerten.
              </p>
              <div id="summary-analysis-feedback"></div>
              <form id="summary-form">
                <div class="mb-3">
                  <label for="summary-text" class="form-label">Zusammenfassung:</label>
                  <textarea class="form-control" id="summary-text" rows="5" 
                    placeholder="Schreiben Sie hier Ihre Zusammenfassung des Vorschlags..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-search me-1"></i> Zusammenfassung analysieren
                </button>
              </form>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Kommentare</h5>
            </div>
            <div class="card-body">
              <div id="comments-list"></div>
              <hr />
              <h6>Neuen Kommentar hinzufügen</h6>
              <form id="comment-form">
                <div class="mb-3">
                  <textarea class="form-control" id="comment-content" rows="3" 
                    placeholder="Schreiben Sie Ihren Kommentar..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Kommentar absenden</button>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Zuständigkeit</h5>
            </div>
            <div class="card-body">
              <p>Dieser Vorschlag wurde an folgendes Ministerium weitergeleitet:</p>
              <div class="d-flex align-items-center">
                <i class="bi bi-building me-2 fs-4"></i>
                <span id="proposal-ministry" class="fs-5">Ministerium wird geladen...</span>
              </div>
            </div>
          </div>
          
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Ähnliche Vorschläge</h5>
            </div>
            <div class="card-body">
              <div id="similar-proposals-list" class="list-group list-group-flush">
                <div class="text-center text-muted p-3">
                  <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <span class="ms-2">Ähnliche Vorschläge werden geladen...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Statusverlauf</h5>
            </div>
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Eingereicht</strong>
                    <div class="text-muted">15.03.2025</div>
                  </div>
                  <span class="badge bg-success rounded-pill">✓</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>KI-Analyse</strong>
                    <div class="text-muted">15.03.2025</div>
                  </div>
                  <span class="badge bg-success rounded-pill">✓</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Ministerium zugewiesen</strong>
                    <div class="text-muted">16.03.2025</div>
                  </div>
                  <span class="badge bg-success rounded-pill">✓</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>In Bearbeitung</strong>
                    <div class="text-muted">Ausstehend</div>
                  </div>
                  <span class="badge bg-secondary rounded-pill">...</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Grundlegende Vorschlagsinformationen anzeigen
    document.getElementById("proposal-title").textContent = proposal.title;
    document.getElementById("proposal-content").textContent = proposal.content;
    document.getElementById("proposal-date").textContent = formatDate(
      proposal.createdAt
    );

    // Autor anzeigen (wenn nicht anonym)
    if (proposal.isAnonymous) {
      document.getElementById("proposal-author").textContent =
        "Anonymer Nutzer";
    } else if (proposal.user && proposal.user.firstName) {
      document.getElementById("proposal-author").textContent = `${
        proposal.user.firstName
      } ${proposal.user.lastName || ""}`;
    } else {
      document.getElementById("proposal-author").textContent =
        "Unbekannter Nutzer";
    }

    // Status anzeigen
    if (proposal.status) {
      const statusElement = document.getElementById("proposal-status");
      if (statusElement) {
        statusElement.textContent = getStatusText(proposal.status);
        statusElement.className = `status-badge status-${proposal.status}`;
      }
    }

    // Stimmen anzeigen
    if (proposal.votes !== undefined) {
      const votesElement = document.getElementById("proposal-votes");
      if (votesElement) {
        votesElement.textContent = proposal.votes;
      }
    }

    // Kategorien anzeigen
    const categoryElement = document.getElementById("proposal-category");
    if (categoryElement) {
      if (proposal.categories && proposal.categories.length > 0) {
        const categoryNames = getCategoryNames(proposal);
        categoryElement.textContent = Array.isArray(categoryNames)
          ? categoryNames.join(", ")
          : categoryNames;
      } else {
        categoryElement.textContent = "Keine Kategorie";
      }
    }

    // Zuständiges Ministerium anzeigen
    const ministryElement = document.getElementById("proposal-ministry");
    if (ministryElement) {
      if (
        proposal.ministries &&
        proposal.ministries.length > 0 &&
        proposal.ministries[0].ministry
      ) {
        ministryElement.textContent = proposal.ministries[0].ministry.name;
      } else {
        ministryElement.textContent = "Noch nicht zugewiesen";
      }
    }

    // Tags anzeigen
    const tagsContainer = document.getElementById("proposal-tags");
    if (tagsContainer) {
      if (proposal.tags && proposal.tags.length > 0) {
        tagsContainer.innerHTML = "";
        proposal.tags.forEach((tag) => {
          const tagElement = document.createElement("span");
          tagElement.className = "badge bg-secondary me-1";
          tagElement.textContent = tag.name || tag;
          tagsContainer.appendChild(tagElement);
        });
      } else {
        tagsContainer.innerHTML = "<span class='text-muted'>Keine Tags</span>";
      }
    }

    try {
      // KI-Analyse laden
      await loadProposalAnalysis(proposalId);
    } catch (analysisError) {
      console.error("Fehler beim Laden der KI-Analyse:", analysisError);
      const analysisContainer = document.getElementById(
        "ai-analysis-container"
      );
      if (analysisContainer) {
        analysisContainer.innerHTML = `
          <div class="alert alert-warning">
            <h5>Fehler beim Laden der KI-Analyse</h5>
            <p>${analysisError.message}</p>
            <button class="btn btn-primary mt-2" onclick="loadProposalAnalysis('${proposalId}')">
              Erneut versuchen
            </button>
          </div>
        `;
      }
    }

    try {
      // Kommentare laden
      await loadProposalComments(proposalId);
    } catch (commentsError) {
      console.error("Fehler beim Laden der Kommentare:", commentsError);
      const commentsContainer = document.getElementById("comments-list");
      if (commentsContainer) {
        commentsContainer.innerHTML = `
          <div class="alert alert-warning">
            <p>Fehler beim Laden der Kommentare: ${commentsError.message}</p>
            <button class="btn btn-sm btn-primary" onclick="loadProposalComments('${proposalId}')">
              Erneut versuchen
            </button>
          </div>
        `;
      }
    }

    try {
      // Kommentarformular einrichten
      setupCommentForm(proposalId);
    } catch (setupError) {
      console.error(
        "Fehler beim Einrichten des Kommentarformulars:",
        setupError
      );
    }

    try {
      // Zusammenfassungsformular einrichten
      setupSummaryForm(proposalId);
    } catch (setupError) {
      console.error(
        "Fehler beim Einrichten des Zusammenfassungsformulars:",
        setupError
      );
      const feedbackContainer = document.getElementById(
        "summary-analysis-feedback"
      );
      if (feedbackContainer) {
        feedbackContainer.innerHTML = `
          <div class="alert alert-warning">
            <p>Fehler beim Einrichten des Formularhandlers: ${setupError.message}</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der Vorschlagsdetails:", error);

    // Statt Umleitung zeigen wir eine Fehlermeldung auf der Seite an
    const mainContainer = document.querySelector(".container .row");
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger my-4">
            <h4 class="alert-heading">Fehler beim Laden des Vorschlags</h4>
            <p>${
              error.message || "Es ist ein unerwarteter Fehler aufgetreten."
            }</p>
            <hr>
            <p class="mb-0">
              <button class="btn btn-primary" onclick="location.reload()">Erneut versuchen</button>
              <a href="proposals.html" class="btn btn-outline-secondary ms-2">Zurück zur Übersicht</a>
            </p>
          </div>
        </div>
      `;
    }
  }
}

// Neue Funktion: KI-Analyse für einen Vorschlag laden
async function loadProposalAnalysis(proposalId) {
  try {
    // Zuerst versuchen, vorhandene Analyse zu laden
    let response = await fetch(
      `${API_BASE_URL}/ai/proposals/${proposalId}/analysis`
    );

    // Wenn keine Analyse gefunden wurde, dynamisch eine neue anfordern
    if (response.status === 404) {
      document.getElementById("ai-analysis-container").innerHTML = `
        <div class="alert alert-info">
          <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Lade...</span>
            </div>
            <span>KI-Analyse wird erstellt... Dies kann einen Moment dauern.</span>
          </div>
        </div>
      `;

      // Anforderung einer neuen Analyse
      const analyzeResponse = await fetch(
        `${API_BASE_URL}/ai/proposals/${proposalId}/analyze`,
        { method: "POST" }
      );

      if (!analyzeResponse.ok) {
        throw new Error(
          `Fehler bei der Analyse-Anforderung: ${analyzeResponse.status}`
        );
      }

      // Nach der Analyse einen Moment warten, damit sie in der Datenbank gespeichert wird
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Erneut versuchen, die Analyse zu laden
      response = await fetch(
        `${API_BASE_URL}/ai/proposals/${proposalId}/analysis`
      );

      if (!response.ok) {
        throw new Error(
          `Die Analyse konnte nicht geladen werden: ${response.status}`
        );
      }
    }

    // Bei anderen Fehlern
    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status}`);
    }

    const analysis = await response.json();

    // Grundlegende Bewertungskriterien in Fortschrittsbalken anzeigen
    if (analysis.aiEvaluation) {
      // Qualität
      const qualityBar = document.getElementById("ai-quality");
      if (qualityBar) {
        const quality = analysis.aiEvaluation.quality * 100;
        qualityBar.style.width = `${quality}%`;
        qualityBar.textContent = `${Math.round(quality)}%`;
      }

      // Relevanz
      const relevanceBar = document.getElementById("ai-relevance");
      if (relevanceBar) {
        const relevance = analysis.aiEvaluation.relevance * 100;
        relevanceBar.style.width = `${relevance}%`;
        relevanceBar.textContent = `${Math.round(relevance)}%`;
      }

      // Umsetzbarkeit
      const feasibilityBar = document.getElementById("ai-feasibility");
      if (feasibilityBar) {
        const feasibility = analysis.aiEvaluation.feasibility * 100;
        feasibilityBar.style.width = `${feasibility}%`;
        feasibilityBar.textContent = `${Math.round(feasibility)}%`;
      }

      // Nachhaltigkeit
      const sustainabilityBar = document.getElementById("ai-sustainability");
      if (sustainabilityBar) {
        const sustainability = analysis.aiEvaluation.sustainability * 100;
        sustainabilityBar.style.width = `${sustainability}%`;
        sustainabilityBar.textContent = `${Math.round(sustainability)}%`;
      }

      // Innovation
      const innovationBar = document.getElementById("ai-innovation");
      if (innovationBar) {
        const innovation = analysis.aiEvaluation.innovation * 100;
        innovationBar.style.width = `${innovation}%`;
        innovationBar.textContent = `${Math.round(innovation)}%`;
      }

      // Stärken und Schwächen anzeigen
      const strengthsList = document.getElementById("ai-strengths");
      if (
        strengthsList &&
        analysis.aiEvaluation.strengths &&
        analysis.aiEvaluation.strengths.length > 0
      ) {
        strengthsList.innerHTML = "";
        analysis.aiEvaluation.strengths.forEach((strength) => {
          const li = document.createElement("li");
          li.textContent = strength;
          strengthsList.appendChild(li);
        });
      } else if (strengthsList) {
        strengthsList.innerHTML =
          "<li class='list-group-item'>Keine spezifischen Stärken identifiziert</li>";
      }

      const weaknessesList = document.getElementById("ai-weaknesses");
      if (
        weaknessesList &&
        analysis.aiEvaluation.weaknesses &&
        analysis.aiEvaluation.weaknesses.length > 0
      ) {
        weaknessesList.innerHTML = "";
        analysis.aiEvaluation.weaknesses.forEach((weakness) => {
          const li = document.createElement("li");
          li.textContent = weakness;
          weaknessesList.appendChild(li);
        });
      } else if (weaknessesList) {
        weaknessesList.innerHTML =
          "<li class='list-group-item'>Keine spezifischen Verbesserungspotenziale identifiziert</li>";
      }

      // Zusammenfassung anzeigen
      const summaryElement = document.getElementById("ai-summary");
      if (summaryElement && analysis.aiEvaluation.summary) {
        summaryElement.textContent = analysis.aiEvaluation.summary;
      } else if (summaryElement) {
        summaryElement.textContent = "Keine Zusammenfassung verfügbar";
      }

      // Kosten-Nutzen-Verhältnis
      const costBenefitElement = document.getElementById("ai-cost-benefit");
      if (costBenefitElement && analysis.aiEvaluation.costBenefitRatio) {
        let costBenefitClass = "text-warning";
        if (analysis.aiEvaluation.costBenefitRatio === "niedrig") {
          costBenefitClass = "text-success";
        } else if (analysis.aiEvaluation.costBenefitRatio === "hoch") {
          costBenefitClass = "text-danger";
        }
        costBenefitElement.innerHTML = `<span class="${costBenefitClass}">${analysis.aiEvaluation.costBenefitRatio}</span>`;
      } else if (costBenefitElement) {
        costBenefitElement.textContent = "mittel";
      }

      // Politische Bereiche
      const domainsElement = document.getElementById("ai-political-domains");
      if (
        domainsElement &&
        analysis.aiEvaluation.politicalDomains &&
        analysis.aiEvaluation.politicalDomains.length > 0
      ) {
        domainsElement.textContent =
          analysis.aiEvaluation.politicalDomains.join(", ");
      } else if (domainsElement) {
        domainsElement.textContent =
          "Keine spezifischen Zuständigkeiten identifiziert";
      }
    }

    // Ähnliche Vorschläge anzeigen
    if (analysis.similarProposals && analysis.similarProposals.length > 0) {
      const similarProposalsContainer = document.getElementById(
        "similar-proposals-list"
      );
      if (similarProposalsContainer) {
        similarProposalsContainer.innerHTML = "";

        for (const similarProposal of analysis.similarProposals) {
          try {
            // Details des ähnlichen Vorschlags abrufen
            const propResponse = await fetch(
              `${API_BASE_URL}/proposals/${similarProposal.proposal}`
            );
            if (propResponse.ok) {
              const propData = await propResponse.json();

              const similarity = Math.round(
                similarProposal.similarityScore * 100
              );
              const listItem = document.createElement("a");
              listItem.href = `proposal-detail.html?id=${propData._id}`;
              listItem.className = "list-group-item list-group-item-action";
              listItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">${propData.title}</h6>
                  <small class="text-muted">${formatDate(
                    propData.createdAt
                  )}</small>
                </div>
                <small class="text-muted">${
                  propData.votes || 0
                } Unterstützer · ${similarity}% Ähnlichkeit</small>
              `;

              similarProposalsContainer.appendChild(listItem);
            }
          } catch (error) {
            console.error("Fehler beim Laden ähnlicher Vorschläge:", error);
          }
        }
      }
    } else {
      const similarProposalsContainer = document.getElementById(
        "similar-proposals-list"
      );
      if (similarProposalsContainer) {
        similarProposalsContainer.innerHTML =
          "<div class='text-center p-3'>Keine ähnlichen Vorschläge gefunden</div>";
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der KI-Analyse:", error);
    document.getElementById("ai-analysis-container").innerHTML = `
      <div class="alert alert-danger">
        Bei der Anzeige der KI-Analyse ist ein Fehler aufgetreten: ${
          error.message
        }
      </div>
      <button class="btn btn-primary mt-2" onclick="loadProposalAnalysis('${getUrlParameter(
        "id"
      )}')">
        Erneut versuchen
      </button>
    `;
  }
}

// Hilfsfunktion um Kategorienamen aus den Kategorien zu extrahieren
function getCategoryNames(proposal) {
  if (proposal.categories && proposal.categories.length > 0) {
    return proposal.categories
      .map((cat) => cat.category?.name || "")
      .filter(Boolean)
      .join(", ");
  }
  return "Keine Kategorie";
}

// Vorschlag-Karte erstellen
function createProposalCard(proposal, isDetailLink = false) {
  const card = document.createElement("div");
  card.className = "card mb-3";

  // Kategorietext erstellen
  const categoryText = getCategoryNames(proposal);

  // Autor-Text erstellen
  let authorText = "Anonymer Nutzer";
  if (proposal.user) {
    if (typeof proposal.user === "object") {
      const firstName = proposal.user.firstName || "";
      const lastName = proposal.user.lastName || "";
      authorText = `${firstName} ${lastName}`.trim() || authorText;
    } else {
      // Falls user nur eine ID ist
      authorText = "Nutzer";
    }
  }

  // Ziel-URL für Links
  const linkUrl = isDetailLink
    ? `proposal-detail.html?id=${proposal._id}`
    : `#`;

  card.innerHTML = `
        <div class="card-body">
            <span class="badge ${getStatusBadgeClass(
              proposal.status
            )}">${getStatusText(proposal.status)}</span>
            <h5 class="card-title mt-2">
                <a href="${linkUrl}" class="text-dark text-decoration-none">${
    proposal.title
  }</a>
            </h5>
            <p class="card-text">${proposal.content.substring(0, 150)}${
    proposal.content.length > 150 ? "..." : ""
  }</p>
            <div class="d-flex justify-content-between align-items-center">
                <div class="small text-muted">
                    ${categoryText} | ${formatDate(
    proposal.createdAt
  )} | ${authorText}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary vote-btn" data-id="${
                      proposal._id
                    }">
                        <i class="bi bi-hand-thumbs-up"></i> ${
                          proposal.votes || 0
                        }
                    </button>
                </div>
            </div>
        </div>
    `;

  // Event-Listener für Abstimmungen hinzufügen
  const voteBtn = card.querySelector(".vote-btn");
  if (voteBtn) {
    voteBtn.addEventListener("click", function (e) {
      e.preventDefault();
      voteForProposal(this.dataset.id);
    });
  }

  return card;
}

// Filter-Setup
function setupFilters() {
  const filterForm = document.getElementById("filter-form");
  if (filterForm) {
    filterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const filters = {
        category: document.getElementById("category-filter").value,
        status: document.getElementById("status-filter").value,
        ministry: document.getElementById("ministry-filter").value,
        search: document.getElementById("search-input").value,
      };

      loadAllProposals(1, filters);
    });
  }
}

// Paginierung einrichten
function setupPagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  const ul = document.createElement("ul");
  ul.className = "pagination justify-content-center";

  // Vorherige Seite
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `<a class="page-link" href="#" data-page="${
    currentPage - 1
  }">Vorherige</a>`;
  ul.appendChild(prevLi);

  // Seitenzahlen
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    ul.appendChild(li);
  }

  // Nächste Seite
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextLi.innerHTML = `<a class="page-link" href="#" data-page="${
    currentPage + 1
  }">Nächste</a>`;
  ul.appendChild(nextLi);

  paginationContainer.appendChild(ul);

  // Event-Listener für Paginierung
  paginationContainer.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = parseInt(this.dataset.page);
      if (page && page !== currentPage) {
        loadAllProposals(page);
      }
    });
  });
}

// Einreichungsformular einrichten
function setupSubmitForm() {
  const submitForm = document.getElementById("proposal-form");
  if (submitForm) {
    submitForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("proposal-title-input").value;
      const content = document.getElementById("proposal-content-input").value;
      const category = document.getElementById("proposal-category").value;
      const tags = document.getElementById("proposal-tags-input").value;

      if (!title || !content || !category) {
        alert("Bitte füllen Sie alle Pflichtfelder aus.");
        return;
      }

      try {
        // Statusanzeige anzeigen
        const statusDiv = document.createElement("div");
        statusDiv.className = "alert alert-info mt-3";
        statusDiv.id = "submission-status";
        statusDiv.innerHTML =
          "Ihr Vorschlag wird eingereicht und analysiert...";
        submitForm.appendChild(statusDiv);

        // Submit-Button deaktivieren
        const submitButton = submitForm.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        // Kategorien abrufen, um die richtige Kategorie-ID zu finden
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        const categories = await categoriesResponse.json();

        // Finde die Kategorie-ID anhand des Namens
        const selectedCategory = categories.find(
          (cat) => cat.name === category
        );

        if (!selectedCategory) {
          statusDiv.className = "alert alert-danger mt-3";
          statusDiv.textContent =
            "Die ausgewählte Kategorie konnte nicht gefunden werden.";
          if (submitButton) submitButton.disabled = false;
          return;
        }

        // Bereite Tags für die Übermittlung vor
        const tagList = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        // Erstelle den Vorschlag im neuen Format
        const proposalData = {
          title,
          content,
          status: "submitted",
          categories: [
            {
              category: selectedCategory._id,
              assignmentType: "manual",
            },
          ],
          visibility: "public",
          aiAnalysis: {
            keywords: tagList,
          },
        };

        // Mit autoAnalyze=true URL-Parameter für sofortige Analyse
        const response = await fetch(
          `${API_BASE_URL}/proposals?autoAnalyze=true`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(proposalData),
          }
        );

        // Prüfe den HTTP-Status
        if (response.ok) {
          const responseData = await response.json();

          // Wenn der Vorschlag automatisch zusammengeführt wurde
          if (responseData.mergedProposal) {
            statusDiv.className = "alert alert-success mt-3";
            statusDiv.innerHTML = `
              <h5>Ihr Vorschlag wurde mit ähnlichen Vorschlägen zusammengeführt!</h5>
              <p>Wir haben festgestellt, dass Ihr Vorschlag ähnlich zu bereits existierenden Vorschlägen ist.</p>
              <p>Ein neuer, zusammengeführter Vorschlag wurde erstellt, der die wichtigsten Aspekte aller Vorschläge enthält.</p>
              <p>Sie werden in 5 Sekunden weitergeleitet...</p>
            `;

            // Nach 5 Sekunden zur Detailseite des zusammengeführten Vorschlags weiterleiten
            setTimeout(() => {
              window.location.href =
                "proposal-detail.html?id=" + responseData.mergedProposal._id;
            }, 5000);
          } else {
            // Normaler Erfolgsfall ohne Zusammenführung
            statusDiv.className = "alert alert-success mt-3";
            statusDiv.textContent =
              "Ihr Vorschlag wurde erfolgreich eingereicht!";

            // Nach 2 Sekunden zur Detailseite weiterleiten
            setTimeout(() => {
              window.location.href =
                "proposal-detail.html?id=" + responseData._id;
            }, 2000);
          }
        } else {
          // Fehlerfall
          const errorData = await response.json();
          let errorMessage = "Ein unbekannter Fehler ist aufgetreten.";

          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage =
              typeof errorData.error === "string"
                ? errorData.error
                : JSON.stringify(errorData.error);
          }

          statusDiv.className = "alert alert-danger mt-3";
          statusDiv.textContent =
            "Fehler beim Einreichen des Vorschlags: " + errorMessage;
          if (submitButton) submitButton.disabled = false;
        }
      } catch (error) {
        console.error("Fehler beim Einreichen des Vorschlags:", error);
        const statusDiv = document.getElementById("submission-status");
        if (statusDiv) {
          statusDiv.className = "alert alert-danger mt-3";
          statusDiv.textContent =
            "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
        }

        // Submit-Button wieder aktivieren
        const submitButton = submitForm.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
}

// Kommentarformular einrichten
function setupCommentForm(proposalId) {
  const commentForm = document.getElementById("comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const content = document.getElementById("comment-content").value;

      if (!content) {
        alert("Bitte geben Sie einen Kommentar ein.");
        return;
      }

      try {
        // Simulieren eines einfachen Nutzers (in einer echten Anwendung würde hier eine Authentifizierung stattfinden)
        // Annahme: Wir verwenden einen festen Nutzer für Demo-Zwecke
        const usersResponse = await fetch(`${API_BASE_URL}/proposals`);
        const proposals = await usersResponse.json();

        // Nehmen wir an, dass der erste Vorschlag einen Benutzer hat, den wir verwenden können
        let userId = null;
        if (proposals && proposals.length > 0 && proposals[0].user) {
          userId = proposals[0].user._id || proposals[0].user;
        }

        if (!userId) {
          alert("Für die Demo-Funktion konnte kein Benutzer gefunden werden.");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/proposals/${proposalId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content,
              userId,
            }),
          }
        );

        // Prüfe den HTTP-Status
        if (response.ok) {
          const newComment = await response.json();
          alert("Ihr Kommentar wurde erfolgreich hinzugefügt!");

          // Kommentare neu laden, statt die Seite zu aktualisieren
          loadProposalComments(proposalId);

          // Kommentarformular zurücksetzen
          document.getElementById("comment-content").value = "";
        } else {
          // Fehlerfall
          const errorData = await response.json();
          let errorMessage = "Ein unbekannter Fehler ist aufgetreten.";

          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage =
              typeof errorData.error === "string"
                ? errorData.error
                : JSON.stringify(errorData.error);
          }

          alert("Fehler beim Hinzufügen des Kommentars: " + errorMessage);
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen des Kommentars:", error);
        alert(
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        );
      }
    });
  }
}

// Hilfsfunktionen

// Status-Text abrufen
function getStatusText(status) {
  const statusMap = {
    submitted: "Eingereicht",
    processing: "In Bearbeitung",
    answered: "Beantwortet",
    completed: "Umgesetzt",
    rejected: "Abgelehnt",
  };

  return statusMap[status] || status;
}

// Datum formatieren
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// URL-Parameter abrufen
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Abstimmungsfunktion
async function voteForProposal(proposalId) {
  try {
    // Da wir keinen dedizierten Vote-Endpunkt haben,
    // aktualisieren wir den Vorschlag direkt mit einer erhöhten Stimmenzahl

    // Zuerst den aktuellen Vorschlag abrufen
    const getResponse = await fetch(`${API_BASE_URL}/proposals/${proposalId}`);

    if (!getResponse.ok) {
      alert("Fehler beim Abstimmen: Vorschlag konnte nicht gefunden werden.");
      return;
    }

    const proposal = await getResponse.json();

    // Stimmen erhöhen
    const currentVotes = proposal.votes || 0;
    const updatedVotes = currentVotes + 1;

    // Vorschlag aktualisieren
    const updateResponse = await fetch(
      `${API_BASE_URL}/proposals/${proposalId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          votes: updatedVotes,
        }),
      }
    );

    if (updateResponse.ok) {
      // Aktualisiere die Anzeige der Stimmen
      const voteButtons = document.querySelectorAll(
        `.vote-btn[data-id="${proposalId}"]`
      );
      voteButtons.forEach((button) => {
        button.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> ${updatedVotes}`;
      });

      const votesElement = document.getElementById("proposal-votes");
      if (votesElement) {
        votesElement.textContent = updatedVotes;
      }

      alert("Ihre Stimme wurde gezählt!");
    } else {
      const errorData = await updateResponse.json();
      let errorMessage = "Ein unbekannter Fehler ist aufgetreten.";

      if (errorData.message) {
        errorMessage = errorData.message;
      }

      alert("Fehler beim Abstimmen: " + errorMessage);
    }
  } catch (error) {
    console.error("Fehler beim Abstimmen:", error);
    alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
  }
}

// Statusfarbe für Badges zurückgeben
function getStatusBadgeClass(status) {
  const statusClasses = {
    submitted: "bg-info",
    processing: "bg-warning",
    categorized: "bg-primary",
    forwarded: "bg-secondary",
    answered: "bg-success",
    completed: "bg-success",
    rejected: "bg-danger",
  };

  return statusClasses[status] || "bg-secondary";
}

// Kommentare für einen Vorschlag laden
async function loadProposalComments(proposalId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/proposals/${proposalId}/comments`
    );
    const comments = await response.json();

    const commentsContainer = document.getElementById("comments-list");
    if (!commentsContainer) return;

    commentsContainer.innerHTML = "";

    if (comments && comments.length > 0) {
      comments.forEach((comment) => {
        const commentEl = document.createElement("div");
        commentEl.className = "card mb-3";

        // Autorenname zusammenstellen
        let authorName = "Anonymer Nutzer";
        if (comment.user) {
          const firstName = comment.user.firstName || "";
          const lastName = comment.user.lastName || "";
          authorName = `${firstName} ${lastName}`.trim() || authorName;

          // Falls es eine offizielle Antwort ist, Ministerium/Behörde anzeigen
          if (comment.isOfficial && comment.user.userType === "ministry") {
            authorName += " (Ministerium)";
          }
        }

        commentEl.innerHTML = `
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="card-subtitle text-muted">
                ${
                  comment.isOfficial
                    ? '<span class="badge bg-primary me-2">Offiziell</span>'
                    : ""
                }
                ${authorName}
              </h6>
              <small class="text-muted">${formatDate(comment.createdAt)}</small>
            </div>
            <p class="card-text">${comment.content}</p>
          </div>
        `;
        commentsContainer.appendChild(commentEl);
      });
    } else {
      commentsContainer.innerHTML =
        '<div class="alert alert-info">Keine Kommentare vorhanden.</div>';
    }
  } catch (error) {
    console.error("Fehler beim Laden der Kommentare:", error);
    if (document.getElementById("comments-list")) {
      document.getElementById("comments-list").innerHTML =
        '<div class="alert alert-danger">Fehler beim Laden der Kommentare.</div>';
    }
  }
}

// Analysiert eine Zusammenfassung eines Vorschlags
async function analyzeSummary(proposalId, summaryText) {
  try {
    if (!proposalId || !summaryText) {
      throw new Error("Proposal ID und Zusammenfassung sind erforderlich");
    }

    console.log(`Analysiere Zusammenfassung für Vorschlag ${proposalId}`);

    // Feedback-Element aktualisieren
    const feedbackEl = document.getElementById("summary-analysis-feedback");
    if (feedbackEl) {
      feedbackEl.innerHTML = `
        <div class="alert alert-info">
          <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Wird analysiert...</span>
            </div>
            <span>Die Zusammenfassung wird analysiert. Dies kann einen Moment dauern...</span>
          </div>
        </div>
      `;
    }

    // API-Aufruf zur Analyse der Zusammenfassung
    const response = await fetch(
      `${API_BASE_URL}/ai/proposals/${proposalId}/analyze-summary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summary: summaryText }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP-Fehler: ${response.status}`,
      }));
      throw new Error(errorData.message || `HTTP-Fehler: ${response.status}`);
    }

    const data = await response.json();
    console.log("Analyseergebnis:", data);

    if (!data || !data.aiEvaluation) {
      throw new Error("Die API-Antwort enthält keine Analysedaten");
    }

    // Ergebnisse anzeigen
    if (feedbackEl) {
      let qualityScore = data.aiEvaluation.quality || 0;
      let relevanceScore = data.aiEvaluation.relevance || 0;
      let feasibilityScore = data.aiEvaluation.feasibility || 0;
      let sustainabilityScore = data.aiEvaluation.sustainability || 0;
      let innovationScore = data.aiEvaluation.innovation || 0;

      // Formatiere die Scores als Prozentsätze
      const formatPercent = (value) => {
        return Math.round(value * 100);
      };

      feedbackEl.innerHTML = `
        <div class="alert alert-success mb-4">
          <h5><i class="bi bi-check-circle-fill me-2"></i> Analyse abgeschlossen</h5>
          <p>Die KI-Analyse Ihrer Zusammenfassung ist abgeschlossen. Hier sind die Ergebnisse:</p>
        </div>
        
        <div class="mb-3">
          <label class="form-label fw-bold">Qualität: ${formatPercent(
            qualityScore
          )}%</label>
          <div class="progress">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${formatPercent(
              qualityScore
            )}%" aria-valuenow="${formatPercent(
        qualityScore
      )}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
        
        <div class="mb-3">
          <label class="form-label fw-bold">Relevanz: ${formatPercent(
            relevanceScore
          )}%</label>
          <div class="progress">
            <div class="progress-bar bg-info" role="progressbar" style="width: ${formatPercent(
              relevanceScore
            )}%" aria-valuenow="${formatPercent(
        relevanceScore
      )}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
        
        <div class="mb-3">
          <label class="form-label fw-bold">Umsetzbarkeit: ${formatPercent(
            feasibilityScore
          )}%</label>
          <div class="progress">
            <div class="progress-bar bg-warning" role="progressbar" style="width: ${formatPercent(
              feasibilityScore
            )}%" aria-valuenow="${formatPercent(
        feasibilityScore
      )}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
        
        <div class="mb-3">
          <label class="form-label fw-bold">Nachhaltigkeit: ${formatPercent(
            sustainabilityScore
          )}%</label>
          <div class="progress">
            <div class="progress-bar bg-primary" role="progressbar" style="width: ${formatPercent(
              sustainabilityScore
            )}%" aria-valuenow="${formatPercent(
        sustainabilityScore
      )}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
        
        <div class="mb-3">
          <label class="form-label fw-bold">Innovationsgrad: ${formatPercent(
            innovationScore
          )}%</label>
          <div class="progress">
            <div class="progress-bar bg-danger" role="progressbar" style="width: ${formatPercent(
              innovationScore
            )}%" aria-valuenow="${formatPercent(
        innovationScore
      )}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
        
        ${
          data.aiEvaluation.summary
            ? `
        <div class="mt-3">
          <h6 class="fw-bold">Zusammenfassung der Analyse:</h6>
          <p>${data.aiEvaluation.summary}</p>
        </div>
        `
            : ""
        }
      `;
    }

    return data;
  } catch (error) {
    console.error("Fehler bei der Analyse der Zusammenfassung:", error);

    // Benutzerfreundliche Fehlermeldung anzeigen
    const feedbackEl = document.getElementById("summary-analysis-feedback");
    if (feedbackEl) {
      feedbackEl.innerHTML = `
        <div class="alert alert-danger">
          <h5><i class="bi bi-exclamation-triangle-fill me-2"></i> Fehler bei der Analyse</h5>
          <p>${
            error.message || "Es ist ein unbekannter Fehler aufgetreten."
          }</p>
          <button class="btn btn-outline-danger btn-sm mt-2" onclick="document.getElementById('summary-form').dispatchEvent(new Event('submit'))">
            <i class="bi bi-arrow-clockwise me-1"></i> Erneut versuchen
          </button>
        </div>
      `;
    }

    throw error; // Für die aufrufende Funktion weiterwerfen
  }
}

// Richtet das Zusammenfassungsformular ein
function setupSummaryForm(proposalId) {
  const form = document.getElementById("summary-form");
  if (!form) {
    console.error("Zusammenfassungsformular nicht gefunden");
    return;
  }

  console.log(
    `Richte Zusammenfassungsformular für Vorschlag ${proposalId} ein`
  );

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      const summaryText = document.getElementById("summary-text").value.trim();
      if (!summaryText) {
        throw new Error("Bitte geben Sie eine Zusammenfassung ein");
      }

      console.log(
        "Sende Zusammenfassung zur Analyse:",
        summaryText.substring(0, 50) + "..."
      );

      // Formulareingabe deaktivieren
      const submitButton = form.querySelector("button[type=submit]");
      const textarea = document.getElementById("summary-text");
      if (submitButton) submitButton.disabled = true;
      if (textarea) textarea.disabled = true;

      // Analyse durchführen
      const result = await analyzeSummary(proposalId, summaryText);

      // Formulareingabe wieder aktivieren
      if (submitButton) submitButton.disabled = false;
      if (textarea) textarea.disabled = false;

      console.log("Analyse erfolgreich abgeschlossen");
    } catch (error) {
      console.error("Fehler beim Verarbeiten des Formulars:", error);

      // Formulareingabe wieder aktivieren
      const submitButton = form.querySelector("button[type=submit]");
      const textarea = document.getElementById("summary-text");
      if (submitButton) submitButton.disabled = false;
      if (textarea) textarea.disabled = false;
    }
  });
}
