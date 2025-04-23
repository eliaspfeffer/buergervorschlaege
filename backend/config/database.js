const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Die Verbindungs-URL wird über die Umgebungsvariable definiert
    const dbURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/buergervorschlaege";

    const conn = await mongoose.connect(dbURI, {
      // MongoDB driver neue Konfigurationsoption
      serverSelectionTimeoutMS: 5000,
      // Ab Mongoose 6 sind diese Optionen standardmäßig true
      // aber wir setzen sie für Klarheit
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB verbunden: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Fehler bei der MongoDB-Verbindung: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
