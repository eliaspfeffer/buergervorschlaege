// API-Endpunkte für das Bürgerbeteiligungssystem

/**
 * Dieses Dokument definiert die API-Endpunkte für das Bürgerbeteiligungssystem.
 * Es beschreibt die verfügbaren Routen, Parameter, Anforderungen und Antwortformate.
 */

// Basis-URL für alle API-Endpunkte
const BASE_URL = '/api/v1';

// Authentifizierung
/**
 * @route POST /auth/register
 * @description Registriert einen neuen Benutzer
 * @access Public
 * 
 * @body {
 *   email: string,
 *   password: string,
 *   name: string,
 *   role: string (default: "citizen")
 * }
 * 
 * @response {
 *   success: boolean,
 *   token: string,
 *   user: {
 *     id: string,
 *     name: string,
 *     email: string,
 *     role: string
 *   }
 * }
 */

/**
 * @route POST /auth/login
 * @description Authentifiziert einen Benutzer und gibt ein JWT-Token zurück
 * @access Public
 * 
 * @body {
 *   email: string,
 *   password: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   token: string,
 *   user: {
 *     id: string,
 *     name: string,
 *     email: string,
 *     role: string
 *   }
 * }
 */

/**
 * @route GET /auth/me
 * @description Gibt die Informationen des aktuell authentifizierten Benutzers zurück
 * @access Private
 * 
 * @response {
 *   id: string,
 *   name: string,
 *   email: string,
 *   role: string,
 *   created_at: string,
 *   interests: string[]
 * }
 */

/**
 * @route PUT /auth/me
 * @description Aktualisiert die Informationen des aktuell authentifizierten Benutzers
 * @access Private
 * 
 * @body {
 *   name: string,
 *   interests: string[],
 *   notification_settings: object
 * }
 * 
 * @response {
 *   success: boolean,
 *   user: {
 *     id: string,
 *     name: string,
 *     email: string,
 *     role: string,
 *     interests: string[],
 *     notification_settings: object
 *   }
 * }
 */

// Vorschläge
/**
 * @route GET /proposals
 * @description Gibt eine Liste von Vorschlägen zurück, mit Filtern und Paginierung
 * @access Public
 * 
 * @query {
 *   page: number (default: 1),
 *   limit: number (default: 10),
 *   category: string,
 *   status: string,
 *   ministry: string,
 *   search: string,
 *   sort_by: string (default: "created_at"),
 *   sort_order: string (default: "desc"),
 *   user_id: string (nur für authentifizierte Benutzer)
 * }
 * 
 * @response {
 *   success: boolean,
 *   count: number,
 *   total_pages: number,
 *   current_page: number,
 *   proposals: [
 *     {
 *       id: string,
 *       title: string,
 *       content: string (gekürzt),
 *       user: {
 *         id: string,
 *         name: string
 *       },
 *       anonymous: boolean,
 *       category: string,
 *       secondary_categories: string[],
 *       status: string,
 *       ministry: string,
 *       created_at: string,
 *       updated_at: string,
 *       votes: number
 *     }
 *   ]
 * }
 */

/**
 * @route GET /proposals/:id
 * @description Gibt die Details eines bestimmten Vorschlags zurück
 * @access Public
 * 
 * @params {
 *   id: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   proposal: {
 *     id: string,
 *     title: string,
 *     content: string,
 *     user: {
 *       id: string,
 *       name: string
 *     },
 *     anonymous: boolean,
 *     category: string,
 *     secondary_categories: string[],
 *     tags: string[],
 *     status: string,
 *     ministry: string,
 *     created_at: string,
 *     updated_at: string,
 *     votes: number,
 *     attachments: [
 *       {
 *         id: string,
 *         filename: string,
 *         url: string,
 *         content_type: string
 *       }
 *     ],
 *     comments: [
 *       {
 *         id: string,
 *         content: string,
 *         user: {
 *           id: string,
 *           name: string,
 *           role: string
 *         },
 *         created_at: string
 *       }
 *     ],
 *     status_history: [
 *       {
 *         status: string,
 *         timestamp: string,
 *         comment: string
 *       }
 *     ],
 *     ai_analysis: {
 *       quality: number,
 *       relevance: number,
 *       feasibility: number
 *     }
 *   }
 * }
 */

