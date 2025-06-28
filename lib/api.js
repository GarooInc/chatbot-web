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
    //triplicate the agents data to simulate more agents
    data.agents = [...data.agents, ...data.agents, ...data.agents];
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
