// Hauptanwendungslogik für das Bürgerbeteiligungssystem

// API-Basis-URL
const API_BASE_URL = '/api/v1';

// DOM-Elemente laden, wenn das Dokument bereit ist
document.addEventListener('DOMContentLoaded', function() {
    // Aktuelle Seite ermitteln
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Seiten-spezifische Funktionen aufrufen
    switch(currentPage) {
        case 'index.html':
            loadRecentProposals();
            loadCategories();
            loadStatisticsOverview();
            break;
        case 'proposals.html':
            loadAllProposals();
            loadCategories();
            setupFilters();
            break;
        case 'submit-proposal.html':
            loadCategories();
            setupSubmitForm();
            break;
        case 'statistics.html':
            loadDetailedStatistics();
            break;
        case 'proposal-detail.html':
            const proposalId = getUrlParameter('id');
            if (proposalId) {
                loadProposalDetails(proposalId);
            } else {
                window.location.href = 'proposals.html';
            }
            break;
    }
});

// Aktuelle Vorschläge für die Startseite laden
async function loadRecentProposals() {
    try {
        const response = await fetch(`${API_BASE_URL}/proposals?limit=3`);
        const data = await response.json();
        
        if (data.success) {
            const proposalsContainer = document.getElementById('recent-proposals');
            proposalsContainer.innerHTML = '';
            
            data.proposals.forEach(proposal => {
                proposalsContainer.appendChild(createProposalCard(proposal));
            });
        }
    } catch (error) {
        console.error('Fehler beim Laden der aktuellen Vorschläge:', error);
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
        
        if (data.success) {
            const proposalsContainer = document.getElementById('proposals-list');
            proposalsContainer.innerHTML = '';
            
            if (data.proposals.length === 0) {
                proposalsContainer.innerHTML = '<div class="alert alert-info">Keine Vorschläge gefunden.</div>';
                return;
            }
            
            data.proposals.forEach(proposal => {
                proposalsContainer.appendChild(createProposalCard(proposal, true));
            });
            
            // Paginierung erstellen
            setupPagination(data.current_page, data.total_pages);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Vorschläge:', error);
    }
}

// Kategorien laden
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        
        if (data.success) {
            const categoriesList = document.getElementById('categories-list');
            if (categoriesList) {
                categoriesList.innerHTML = '';
                
                data.categories.forEach(category => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';
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
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                categoryFilter.innerHTML = '<option value="">Alle Kategorien</option>';
                
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
            }
            
            // Kategorien für Einreichungsformular
            const categorySelect = document.getElementById('proposal-category');
            if (categorySelect) {
                categorySelect.innerHTML = '<option value="">Kategorie auswählen</option>';
                
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
    }
}

// Statistik-Übersicht laden
async function loadStatisticsOverview() {
    try {
        const response = await fetch(`${API_BASE_URL}/statistics`);
        const data = await response.json();
        
        if (data.success) {
            const statsContainer = document.getElementById('statistics-overview');
            if (statsContainer) {
                const stats = data.statistics;
                
                statsContainer.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Vorschläge gesamt:</span>
                        <span class="stat-value">${stats.total_proposals}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">In Bearbeitung:</span>
                        <span class="stat-value">${stats.proposals_by_status.processing}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Beantwortet:</span>
                        <span class="stat-value">${stats.proposals_by_status.answered}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Umsetzungsrate:</span>
                        <span class="stat-value">${Math.round(stats.implementation_rate * 100)}%</span>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
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
            const statusChart = document.getElementById('status-chart');
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
            const categoryChart = document.getElementById('category-chart');
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
                            ${categoryData.map(item => `
                                <tr>
                                    <td>${item.category}</td>
                                    <td>${item.count}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            // Ministeriums-Verteilung
            const ministryChart = document.getElementById('ministry-chart');
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
                            ${ministryData.map(item => `
                                <tr>
                                    <td>${item.ministry}</td>
                                    <td>${item.count}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            // Weitere Statistiken
            const additionalStats = document.getElementById('additional-stats');
            if (additionalStats) {
                additionalStats.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Weitere Kennzahlen</h5>
                            <div class="stat-item">
                                <span class="stat-label">Durchschnittliche Bearbeitungszeit:</span>
                                <span class="stat-value">${stats.average_processing_time} Tage</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Umsetzungsrate:</span>
                                <span class="stat-value">${Math.round(stats.implementation_rate * 100)}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Fehler beim Laden der detaillierten Statistiken:', error);
    }
}

// Vorschlagsdetails laden
async function loadProposalDetails(proposalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`);
        const data = await response.json();
        
        if (data.success) {
            const proposal = data.proposal;
            
            // Titel und Metadaten
            document.getElementById('proposal-title').textContent = proposal.title;
            document.getElementById('proposal-category').textContent = proposal.category;
            document.getElementById('proposal-status').textContent = getStatusText(proposal.status);
            document.getElementById('proposal-status').className = `status-badge status-${proposal.status}`;
            document.getElementById('proposal-date').textContent = formatDate(proposal.created_at);
            document.getElementById('proposal-ministry').textContent = proposal.ministry || 'Noch nicht zugeordnet';
            document.getElementById('proposal-votes').textContent = proposal.votes;
            
            // Inhalt
            document.getElementById('proposal-content').textContent = proposal.content;
            
            // Tags
            const tagsContainer = document.getElementById('proposal-tags');
            tagsContainer.innerHTML = '';
            proposal.tags.forEach(tag => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary me-1';
                badge.textContent = tag;
                tagsContainer.appendChild(badge);
            });
            
            // Autor
            if (proposal.user) {
                document.getElementById('proposal-author').textContent = proposal.anonymous ? 'Anonym' : proposal.user.name;
            }
            
            // KI-Analyse
            if (proposal.ai_analysis) {
                const analysis = proposal.ai_analysis;
                document.getElementById('ai-quality').style.width = `${analysis.quality * 100}%`;
                document.getElementById('ai-relevance').style.width = `${analysis.relevance * 100}%`;
                document.getElementById('ai-feasibility').style.width = `${analysis.feasibility * 100}%`;
            }
            
            // Kommentare
            const commentsContainer = document.getElementById('comments-list');
            commentsContainer.innerHTML = '';
            
            if (proposal.comments && proposal.comments.length > 0) {
                proposal.comments.forEach(comment => {
                    const commentEl = document.createElement('div');
                    commentEl.className = 'card mb-3';
                    commentEl.innerHTML = `
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="card-subtitle text-muted">
                                    ${comment.official ? '<span class="badge bg-primary me-2">Offiziell</span>' : ''}
                                    ${comment.user.name}
                                </h6>
                                <small class="text-muted">${formatDate(comment.created_at)}</small>
                            </div>
                            <p class="card-text">${comment.content}</p>
                        </div>
                    `;
                    commentsContainer.appendChild(commentEl);
                });
            } else {
                commentsContainer.innerHTML = '<div class="alert alert-info">Keine Kommentare vorhanden.</div>';
            }
            
            // Kommentarformular
            setupCommentForm(proposalId);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Vorschlagsdetails:', error);
    }
}

// Vorschlagskarte erstellen
function createProposalCard(proposal, isDetailLink = false) {
    const card = document.createElement('div');
    card.className = 'proposal-card';
    
    // Kategorie-Klasse bestimmen
    const categoryClass = `category-${proposal.category.toLowerCase()}`;
    
    // Status-Badge
    const statusBadge = `<span class="status-badge status-${proposal.status}">${getStatusText(proposal.status)}</span>`;
    
    // Gekürzter Inhalt
    const shortContent = proposal.content.length > 150 
        ? proposal.content.substring(0, 150) + '...' 
        : proposal.content;
    
    // Link-Ziel
    const linkTarget = isDetailLink 
        ? `proposal-detail.html?id=${proposal.id}` 
        : `#`;
    
    card.innerHTML = `
        <div class="proposal-title">
            <a href="${linkTarget}" class="text-decoration-none text-dark">${proposal.title}</a>
        </div>
        <div class="proposal-content">${shortContent}</div>
        <div class="proposal-meta">
            <div>
                <span class="proposal-category ${categoryClass}">${proposal.category}</span>
                ${statusBadge}
                <small class="ms-2">${formatDate(proposal.created_at)}</small>
            </div>
            <div class="proposal-votes">
                <i class="bi bi-hand-thumbs-up"></i> ${proposal.votes}
            </div>
        </div>
    `;
    
    return card;
}

// Filter-Setup
function setupFilters() {
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const filters = {
                category: document.getElementById('category-filter').value,
                status: document.getElementById('status-filter').value,
                ministry: document.getElementById('ministry-filter').value,
                search: document.getElementById('search-input').value
            };
            
            loadAllProposals(1, filters);
        });
    }
}

// Paginierung einrichten
function setupPagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';
    
    // Vorherige Seite
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">Vorherige</a>`;
    ul.appendChild(prevLi);
    
    // Seitenzahlen
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        ul.appendChild(li);
    }
    
    // Nächste Seite
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Nächste</a>`;
    ul.appendChild(nextLi);
    
    paginationContainer.appendChild(ul);
    
    // Event-Listener für Paginierung
    paginationContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
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
    const submitForm = document.getElementById('proposal-form');
    if (submitForm) {
        submitForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('proposal-title-input').value;
            const content = document.getElementById('proposal-content-input').value;
            const category = document.getElementById('proposal-category').value;
            const tags = document.getElementById('proposal-tags-input').value;
            
            if (!title || !content || !category) {
                alert('Bitte füllen Sie alle Pflichtfelder aus.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/proposals`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        content,
                        category,
                        tags
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Ihr Vorschlag wurde erfolgreich eingereicht!');
                    window.location.href = 'proposal-detail.html?id=' + data.proposal.id;
                } else {
                    alert('Fehler beim Einreichen des Vorschlags: ' + data.error.message);
                }
            } catch (error) {
                console.error('Fehler beim Einreichen des Vorschlags:', error);
                alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        });
    }
}

