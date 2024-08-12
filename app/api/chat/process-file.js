import { upsertDocument } from '../../lib/upsertDocument'; // Adjust the path as necessary
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch'; // Use node-fetch to download files
import pdfParse from 'pdf-parse';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      


      if (!url) {
        return res.status(400).json({ message: 'File URL is required.' });
      }

      // Download the file from Firebase Storage
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Failed to fetch file. Status: ${response.status}`);
        throw new Error(`Failed to fetch file. Status: ${response.status}`);
      }else{
        console.log("hello")
      }

      const fileBuffer = await response.buffer();

      // Extract text from PDF
      
      const data = await pdfParse(fileBuffer);
      const documentText = data.text;
      console.log('Extracted Text:', documentText);
      // Generate a unique ID for the document
      const documentId = uuidv4();

      // Upsert the document into Pinecone
      await upsertDocument(documentText, documentId);
      
      return res.status(200).json({ message: 'Resume uploaded and processed successfully!' });
    } catch (error) {
      console.error('Error processing file:', error);
      return res.status(500).json({ message: 'Error processing the file.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
