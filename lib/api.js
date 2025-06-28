const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  return localStorage.getItem('cognitoToken');
}

export async function fetchAgents() {
    const token = getToken();
    const res = await fetch(`${API_URL}/agents/`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error('Error al obtener agentes');
    const data = await res.json();
    return data.agents;
}

export async function fetchConversationsByAgent(agentId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/agents/${agentId}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener conversaciones');
    const data = await res.json();
    return data.conversations;
}

export async function fetchMessagesByConversation(agentId, conversationId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/conversations/${agentId}/${conversationId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener mensajes');
  const data = await res.json();
  return data.messages;
}

export async function sendMessageToConversation(agentId, conversationId, message) {
  const token = getToken();
  const res = await fetch(`${API_URL}/conversations/ask/${agentId}/${conversationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question: message }),
  });
  if (!res.ok) throw new Error('Error al enviar mensaje');
  const data = await res.json();
  console.log('Response from API:', data);
  return data.response;
}

///conversations/new
export async function createNewConversation(agentId, title) {
  const token = getToken();
  const res = await fetch(`${API_URL}/conversations/new/${agentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Error al crear nueva conversación');
  const data = await res.json();
  return data.conversation;
}
