const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const connectDB = require("./config/database");
const { Proposal, Category, Ministry, User, Comment } = require("./models");

// Importieren der Routen
const aiRoutes = require("./routes/aiRoutes");

// Erstellen der Express-App
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB-Verbindung herstellen
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routen registrieren
app.use("/api/ai", aiRoutes);

// Temporäre Daten bis zur vollständigen Migration zur MongoDB
const db = {
  proposals: [
    {
      id: "1",
      title: "Ausbau von Fahrradwegen in der Innenstadt",
      content:
        "Ich schlage vor, das Fahrradwegenetz in der Innenstadt auszubauen, um den Verkehr umweltfreundlicher zu gestalten und die Luftqualität zu verbessern. Konkret sollten auf allen Hauptstraßen separate Fahrradspuren eingerichtet werden, die durch physische Barrieren vom Autoverkehr getrennt sind.",
      category: "Verkehr",
      secondary_categories: ["Umwelt", "Stadtplanung"],
      status: "submitted",
      ministry: "Verkehrsministerium",
      created_at: "2025-03-15T10:30:00Z",
      votes: 42,
      user: {
        id: "user1",
        name: "Max Mustermann",
      },
      tags: ["Fahrrad", "Verkehr", "Umwelt", "Innenstadt"],
      ai_analysis: {
        quality: 0.85,
        relevance: 0.9,
        feasibility: 0.8,
      },
    },
    {
      id: "2",
      title: "Digitalisierung der Schulbildung",
      content:
        "Um die Bildungsqualität zu verbessern, schlage ich vor, alle Schulen mit modernen digitalen Geräten auszustatten und Lehrer entsprechend fortzubilden. Jeder Schüler sollte Zugang zu einem Tablet oder Laptop haben, und digitale Lernplattformen sollten in den Unterricht integriert werden.",
      category: "Bildung",
      secondary_categories: ["Digitalisierung"],
      status: "processing",
      ministry: "Bildungsministerium",
      created_at: "2025-03-10T14:15:00Z",
      votes: 38,
      user: {
        id: "user2",
        name: "Anna Schmidt",
      },
      tags: ["Bildung", "Digitalisierung", "Schule", "Zukunft"],
      ai_analysis: {
        quality: 0.8,
        relevance: 0.85,
        feasibility: 0.7,
      },
    },
    {
      id: "3",
      title: "Förderung erneuerbarer Energien in Privathaushalten",
      content:
        "Ich schlage vor, die Installation von Solaranlagen und anderen erneuerbaren Energiequellen in Privathaushalten stärker zu fördern. Dies könnte durch direkte finanzielle Zuschüsse, Steuererleichterungen und vereinfachte Genehmigungsverfahren geschehen.",
      category: "Umwelt",
      secondary_categories: ["Energie", "Wirtschaft"],
      status: "answered",
      ministry: "Umweltministerium",
      created_at: "2025-03-05T09:45:00Z",
      votes: 65,
      user: {
        id: "user3",
        name: "Laura Weber",
      },
      tags: ["Erneuerbare Energie", "Solar", "Klimaschutz", "Förderung"],
      ai_analysis: {
        quality: 0.9,
        relevance: 0.95,
        feasibility: 0.75,
      },
    },
    {
      id: "4",
      title: "Verbesserung des öffentlichen Nahverkehrs",
      content:
        "Der öffentliche Nahverkehr sollte durch häufigere Verbindungen und modernere Fahrzeuge verbessert werden. Dies würde die Attraktivität steigern und mehr Menschen zum Umstieg vom Auto bewegen.",
      category: "Verkehr",
      secondary_categories: ["Umwelt"],
      status: "submitted",
      ministry: "Verkehrsministerium",
      created_at: "2025-03-20T16:20:00Z",
      votes: 29,
      user: {
        id: "user4",
        name: "Thomas Becker",
      },
      tags: ["ÖPNV", "Verkehr", "Umwelt", "Mobilität"],
      ai_analysis: {
        quality: 0.75,
        relevance: 0.8,
        feasibility: 0.7,
      },
    },
    {
      id: "5",
      title: "Mehr Grünflächen in der Stadt",
      content:
        "Ich schlage vor, mehr Grünflächen und Parks in der Stadt zu schaffen, um die Lebensqualität zu verbessern und die Luftqualität zu erhöhen. Besonders in dicht bebauten Vierteln sollten kleine Pocket-Parks angelegt werden.",
      category: "Stadtplanung",
      secondary_categories: ["Umwelt", "Gesundheit"],
      status: "processing",
      ministry: "Umweltministerium",
      created_at: "2025-03-18T11:10:00Z",
      votes: 51,
      user: {
        id: "user5",
        name: "Sophie Müller",
      },
      tags: ["Grünflächen", "Parks", "Stadtplanung", "Lebensqualität"],
      ai_analysis: {
        quality: 0.85,
        relevance: 0.9,
        feasibility: 0.8,
      },
    },
  ],
  categories: [
    {
      id: "1",
      name: "Verkehr",
      description: "Themen rund um Verkehr und Mobilität",
    },
    {
      id: "2",
      name: "Umwelt",
      description: "Umweltschutz, Klimawandel und Nachhaltigkeit",
    },
    {
      id: "3",
      name: "Bildung",
      description: "Schulen, Universitäten und Bildungspolitik",
    },
    {
      id: "4",
      name: "Gesundheit",
      description: "Gesundheitswesen und öffentliche Gesundheit",
    },
    {
      id: "5",
      name: "Stadtplanung",
      description: "Stadtentwicklung und Infrastruktur",
    },
    {
      id: "6",
      name: "Wirtschaft",
      description: "Wirtschaftspolitik und Arbeitsmarkt",
    },
    {
      id: "7",
      name: "Digitalisierung",
      description: "Digitale Transformation und Technologie",
    },
    { id: "8", name: "Energie", description: "Energiepolitik und Versorgung" },
  ],
  ministries: [
    {
      id: "1",
      name: "Verkehrsministerium",
      description: "Zuständig für Verkehr und Infrastruktur",
    },
    {
      id: "2",
      name: "Umweltministerium",
      description: "Zuständig für Umweltschutz und Klimapolitik",
    },
    {
      id: "3",
      name: "Bildungsministerium",
      description: "Zuständig für Bildung und Forschung",
    },
    {
      id: "4",
      name: "Gesundheitsministerium",
      description: "Zuständig für Gesundheitswesen",
    },
    {
      id: "5",
      name: "Wirtschaftsministerium",
      description: "Zuständig für Wirtschaft und Energie",
    },
    {
      id: "6",
      name: "Innenministerium",
      description: "Zuständig für innere Sicherheit und Verwaltung",
    },
  ],
  users: [
    {
      id: "user1",
      email: "max@example.com",
      name: "Max Mustermann",
      role: "citizen",
    },
    {
      id: "user2",
      email: "anna@example.com",
      name: "Anna Schmidt",
      role: "citizen",
    },
    {
      id: "user3",
      email: "laura@example.com",
      name: "Laura Weber",
      role: "citizen",
    },
    {
      id: "user4",
      email: "thomas@example.com",
      name: "Thomas Becker",
      role: "citizen",
    },
    {
      id: "user5",
      email: "sophie@example.com",
      name: "Sophie Müller",
      role: "citizen",
    },
    {
      id: "admin1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
    },
    {
      id: "ministry1",
      email: "verkehr@example.com",
      name: "Verkehrsministerium",
      role: "ministry",
    },
    {
      id: "ministry2",
      email: "umwelt@example.com",
      name: "Umweltministerium",
      role: "ministry",
    },
  ],
  comments: [
    {
      id: "1",
      proposal_id: "1",
      user: { id: "user2", name: "Anna Schmidt" },
      content: "Tolle Idee! In meinem Viertel fehlen auch sichere Fahrradwege.",
      created_at: "2025-03-16T08:45:00Z",
    },
    {
      id: "2",
      proposal_id: "1",
      user: { id: "user3", name: "Laura Weber" },
      content:
        "Ich würde mir auch mehr Fahrradstellplätze an wichtigen Knotenpunkten wünschen.",
      created_at: "2025-03-16T10:20:00Z",
    },
    {
      id: "3",
      proposal_id: "2",
      user: { id: "user1", name: "Max Mustermann" },
      content:
        "Wichtiges Thema! Die Digitalisierung der Bildung ist längst überfällig.",
      created_at: "2025-03-11T15:30:00Z",
    },
    {
      id: "4",
      proposal_id: "3",
      user: { id: "ministry2", name: "Umweltministerium" },
      content:
        "Vielen Dank für Ihren Vorschlag. Wir arbeiten bereits an einem Förderprogramm für erneuerbare Energien in Privathaushalten, das in den nächsten Monaten vorgestellt wird.",
      created_at: "2025-03-10T14:15:00Z",
      official: true,
    },
  ],
  statistics: {
    total_proposals: 5,
    proposals_by_status: {
      submitted: 2,
      processing: 2,
      answered: 1,
      completed: 0,
      rejected: 0,
    },
    proposals_by_category: [
      { category: "Verkehr", count: 2 },
      { category: "Umwelt", count: 1 },
      { category: "Bildung", count: 1 },
      { category: "Stadtplanung", count: 1 },
    ],
    proposals_by_ministry: [
      { ministry: "Verkehrsministerium", count: 2 },
      { ministry: "Umweltministerium", count: 2 },
      { ministry: "Bildungsministerium", count: 1 },
    ],
    average_processing_time: 14.5,
    implementation_rate: 0.65,
  },
};