/**
 * @route POST /proposals
 * @description Erstellt einen neuen Vorschlag
 * @access Private
 * 
 * @body {
 *   title: string,
 *   content: string,
 *   category: string,
 *   tags: string[],
 *   anonymous: boolean,
 *   attachments: File[]
 * }
 * 
 * @response {
 *   success: boolean,
 *   proposal: {
 *     id: string,
 *     title: string,
 *     content: string,
 *     category: string,
 *     secondary_categories: string[],
 *     tags: string[],
 *     status: string,
 *     ministry: string,
 *     created_at: string
 *   }
 * }
 */

/**
 * @route PUT /proposals/:id
 * @description Aktualisiert einen bestehenden Vorschlag (nur für Ersteller oder Administratoren)
 * @access Private
 * 
 * @params {
 *   id: string
 * }
 * 
 * @body {
 *   title: string,
 *   content: string,
 *   category: string,
 *   tags: string[],
 *   anonymous: boolean
 * }
 * 
 * @response {
 *   success: boolean,
 *   proposal: {
 *     id: string,
 *     title: string,
 *     content: string,
 *     category: string,
 *     secondary_categories: string[],
 *     tags: string[],
 *     status: string,
 *     ministry: string,
 *     updated_at: string
 *   }
 * }
 */

/**
 * @route DELETE /proposals/:id
 * @description Löscht einen Vorschlag (nur für Ersteller oder Administratoren)
 * @access Private
 * 
 * @params {
 *   id: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   message: string
 * }
 */

/**
 * @route POST /proposals/:id/vote
 * @description Stimmt für einen Vorschlag ab oder entfernt die Stimme
 * @access Private
 * 
 * @params {
 *   id: string
 * }
 * 
 * @body {
 *   vote: boolean
 * }
 * 
 * @response {
 *   success: boolean,
 *   votes: number,
 *   user_has_voted: boolean
 * }
 */

/**
 * @route POST /proposals/:id/comments
 * @description Fügt einen Kommentar zu einem Vorschlag hinzu
 * @access Private
 * 
 * @params {
 *   id: string
 * }
 * 
 * @body {
 *   content: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   comment: {
 *     id: string,
 *     content: string,
 *     user: {
 *       id: string,
 *       name: string,
 *       role: string
 *     },
 *     created_at: string
 *   }
 * }
 */

// Kategorien
/**
 * @route GET /categories
 * @description Gibt eine Liste aller Kategorien zurück
 * @access Public
 * 
 * @response {
 *   success: boolean,
 *   categories: [
 *     {
 *       id: string,
 *       name: string,
 *       description: string,
 *       proposal_count: number
 *     }
 *   ]
 * }
 */

/**
 * @route GET /categories/:id
 * @description Gibt Details zu einer bestimmten Kategorie zurück
 * @access Public
 * 
 * @params {
 *   id: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   category: {
 *     id: string,
 *     name: string,
 *     description: string,
 *     proposal_count: number,
 *     related_categories: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ],
 *     ministries: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ]
 *   }
 * }
 */

// Ministerien
/**
 * @route GET /ministries
 * @description Gibt eine Liste aller Ministerien zurück
 * @access Public
 * 
 * @response {
 *   success: boolean,
 *   ministries: [
 *     {
 *       id: string,
 *       name: string,
 *       description: string,
 *       proposal_count: number,
 *       categories: [
 *         {
 *           id: string,
 *           name: string
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

/**
 * @route GET /ministries/:id
 * @description Gibt Details zu einem bestimmten Ministerium zurück
 * @access Public
 * 
 * @params {
 *   id: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   ministry: {
 *     id: string,
 *     name: string,
 *     description: string,
 *     proposal_count: number,
 *     categories: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ],
 *     contact_info: {
 *       email: string,
 *       phone: string,
 *       website: string
 *     }
 *   }
 * }
 */

