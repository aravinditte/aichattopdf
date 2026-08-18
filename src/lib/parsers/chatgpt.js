/**
 * Extracts and parses a shared ChatGPT conversation
 * @param {string} shareId 
 * @returns {Promise<Object>} Normalized conversation object
 */
export async function parseChatGPT(shareId) {
  const url = `https://chatgpt.com/backend-api/share/${shareId}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  });

  if (response.status === 404) {
    throw new Error('Conversation not found or is private');
  } else if (response.status === 429) {
    throw new Error('Rate limited by ChatGPT');
  } else if (!response.ok) {
    throw new Error(`Failed to fetch ChatGPT conversation: ${response.status}`);
  }

  const data = await response.json();
  const title = data.title || 'ChatGPT Conversation';
  const mapping = data.mapping || {};
  
  let rootId = null;
  for (const key in mapping) {
    if (!mapping[key].parent) {
      rootId = key;
      break;
    }
  }

  const messages = [];
  let currentId = rootId;

  while (currentId) {
    const node = mapping[currentId];
    if (node && node.message) {
      const msg = node.message;
      const role = msg.author?.role;
      
      if (role && role !== 'system') {
        const parts = msg.content?.parts || [];
        const content = parts.map(p => typeof p === 'string' ? p : JSON.stringify(p)).join('\n');
        
        if (content.trim()) {
          messages.push({ role, content });
        }
      }
    }
    
    if (node && node.children && node.children.length > 0) {
      currentId = node.children[0];
    } else {
      currentId = null;
    }
  }

  return {
    title,
    platform: 'chatgpt',
    url: `https://chatgpt.com/share/${shareId}`,
    messages
  };
}