// Helper-Funktion zum Initialisieren der MongoDB mit Beispieldaten
async function initializeDatabase() {
  try {
    // Prüfe, ob bereits Daten in einer der Hauptsammlungen vorhanden sind
    const [proposalsCount, categoriesCount, ministriesCount, usersCount] =
      await Promise.all([
        Proposal.countDocuments(),
        Category.countDocuments(),
        Ministry.countDocuments(),
        User.countDocuments(),
      ]);

    if (
      proposalsCount > 0 ||
      categoriesCount > 0 ||
      ministriesCount > 0 ||
      usersCount > 0
    ) {
      console.log(
        "Datenbank bereits teilweise initialisiert, überspringe Seed"
      );
      return;
    }

    console.log("Initialisiere Datenbank mit Beispieldaten...");

    // Kategorien erstellen
    const categoryDocs = await Category.insertMany(
      db.categories.map((cat) => ({
        name: cat.name,
        description: cat.description,
      }))
    );

    // Kategorien-Map erstellen für spätere Referenzierung
    const categoryMap = {};
    categoryDocs.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Ministerien erstellen
    const ministryDocs = await Ministry.insertMany(
      db.ministries.map((min) => ({
        name: min.name,
        description: min.description,
      }))
    );

    // Ministerien-Map erstellen für spätere Referenzierung
    const ministryMap = {};
    ministryDocs.forEach((min) => {
      ministryMap[min.name] = min._id;
    });

    // Benutzer erstellen
    const userDocs = await User.insertMany(
      db.users.map((user) => {
        const nameParts = user.name.split(" ");
        const firstName = nameParts[0];
        // Stelle sicher, dass lastName nicht leer ist
        let lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Nachname";

        return {
          email: user.email,
          passwordHash: "temporaryHash123", // In der Produktion würden wir richtige Passwort-Hashes verwenden
          firstName,
          lastName,
          userType: user.role,
        };
      })
    );

    // Benutzer-Map erstellen für spätere Referenzierung
    const userMap = {};
    userDocs.forEach((user) => {
      const userName = `${user.firstName} ${user.lastName}`.trim();
      userMap[userName] = user._id;
      // Fallback für den ursprünglichen Namen
      const originalName = db.users.find((u) => u.email === user.email)?.name;
      if (originalName) {
        userMap[originalName] = user._id;
      }
    });

    // Vorschläge erstellen
    const proposalPromises = db.proposals.map(async (prop) => {
      const userName = prop.user.name;
      const userId = userMap[userName];

      if (!userId) {
        console.warn(
          `Benutzer "${userName}" nicht gefunden, verwende ersten Benutzer als Fallback`
        );
      }

      // Kategorien für diesen Vorschlag finden
      const categories = [];
      if (prop.category) {
        const catId = categoryMap[prop.category];
        if (catId) {
          categories.push({
            category: catId,
            assignmentType: "manual",
          });
        }
      }

      // Sekundäre Kategorien hinzufügen, falls vorhanden
      if (prop.secondary_categories) {
        prop.secondary_categories.forEach((secCat) => {
          const catId = categoryMap[secCat];
          if (catId) {
            categories.push({
              category: catId,
              assignmentType: "ai",
              confidence: 0.9,
            });
          }
        });
      }

      // Ministerien für diesen Vorschlag finden
      const ministries = [];
      if (prop.ministry) {
        const minId = ministryMap[prop.ministry];
        if (minId) {
          ministries.push({
            ministry: minId,
            status: "assigned",
          });
        }
      }

      return {
        title: prop.title,
        content: prop.content,
        createdAt: new Date(prop.created_at),
        status: prop.status,
        user: userId || userDocs[0]._id, // Fallback zum ersten Benutzer
        categories,
        ministries,
        votes: prop.votes,
        aiAnalysis: {
          quality: prop.ai_analysis?.quality || 0,
          relevance: prop.ai_analysis?.relevance || 0,
          feasibility: prop.ai_analysis?.feasibility || 0,
          keywords: prop.tags || [],
        },
      };
    });

    const proposalData = await Promise.all(proposalPromises);
    const proposalDocs = await Proposal.insertMany(proposalData);

    // Vorschläge-Map erstellen für spätere Referenzierung
    const proposalMap = {};
    proposalDocs.forEach((doc, index) => {
      proposalMap[db.proposals[index].id] = doc._id;
    });

    // Kommentare erstellen
    const commentPromises = db.comments
      .map((comment) => {
        const userName = comment.user.name;
        const userId = userMap[userName];
        const proposalId = proposalMap[comment.proposal_id];

        if (!userId) {
          console.warn(
            `Benutzer "${userName}" für Kommentar nicht gefunden, verwende ersten Benutzer als Fallback`
          );
        }

        if (!proposalId) {
          console.warn(
            `Vorschlag "${comment.proposal_id}" für Kommentar nicht gefunden`
          );
          return null;
        }

        return {
          content: comment.content,
          createdAt: new Date(comment.created_at),
          user: userId || userDocs[0]._id, // Fallback zum ersten Benutzer
          proposal: proposalId,
          isOfficial: comment.official || false,
        };
      })
      .filter(Boolean); // Entferne null-Werte

    if (commentPromises.length > 0) {
      const commentData = await Promise.all(commentPromises);
      await Comment.insertMany(commentData);
    }

    console.log("Datenbank erfolgreich initialisiert mit Beispieldaten");
  } catch (error) {
    console.error("Fehler beim Initialisieren der Datenbank:", error);
  }
}

