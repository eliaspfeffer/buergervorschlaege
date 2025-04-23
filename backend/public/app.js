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

    // Anpassen für neue API-Struktur (keine success-Property)
    const proposals = data;

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

    // Anpassen für neue API-Struktur
    const proposals = data;

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

        // Vereinfachte Paginierung ohne Gesamtseiten
        setupPagination(page, Math.ceil(proposals.length / 10) + 1);
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
    const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`);
    const proposal = await response.json();

    // Bei Fehler zur Übersichtsseite umleiten
    if (!proposal) {
      window.location.href = "proposals.html";
      return;
    }

    // Details anzeigen
    document.getElementById("proposal-title").textContent = proposal.title;
    document.getElementById("proposal-content").textContent = proposal.content;
    document.getElementById("proposal-category").textContent =
      getCategoryNames(proposal);
    document.getElementById("proposal-status").textContent = getStatusText(
      proposal.status
    );
    document.getElementById("proposal-date").textContent = formatDate(
      proposal.createdAt
    );
    document.getElementById("proposal-votes").textContent = proposal.votes || 0;

    // Benutzerinfo anzeigen, falls vorhanden
    if (proposal.user) {
      const userName = `${proposal.user.firstName || ""} ${
        proposal.user.lastName || ""
      }`.trim();
      document.getElementById("proposal-author").textContent =
        userName || "Anonymer Nutzer";
    } else {
      document.getElementById("proposal-author").textContent =
        "Anonymer Nutzer";
    }

    // Kommentare laden
    loadProposalComments(proposalId);

    // Kommentarformular einrichten
    setupCommentForm(proposalId);
  } catch (error) {
    console.error("Fehler beim Laden der Vorschlagsdetails:", error);
    window.location.href = "proposals.html";
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
        // Kategorien abrufen, um die richtige Kategorie-ID zu finden
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        const categories = await categoriesResponse.json();

        // Finde die Kategorie-ID anhand des Namens
        const selectedCategory = categories.find(
          (cat) => cat.name === category
        );

        if (!selectedCategory) {
          alert("Die ausgewählte Kategorie konnte nicht gefunden werden.");
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

        const response = await fetch(`${API_BASE_URL}/proposals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(proposalData),
        });

        // Prüfe den HTTP-Status
        if (response.ok) {
          const newProposal = await response.json();
          alert("Ihr Vorschlag wurde erfolgreich eingereicht!");

          // Navigiere zur Detailseite mit der richtigen ID
          window.location.href = "proposal-detail.html?id=" + newProposal._id;
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

          alert("Fehler beim Einreichen des Vorschlags: " + errorMessage);
        }
      } catch (error) {
        console.error("Fehler beim Einreichen des Vorschlags:", error);
        alert(
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        );
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
