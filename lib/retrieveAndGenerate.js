

async function retrieveAndGenerate(query) {
    const pinecone = await initializePinecone();
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const queryEmbedding = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
    });

    const results = await index.query({
        topK: 5,
        includeMetadata: true,
        vector: queryEmbedding.data[0].embedding,
    });

    return results.matches.map(match => match.metadata.text);
}


module.exports = { retrieveAndGenerate };
