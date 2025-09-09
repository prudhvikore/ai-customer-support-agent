import mongoose from "mongoose";
import config from "./config.js";

const run = async () => {
  await mongoose.connect(config.mongoUri);
  const db = mongoose.connection.db;
  await db
    .collection("test_collection")
    .insertOne({ hello: "world", createdAt: new Date() });
  console.log("Seeded test_collection");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
