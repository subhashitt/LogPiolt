// openai.ts
// Utility for calling OpenAI API for log analysis

export async function analyzeLogsWithOpenAI(maskedLogs: string[], apiKey: string): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('OpenAI API key is required');
  }
  
  if (!maskedLogs || maskedLogs.length === 0) {
    throw new Error('No logs provided for analysis');
  }

  console.log('Analyzing logs with OpenAI...', { logsCount: maskedLogs.length });
  const prompt = `Analyze the following application logs. Identify errors, warnings, security issues, performance problems, and provide actionable recommendations.\n\nLogs:\n${maskedLogs.join('\n')}`;

  console.log('Making OpenAI API request...');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // Changed to more widely available model
      messages: [
        { role: 'system', content: 'You are a log analysis expert.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    console.error('OpenAI API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }
  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    console.error('Unexpected OpenAI response format:', data);
    throw new Error('Invalid response format from OpenAI');
  }
  return data.choices[0].message.content.trim();
}
