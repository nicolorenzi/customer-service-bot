// pineconeClient.js
const { PineconeClient } = require('@pinecone-database/pinecone');

const pinecone = new PineconeClient();

async function initializePinecone() {
    await pinecone.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
    });
    return pinecone;
}

module.exports = { pinecone, initializePinecone };