// Kommentarformular einrichten
function setupCommentForm(proposalId) {
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const content = document.getElementById('comment-content').value;
            
            if (!content) {
                alert('Bitte geben Sie einen Kommentar ein.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Ihr Kommentar wurde erfolgreich hinzugefügt!');
                    // Seite neu laden, um den neuen Kommentar anzuzeigen
                    window.location.reload();
                } else {
                    alert('Fehler beim Hinzufügen des Kommentars: ' + data.error.message);
                }
            } catch (error) {
                console.error('Fehler beim Hinzufügen des Kommentars:', error);
                alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        });
    }
}

// Hilfsfunktionen

// Status-Text abrufen
function getStatusText(status) {
    const statusMap = {
        'submitted': 'Eingereicht',
        'processing': 'In Bearbeitung',
        'answered': 'Beantwortet',
        'completed': 'Umgesetzt',
        'rejected': 'Abgelehnt'
    };
    
    return statusMap[status] || status;
}

// Datum formatieren
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
        const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/vote`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Stimmenanzahl aktualisieren
            const votesElement = document.getElementById('proposal-votes');
            if (votesElement) {
                votesElement.textContent = data.votes;
            }
            
            alert('Ihre Stimme wurde gezählt!');
        } else {
            alert('Fehler beim Abstimmen: ' + data.error.message);
        }
    } catch (error) {
        console.error('Fehler beim Abstimmen:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
}