// Statistiken
/**
 * @route GET /statistics
 * @description Gibt allgemeine Statistiken zum System zurück
 * @access Public
 * 
 * @query {
 *   period: string (default: "all", options: "day", "week", "month", "year", "all")
 * }
 * 
 * @response {
 *   success: boolean,
 *   statistics: {
 *     total_proposals: number,
 *     proposals_by_status: {
 *       submitted: number,
 *       processing: number,
 *       answered: number,
 *       completed: number
 *     },
 *     proposals_by_category: [
 *       {
 *         category: string,
 *         count: number
 *       }
 *     ],
 *     proposals_by_ministry: [
 *       {
 *         ministry: string,
 *         count: number
 *       }
 *     ],
 *     proposals_over_time: [
 *       {
 *         date: string,
 *         count: number
 *       }
 *     ],
 *     average_processing_time: number,
 *     implementation_rate: number
 *   }
 * }
 */

// Trends
/**
 * @route GET /trends
 * @description Gibt aktuelle Trends basierend auf den Vorschlägen zurück
 * @access Public
 * 
 * @query {
 *   limit: number (default: 10)
 * }
 * 
 * @response {
 *   success: boolean,
 *   trends: [
 *     {
 *       tag: string,
 *       count: number,
 *       growth_rate: number,
 *       related_proposals: [
 *         {
 *           id: string,
 *           title: string
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

// Empfehlungen
/**
 * @route GET /recommendations
 * @description Gibt personalisierte Vorschlagsempfehlungen für den authentifizierten Benutzer zurück
 * @access Private
 * 
 * @query {
 *   limit: number (default: 5)
 * }
 * 
 * @response {
 *   success: boolean,
 *   recommendations: [
 *     {
 *       id: string,
 *       title: string,
 *       category: string,
 *       relevance_score: number
 *     }
 *   ]
 * }
 */

// Benachrichtigungen
/**
 * @route GET /notifications
 * @description Gibt Benachrichtigungen für den authentifizierten Benutzer zurück
 * @access Private
 * 
 * @query {
 *   page: number (default: 1),
 *   limit: number (default: 20),
 *   read: boolean
 * }
 * 
 * @response {
 *   success: boolean,
 *   count: number,
 *   unread_count: number,
 *   notifications: [
 *     {
 *       id: string,
 *       type: string,
 *       message: string,
 *       related_entity: {
 *         type: string,
 *         id: string
 *       },
 *       read: boolean,
 *       created_at: string
 *     }
 *   ]
 * }
 */

/**
 * @route PUT /notifications/:id
 * @description Markiert eine Benachrichtigung als gelesen
 * @access Private
 * 
 * @params {
 *   id: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   notification: {
 *     id: string,
 *     read: boolean
 *   }
 * }
 */

/**
 * @route PUT /notifications
 * @description Markiert alle Benachrichtigungen als gelesen
 * @access Private
 * 
 * @response {
 *   success: boolean,
 *   message: string,
 *   count: number
 * }
 */

// Ministeriumsportal (nur für Ministeriumsmitarbeiter und Administratoren)
/**
 * @route GET /ministry-portal/proposals
 * @description Gibt eine Liste von Vorschlägen für das Ministeriumsportal zurück
 * @access Private (nur Ministeriumsmitarbeiter und Administratoren)
 * 
 * @query {
 *   page: number (default: 1),
 *   limit: number (default: 20),
 *   status: string,
 *   category: string,
 *   assigned_to: string,
 *   priority: string,
 *   search: string,
 *   sort_by: string (default: "created_at"),
 *   sort_order: string (default: "desc")
 * }
 * 
 * @response {
 *   success: boolean,
 *   count: number,
 *   total_pages: number,
 *   current_page: number,
 *   proposals: [
 *     {
 *       id: string,
 *       title: string,
 *       content: string (gekürzt),
 *       user: {
 *         id: string,
 *         name: string,
 *         email: string
 *       },
 *       category: string,
 *       status: string,
 *       priority: string,
 *       assigned_to: {
 *         id: string,
 *         name: string
 *       },
 *       created_at: string,
 *       updated_at: string,
 *       ai_analysis: {
 *         quality: number,
 *         relevance: number,
 *         feasibility: number
 *       }
 *     }
 *   ]
 * }
 */

