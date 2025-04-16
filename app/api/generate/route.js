// app/api/generate/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const {
    gradeLevel,
    learningStyle,
    subject,
    state,
    alignToState,
  } = await req.json();

  const prompt = `
You are a homeschool curriculum advisor.

Recommend exactly 3 curriculum options for a ${gradeLevel} student.
${learningStyle ? `Preferred learning style: ${learningStyle}.` : ''}
${subject ? `Focus on subject: ${subject}.` : ''}
${alignToState && state ? `Recommendations must align with homeschool guidelines in ${state}.` : ''}

⚠️ Format:
Each curriculum must be on its own line, using this format:
Name | Subject | Description | Link | Tags | Cost | Justification

⚠️ No bullet points. No markdown. No commentary.
Only 3 lines. Only use "|" to separate each field.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();

  const result = data?.choices?.[0]?.message?.content || '';

  console.log('🧠 OpenAI Raw Response:\n', result);

  return NextResponse.json({ result });
}