// API-Endpunkte

// Holen aller Vorschläge
app.get("/api/proposals", async (req, res) => {
  try {
    // Parameter für Paginierung und Filterung
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter erstellen
    const filter = {
      // Vorschläge ausschließen, die bereits zusammengeführt wurden
      status: { $ne: "merged" },
      mergeSource: { $ne: true },
    };

    // Zusätzliche Filter hinzufügen
    if (req.query.category) {
      filter["categories.category"] = req.query.category;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.ministry) {
      filter["ministries.ministry"] = req.query.ministry;
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { content: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Vorschläge abfragen mit Paginierung
    const proposals = await Proposal.find(filter)
      .populate("user", "firstName lastName")
      .populate("categories.category", "name")
      .populate("ministries.ministry", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Gesamtzahl der Vorschläge für Pagination ermitteln
    const total = await Proposal.countDocuments(filter);

    res.json({
      proposals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Abrufen der Vorschläge",
      error: error.message,
    });
  }
});

// Holen eines einzelnen Vorschlags
app.get("/api/proposals/:id", async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("user", "firstName lastName")
      .populate("categories.category", "name")
      .populate("ministries.ministry", "name");

    if (!proposal) {
      return res.status(404).json({ message: "Vorschlag nicht gefunden" });
    }

    res.json(proposal);
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Abrufen des Vorschlags",
      error: error.message,
    });
  }
});