/**
 * @route PUT /ministry-portal/proposals/:id
 * @description Aktualisiert den Status und andere Informationen eines Vorschlags im Ministeriumsportal
 * @access Private (nur Ministeriumsmitarbeiter und Administratoren)
 * 
 * @params {
 *   id: string
 * }
 * 
 * @body {
 *   status: string,
 *   priority: string,
 *   assigned_to: string,
 *   internal_notes: string,
 *   official_response: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   proposal: {
 *     id: string,
 *     status: string,
 *     priority: string,
 *     assigned_to: {
 *       id: string,
 *       name: string
 *     },
 *     internal_notes: string,
 *     official_response: string,
 *     updated_at: string
 *   }
 * }
 */

/**
 * @route POST /ministry-portal/proposals/:id/forward
 * @description Leitet einen Vorschlag an ein anderes Ministerium weiter
 * @access Private (nur Ministeriumsmitarbeiter und Administratoren)
 * 
 * @params {
 *   id: string
 * }
 * 
 * @body {
 *   ministry_id: string,
 *   reason: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   message: string,
 *   proposal: {
 *     id: string,
 *     ministry: {
 *       id: string,
 *       name: string
 *     },
 *     status: string,
 *     updated_at: string
 *   }
 * }
 */

// Administration (nur für Administratoren)
/**
 * @route GET /admin/users
 * @description Gibt eine Liste aller Benutzer zurück
 * @access Private (nur Administratoren)
 * 
 * @query {
 *   page: number (default: 1),
 *   limit: number (default: 20),
 *   role: string,
 *   search: string,
 *   sort_by: string (default: "created_at"),
 *   sort_order: string (default: "desc")
 * }
 * 
 * @response {
 *   success: boolean,
 *   count: number,
 *   total_pages: number,
 *   current_page: number,
 *   users: [
 *     {
 *       id: string,
 *       name: string,
 *       email: string,
 *       role: string,
 *       created_at: string,
 *       last_login: string,
 *       proposal_count: number
 *     }
 *   ]
 * }
 */

/**
 * @route PUT /admin/users/:id
 * @description Aktualisiert die Informationen eines Benutzers
 * @access Private (nur Administratoren)
 * 
 * @params {
 *   id: string
 * }
 * 
 * @body {
 *   name: string,
 *   email: string,
 *   role: string,
 *   active: boolean
 * }
 * 
 * @response {
 *   success: boolean,
 *   user: {
 *     id: string,
 *     name: string,
 *     email: string,
 *     role: string,
 *     active: boolean,
 *     updated_at: string
 *   }
 * }
 */

/**
 * @route POST /admin/categories
 * @description Erstellt eine neue Kategorie
 * @access Private (nur Administratoren)
 * 
 * @body {
 *   name: string,
 *   description: string,
 *   related_categories: string[],
 *   ministries: string[]
 * }
 * 
 * @response {
 *   success: boolean,
 *   category: {
 *     id: string,
 *     name: string,
 *     description: string,
 *     related_categories: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ],
 *     ministries: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ]
 *   }
 * }
 */

/**
 * @route PUT /admin/categories/:id
 * @description Aktualisiert eine bestehende Kategorie
 * @access Private (nur Administratoren)
 * 
 * @params {
 *   id: string
 * }
 * 
 * @body {
 *   name: string,
 *   description: string,
 *   related_categories: string[],
 *   ministries: string[]
 * }
 * 
 * @response {
 *   success: boolean,
 *   category: {
 *     id: string,
 *     name: string,
 *     description: string,
 *     related_categories: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ],
 *     ministries: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ]
 *   }
 * }
 */

/**
 * @route POST /admin/ministries
 * @description Erstellt ein neues Ministerium
 * @access Private (nur Administratoren)
 * 
 * @body {
 *   name: string,
 *   description: string,
 *   categories: string[],
 *   contact_info: {
 *     email: string,
 *     phone: string,
 *     website: string
 *   }
 * }
 * 
 * @response {
 *   success: boolean,
 *   ministry: {
 *     id: string,
 *     name: string,
 *     description: string,
 *     categories: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ],
 *     contact_info: {
 *       email: string,
 *       phone: string,
 *       website: string
 *     }
 *   }
 * }
 */

