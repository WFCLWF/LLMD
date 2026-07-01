// API 服务模块
const BASE_URL = 'http://127.0.0.1:8054';

export async function chatStream(userInput) {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_input: userInput }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.body.getReader();
}

export async function getConfig() {
  const response = await fetch(`${BASE_URL}/api/config`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function updateConfig(apiKey, baseUrl, model) {
  const response = await fetch(`${BASE_URL}/api/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, base_url: baseUrl, model }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