// Erstellen eines neuen Vorschlags
app.post("/api/proposals", async (req, res) => {
  try {
    const proposalData = req.body;
    const newProposal = new Proposal(proposalData);
    const savedProposal = await newProposal.save();

    // Optional automatische Analyse und Zusammenführung starten
    if (req.query.autoAnalyze === "true") {
      try {
        // Direkt die Controller-Funktion aufrufen (synchron)
        const aiController = require("./controllers/aiController");

        // Eigenes Request/Response-Objekt erstellen, um die Ergebnisse abzufangen
        const fakeReq = {
          params: { proposalId: savedProposal._id.toString() },
        };

        // Ergebnisse der Analyse abfangen
        let analysisResult = null;
        const fakeRes = {
          status: (code) => ({
            json: (data) => {
              analysisResult = { code, data };
              return fakeRes;
            },
          }),
        };

        // Analyse synchron ausführen
        await aiController.autoAnalyzeProposal(fakeReq, fakeRes);

        // Ergebnisse zurückgeben
        if (analysisResult) {
          // Wenn ein zusammengeführter Vorschlag erstellt wurde
          if (
            analysisResult.code === 201 &&
            analysisResult.data.mergedProposal
          ) {
            return res.status(201).json({
              ...savedProposal.toObject(),
              message:
                "Vorschlag wurde mit ähnlichen Vorschlägen zusammengeführt",
              mergedProposal: analysisResult.data.mergedProposal,
              mergeRationale: analysisResult.data.mergeRationale,
            });
          }
          // Wenn der Vorschlag analysiert wurde, aber nicht zusammengeführt
          else if (analysisResult.code === 200) {
            return res.status(201).json({
              ...savedProposal.toObject(),
              message: "Vorschlag wurde erstellt und analysiert",
              analysis: analysisResult.data.analysis,
            });
          }
        }
      } catch (error) {
        console.error("Fehler bei der automatischen Analyse:", error);
        // Bei Fehler trotzdem den Vorschlag zurückgeben, mit Fehlermeldung
        return res.status(201).json({
          ...savedProposal.toObject(),
          message:
            "Vorschlag wurde erstellt, aber es gab einen Fehler bei der Analyse",
          analysisError: error.message,
        });
      }
    }

    // Standardfall, wenn keine Analyse angefordert oder durchgeführt wurde
    res.status(201).json(savedProposal);
  } catch (error) {
    res.status(400).json({
      message: "Fehler beim Erstellen des Vorschlags",
      error: error.message,
    });
  }
});

