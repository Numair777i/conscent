import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️ Warning: MONGODB_URI is not set in environment variables.",
    );
  }
  // Fallback promise that rejects only when invoked at runtime, avoiding build-time crashes
  clientPromise = Promise.reject(
    new Error("Missing MONGODB_URI environment variable"),
  );
} else {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;
