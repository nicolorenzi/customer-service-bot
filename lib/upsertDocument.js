const { pinecone, initializePinecone } = require('./pineconeClient');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function upsertDocument(documentText, documentId) {
    const pinecone = await initializePinecone();
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: documentText,
    });

    const embedding = embeddingResponse.data[0].embedding;

    await index.upsert({
        upserts: [{ id: documentId, values: embedding }],
    });
}

module.exports = { upsertDocument };


// async function retrieveDocuments(query) {
//     const pinecone = await initializePinecone();
//     const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

//     const queryEmbedding = await openai.embeddings.create({
//         model: 'text-embedding-ada-002',
//         input: query,
//     });

//     const results = await index.query({
//         topK: 5,
//         includeMetadata: true,
//         vector: queryEmbedding.data[0].embedding,
//     });

//     return results.matches.map(match => match.metadata.text);
// }

// module.exports = { retrieveDocuments };
