import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const response = new Response(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Keep connection alive
        const interval = setInterval(() => {
          send({ type: 'ping' });
        }, 30000);

        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );

  return response;
}