// Aktualisieren eines Vorschlags
app.put("/api/proposals/:id", async (req, res) => {
  try {
    const updatedProposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("user", "firstName lastName")
      .populate("categories.category", "name")
      .populate("ministries.ministry", "name");

    if (!updatedProposal) {
      return res.status(404).json({ message: "Vorschlag nicht gefunden" });
    }

    res.json(updatedProposal);
  } catch (error) {
    res.status(400).json({
      message: "Fehler beim Aktualisieren des Vorschlags",
      error: error.message,
    });
  }
});

// Holen aller Kategorien
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Abrufen der Kategorien",
      error: error.message,
    });
  }
});

// Holen aller Ministerien
app.get("/api/ministries", async (req, res) => {
  try {
    const ministries = await Ministry.find({ isActive: true });
    res.json(ministries);
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Abrufen der Ministerien",
      error: error.message,
    });
  }
});

// Holen aller Kommentare für einen Vorschlag
app.get("/api/proposals/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ proposal: req.params.id })
      .populate("user", "firstName lastName userType")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Abrufen der Kommentare",
      error: error.message,
    });
  }
});

// Erstellen eines neuen Kommentars
app.post("/api/proposals/:id/comments", async (req, res) => {
  try {
    const { content, userId } = req.body;

    const newComment = new Comment({
      content,
      user: userId,
      proposal: req.params.id,
      isOfficial: req.body.isOfficial || false,
    });

    const savedComment = await newComment.save();
    const populatedComment = await Comment.findById(savedComment._id).populate(
      "user",
      "firstName lastName userType"
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({
      message: "Fehler beim Erstellen des Kommentars",
      error: error.message,
    });
  }
});

// Statistiken abrufen
app.get("/api/statistics", async (req, res) => {
  try {
    // Anzahl der Vorschläge
    const totalProposals = await Proposal.countDocuments();

    // Vorschläge nach Status
    const proposalsByStatus = await Proposal.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusCounts = {};
    proposalsByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    // Vorschläge nach Kategorie
    const proposalsByCategory = await Proposal.aggregate([
      { $unwind: "$categories" },
      {
        $lookup: {
          from: "categories",
          localField: "categories.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      { $group: { _id: "$categoryInfo.name", count: { $sum: 1 } } },
    ]);

    // Vorschläge nach Ministerium
    const proposalsByMinistry = await Proposal.aggregate([
      { $unwind: "$ministries" },
      {
        $lookup: {
          from: "ministries",
          localField: "ministries.ministry",
          foreignField: "_id",
          as: "ministryInfo",
        },
      },
      { $unwind: "$ministryInfo" },
      { $group: { _id: "$ministryInfo.name", count: { $sum: 1 } } },
    ]);

    res.json({
      total_proposals: totalProposals,
      proposals_by_status: statusCounts,
      proposals_by_category: proposalsByCategory.map((item) => ({
        category: item._id,
        count: item.count,
      })),
      proposals_by_ministry: proposalsByMinistry.map((item) => ({
        ministry: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Fehler beim Abrufen der Statistiken",
      error: error.message,
    });
  }
});

// Server starten
app.listen(PORT, async () => {
  console.log(`Server läuft auf Port ${PORT}`);

  // Datenbank mit Beispieldaten initialisieren
  await initializeDatabase();
});

module.exports = app;
