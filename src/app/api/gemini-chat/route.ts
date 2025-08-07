import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini, startGeminiChat, streamWithGemini } from '@/lib/gemini';

interface ChatRequest {
  message: string;
  conversation?: Array<{role: 'user' | 'model', parts: string[]}>;
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequest;
    const { message, conversation = [], stream = false } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    console.log('Gemini chat request:', { message, stream });

    if (stream) {
      // Handle streaming response
      try {
        const streamResult = await streamWithGemini(message);
        
        // Create a readable stream for the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of streamResult) {
                const chunkText = chunk.text();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              console.error('Stream error:', error);
              controller.error(error);
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (error) {
        console.error('Streaming error:', error);
        return NextResponse.json(
          { error: 'Failed to create stream' },
          { status: 500 }
        );
      }
    } else {
      // Handle regular chat
      let response: string;

      if (conversation.length > 0) {
        // Continue existing conversation
        try {
          // Convert string[] parts to {text: string}[] parts for Gemini API
          const formattedConversation = conversation.map(msg => ({
            role: msg.role,
            parts: msg.parts.map(part => ({ text: part }))
          }));
          
          const chat = await startGeminiChat(formattedConversation);
          const result = await chat.sendMessage(message);
          response = result.response.text();
        } catch (error) {
          console.error('Chat continuation error:', error);
          throw error;
        }
      } else {
        // Single message
        response = await generateWithGemini(message);
      }

      return NextResponse.json({
        response,
        conversation: [
          ...conversation,
          { role: 'user' as const, parts: [message] },
          { role: 'model' as const, parts: [response] }
        ]
      });
    }

  } catch (error) {
    console.error('Error in Gemini chat:', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Gemini Chat API is running',
    availableModels: ['gemini-2.0-flash-exp', 'gemini-pro', 'gemini-pro-vision'],
    features: ['text-generation', 'chat', 'streaming']
  });
}
