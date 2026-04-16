const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateProposal({ client_name, segment, service, estimated_value, deadline }) {
  const systemPrompt = `You are a professional business proposal writer. Generate a commercial proposal in JSON format with these exact keys: "introduction", "scope", "investment", "next_steps". Each value should be a well-written paragraph in Portuguese (Brazil). Be professional, persuasive, and specific to the client's segment.`;

  const userPrompt = `Generate a commercial proposal with the following details:
- Client: ${client_name}
- Segment: ${segment}
- Service: ${service}
- Estimated Value: R$ ${Number(estimated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Deadline: ${deadline || 'To be defined'}

Return ONLY valid JSON with keys: introduction, scope, investment, next_steps. No markdown, no code fences.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2048,
    temperature: 0.4,
  });

  const raw = response.choices[0].message.content;

  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    const err = new Error('Failed to parse Groq response as JSON');
    err.status = 502;
    err.details = raw;
    throw err;
  }
}

async function generateFollowUp({ client_name, segment, service }) {
  const systemPrompt = `You are a professional business follow-up writer. Write a short, polite follow-up message in Portuguese (Brazil) for a commercial proposal that was sent but hasn't received a response. Be warm but professional. Return ONLY the message text, no JSON.`;

  const userPrompt = `Write a follow-up message for:
- Client: ${client_name}
- Segment: ${segment}
- Service: ${service}

The proposal was sent more than 3 days ago with no response.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 512,
    temperature: 0.5,
  });

  return response.choices[0].message.content.trim();
}

module.exports = { generateProposal, generateFollowUp };
