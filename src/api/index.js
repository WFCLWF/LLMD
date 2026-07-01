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

// ==================== 会话持久化接口 ====================

export async function loadConversations() {
  const response = await fetch(`${BASE_URL}/api/conversations`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.code !== 200) throw new Error(result.message);
  return result.data;  // { conversations: [...], currentConvId: "..." }
}

export async function saveConversations(conversations, currentConvId) {
  const response = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversations, currentConvId }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// ==================== 快捷启动接口 ====================

export async function loadShortcuts() {
  const resp = await fetch(`${BASE_URL}/api/shortcuts`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const result = await resp.json();
  return result.data || [];
}

export async function saveShortcuts(data) {
  await fetch(`${BASE_URL}/api/shortcuts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
}
