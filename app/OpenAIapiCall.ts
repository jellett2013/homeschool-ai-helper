// app/api/generate/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { gradeLevel, learningStyle } = await req.json();

  const prompt = `Suggest 3 homeschool curriculum options for a ${gradeLevel} child who prefers a "${learningStyle}" learning style. Include name, subject, a brief description, and a website link if known. Keep it short and friendly for parents.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content || 'No result found.';

  return NextResponse.json({ result });
}
