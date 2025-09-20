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
    console.log('Conversations data:', data);
    return data;
}

export async function fetchMessagesByConversation(conversationId) {
  const token = getToken();
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener mensajes');
  const data = await res.json();
  console.log('Messages data:', data);
  return data.messages;
}


export async function streamMessageToConversation(
  conversationId,
  message,
  {
    onToken,
    onDone,
    onError,
    signal,
  } = {}
) {
  const token = getToken();

  const res = await fetch(`${API_URL}/conversations/stream/ask/${conversationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${token}`,
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({ question: message }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Stream request failed');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let sepIndex;
      while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);

        for (const line of rawEvent.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue; 

          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice('data:'.length).trimStart();

            if (data === '[DONE]') {
              onDone?.();
              return;
            }

            onToken?.(data);
          }
        }
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(err);
    throw err;
  }
}


export async function sendMessageToConversation(conversationId, message) {
  const token = getToken();
  const res = await fetch(`${API_URL}/conversations/stream/ask/${conversationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question: message }),
  });
  if (!res.ok) {
    console.error('Error al enviar mensaje:', await res.text());
    throw new Error('Error al enviar mensaje');
  }
  const data = await res.json();
  console.log('Response from API:', data);
  return data.response;
}

///conversations/new
export async function createNewConversation(agentId, title) {
  const token = getToken();
  const res = await fetch(`${API_URL}/conversations/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ agent_id: agentId, conversation_name: title, user_id: token }),
  });
  if (!res.ok) throw new Error('Error al crear nueva conversación');
  const data = await res.json();
  return data.conversation;
}
