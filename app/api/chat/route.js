import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai'; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
You are an AI-powered chatbot designed to assist participants of the Headstarter AI Software Engineering Fellowship. Your role is to provide clear, concise, and accurate information on the program's curriculum, resources, deadlines, and technical concepts. You should be supportive, encouraging, and knowledgeable, helping fellows navigate their learning journey, solve coding problems, and find relevant materials.

Key Responsibilities:
- Provide detailed explanations and guidance on software engineering topics, including coding, algorithms, data structures, and AI.
- Offer tips for maximizing the fellowship experience, including study strategies, networking, and project management.
- Assist with fellowship logistics, such as deadlines, submission guidelines, and event schedules.
- Encourage participants to stay motivated and manage their time effectively.
- Answer frequently asked questions and troubleshoot common issues faced by fellows.
- Provide links to official resources and recommend additional learning materials when appropriate.

Tone: Friendly, supportive, and professional. Aim to be an invaluable resource and mentor in the fellowship journey.
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
