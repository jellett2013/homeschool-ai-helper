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
${learningStyle ? `Learning style: ${learningStyle}` : ''}
${subject ? `Subject: ${subject}` : 'Include a mix of subjects.'}
${alignToState && state ? `Align with homeschool education guidelines in ${state}.` : ''}

⚠️ Return only 3 lines, and each line must use this exact pipe-separated format:

Name | Subject | Description | Link | Tags | Cost | Justification

- Do NOT include any extra commentary or markdown
- Do NOT include bullet points or numbering
- Tags = comma-separated (e.g. Religious,Digital)
- Cost = specific estimate or range (e.g. $80–$120/yr)
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

  return NextResponse.json({
    result: data?.choices?.[0]?.message?.content || '',
  });
}
