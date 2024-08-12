import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai'; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
You are an AI-powered career coaching chatbot designed to assist users with personalized career advice. Your role is to help users identify their career goals, suggest relevant job opportunities, review resumes and cover letters, and provide insights into the job market.

Key Responsibilities:
- Begin by asking users key questions to understand their career goals, educational background, skills, and job preferences.
- Based on user responses, guide them through uploading their resumes or other relevant documents for analysis.
- Use the information provided by the user, along with any uploaded documents, to generate personalized career advice.
- Provide detailed explanations and guidance on job search strategies, resume improvements, cover letter writing, and skill development.
- Encourage users to explore relevant job listings, courses, and networking opportunities.
- Offer tips for improving their job applications and interview preparation.
- Maintain a tone that is friendly, supportive, and professional, aiming to be a valuable resource in the user's career journey.
`;

// POST function to handle incoming requests
export async function POST(req) {
  // Retrieve the OpenAI API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }
  // Create a new instance of the OpenAI client with the API key
  const openai = new OpenAI({ apiKey });
  
  const data = await req.json(); // Parse the JSON body of the incoming request

  try {
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }, ...data], // Include the system prompt and user messages
      model: 'gpt-4', // Specify the model to use (make sure 'gpt-4' is correct)
      stream: true, // Enable streaming responses
    });

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content); // Encode the content to Uint8Array
              controller.enqueue(text); // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err); // Handle any errors that occur during streaming
        } finally {
          controller.close(); // Close the stream when done
        }
      },
    });

    return new NextResponse(stream); // Return the stream as the response

  } catch (error) {
    console.error('Error during OpenAI API request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

