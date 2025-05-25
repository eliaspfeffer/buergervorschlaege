const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

async function listCollections() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db(); // Use the default database
    const collections = await database.listCollections().toArray();
    console.log(
      "Collections:",
      collections.map((col) => col.name)
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    await client.close();
  }
}

async function queryProposalAnalyses() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("proposals");
    const proposalId = "6808d2106b66cf10f515c142";
    const query = { proposalId: proposalId };
    const analyses = await collection.find(query).toArray();
    console.log("Analyses for proposal ID", proposalId, ":", analyses);
  } catch (error) {
    console.error("Error querying proposalanalyses:", error);
  } finally {
    await client.close();
  }
}

async function queryByTitle() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("proposalanalyses");
    const title =
      "Effiziente Staatsverwaltung und Steuersenkung für mehr Bürgerwohlstand";
    const query = { title: title };
    const analyses = await collection.find(query).toArray();
    console.log("Analyses for title", title, ":", analyses);
  } catch (error) {
    console.error("Error querying proposalanalyses by title:", error);
  } finally {
    await client.close();
  }
}

listCollections();
queryProposalAnalyses();
queryByTitle();
