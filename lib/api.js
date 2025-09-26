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
  { onToken, onDone, onError, signal } = {}
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

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Stream request failed');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  function dispatch(rawBlock) {
    let evt = null;
    const dataLines = [];

    for (const line of rawBlock.split('\n')) {
      if (!line) continue;
      if (line.startsWith('event:')) {
        evt = line.slice('event:'.length).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice('data:'.length).replace(/^\s/, ''));
      }
    }

    const data = dataLines.join('\n');

    if (!evt) {
      if (data.includes('[DONE]')) {
        onDone?.();
        return;
      }
      onToken?.({ event: 'answer', data });
      return;
    }

    onToken?.({ event: evt, data });

    if (evt === 'answer_end') onDone?.();
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const rawBlock = buffer.slice(0, idx).trimEnd();
        buffer = buffer.slice(idx + 2);
        if (rawBlock) dispatch(rawBlock);
      }
    }

    if (buffer.trim()) dispatch(buffer.trim());
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