/**
 * @route PUT /admin/ministries/:id
 * @description Aktualisiert ein bestehendes Ministerium
 * @access Private (nur Administratoren)
 * 
 * @params {
 *   id: string
 * }
 * 
 * @body {
 *   name: string,
 *   description: string,
 *   categories: string[],
 *   contact_info: {
 *     email: string,
 *     phone: string,
 *     website: string
 *   }
 * }
 * 
 * @response {
 *   success: boolean,
 *   ministry: {
 *     id: string,
 *     name: string,
 *     description: string,
 *     categories: [
 *       {
 *         id: string,
 *         name: string
 *       }
 *     ],
 *     contact_info: {
 *       email: string,
 *       phone: string,
 *       website: string
 *     }
 *   }
 * }
 */

/**
 * @route GET /admin/system-logs
 * @description Gibt Systemprotokolle zurück
 * @access Private (nur Administratoren)
 * 
 * @query {
 *   page: number (default: 1),
 *   limit: number (default: 100),
 *   level: string,
 *   start_date: string,
 *   end_date: string,
 *   search: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   count: number,
 *   total_pages: number,
 *   current_page: number,
 *   logs: [
 *     {
 *       id: string,
 *       timestamp: string,
 *       level: string,
 *       message: string,
 *       context: object
 *     }
 *   ]
 * }
 */

// KI-Analyse
/**
 * @route POST /ai/analyze
 * @description Analysiert einen Text mit dem KI-Modell
 * @access Private (nur Ministeriumsmitarbeiter und Administratoren)
 * 
 * @body {
 *   text: string
 * }
 * 
 * @response {
 *   success: boolean,
 *   analysis: {
 *     categories: {
 *       primary: string,
 *       secondary: string[],
 *       scores: object
 *     },
 *     quality: {
 *       overall_quality: number,
 *       relevance: number,
 *       feasibility: number
 *     },
 *     ministries: {
 *       primary: string,
 *       scores: object
 *     },
 *     keywords: string[],
 *     summary: string
 *   }
 * }
 */

/**
 * @route GET /ai/similar-proposals
 * @description Findet ähnliche Vorschläge zu einem gegebenen Vorschlag
 * @access Public
 * 
 * @query {
 *   proposal_id: string,
 *   limit: number (default: 5)
 * }
 * 
 * @response {
 *   success: boolean,
 *   similar_proposals: [
 *     {
 *       id: string,
 *       title: string,
 *       similarity_score: number,
 *       status: string
 *     }
 *   ]
 * }
 */

// Fehlerbehandlung
/**
 * @route GET /status
 * @description Gibt den Status der API zurück
 * @access Public
 * 
 * @response {
 *   success: boolean,
 *   status: string,
 *   version: string,
 *   uptime: number
 * }
 */

/**
 * Fehlerantworten
 * 
 * 400 Bad Request
 * @response {
 *   success: false,
 *   error: {
 *     code: "BAD_REQUEST",
 *     message: string,
 *     details: object
 *   }
 * }
 * 
 * 401 Unauthorized
 * @response {
 *   success: false,
 *   error: {
 *     code: "UNAUTHORIZED",
 *     message: "Authentifizierung erforderlich"
 *   }
 * }
 * 
 * 403 Forbidden
 * @response {
 *   success: false,
 *   error: {
 *     code: "FORBIDDEN",
 *     message: "Keine Berechtigung für diese Aktion"
 *   }
 * }
 * 
 * 404 Not Found
 * @response {
 *   success: false,
 *   error: {
 *     code: "NOT_FOUND",
 *     message: "Ressource nicht gefunden"
 *   }
 * }
 * 
 * 429 Too Many Requests
 * @response {
 *   success: false,
 *   error: {
 *     code: "TOO_MANY_REQUESTS",
 *     message: "Zu viele Anfragen, bitte versuchen Sie es später erneut",
 *     retry_after: number
 *   }
 * }
 * 
 * 500 Internal Server Error
 * @response {
 *   success: false,
 *   error: {
 *     code: "INTERNAL_SERVER_ERROR",
 *     message: "Ein interner Serverfehler ist aufgetreten"
 *   }
 * }
 */
