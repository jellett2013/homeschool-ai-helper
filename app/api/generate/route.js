// app/api/generate/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const {
      gradeLevel = '',
      learningStyle = '',
      subject = '',
      state = '',
      alignToState = false,
      duration = '',
      exclude = [],
    } = await req.json();

    // ✨ Sanitize + fallback
    const safeExclude = Array.isArray(exclude)
      ? exclude.map((e) => e.trim()).filter(Boolean).slice(0, 20)
      : [];

    // ✨ Construct prompt parts cleanly
    const promptParts = [
      `You are a homeschool curriculum advisor.`,
      `Recommend exactly 3 curriculum options for a ${gradeLevel} student.`,
      learningStyle && `Preferred learning style: ${learningStyle}.`,
      subject && `Focus on subject: ${subject}.`,
      alignToState && state && `Recommendations must align with homeschool guidelines in ${state}.`,
      duration && `Preferred duration: ${duration}.`,
      safeExclude.length > 0 && `Avoid recommending these: ${safeExclude.join(', ')}.`,
      `\n⚠️ Format:\nEach curriculum must be on its own line in this format:\nName | Subject | Description | Link | Tags | Cost | Justification | Duration`,
      `\n⚠️ No bullet points. No markdown. No commentary. Only 3 lines. Use "|" as the only separator.`,
    ];

    const prompt = promptParts.filter(Boolean).join('\n');

    // 🔐 Make API call to OpenAI
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', errorText);
      return NextResponse.json({ error: 'OpenAI API error' }, { status: 502 });
    }

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim() || '';

    if (!result) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    console.log('🧠 OpenAI Raw Response:\n', result);
    return NextResponse.json({ result });
  } catch (err) {
    console.error('❌ Server Error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
