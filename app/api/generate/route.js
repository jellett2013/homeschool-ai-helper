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
You are an expert homeschool‑curriculum advisor.

Suggest **exactly 3** curriculum options for a ${gradeLevel} child who prefers a “${learningStyle}” learning style.
${subject ? `Focus on “${subject}.”` : 'Include a variety of subjects.'}
${alignToState && state ? `Align with homeschool guidelines in ${state}.` : ''}

Return **one line per option** in this pipe‑separated format:
Name | Subject | Short Description | Website URL | Tags | Cost | Justification

• **Tags** = comma list (Religious/Secular, Digital/Physical/Both, etc.)  
• **Cost** = **actual USD figure or range**, e.g. “$49”, “$80‑$120 / yr”, “$249 one‑time”.  
• **Justification** = 30‑50 words on educational value & reimbursement appeal.
`;

  const openAI = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await openAI.json();
  return NextResponse.json({
    result: data?.choices?.[0]?.message?.content || '',
  });
}
