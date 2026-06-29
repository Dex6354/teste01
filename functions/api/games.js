export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.headers.get('sec-fetch-mode') === 'navigate') {
    return new Response(JSON.stringify({ error: 'Acesso direto não permitido.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const user = env.GITHUB_USER;
  const repo = env.GITHUB_REPO;

  if (!user || !repo) {
    return new Response(JSON.stringify({ error: 'Variáveis ausentes no ambiente de Production do Cloudflare.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/`, {
      headers: { 'User-Agent': 'Cloudflare-Pages-Function' }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `GitHub respondeu com erro (${response.status}): ${errorText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    
    // Filtra removendo arquivos, pastas ocultas e a pasta 'functions'
    const folders = data
      .filter(item => item.type === 'dir' && !item.name.startsWith('.') && !item.name.startsWith('_') && item.name !== 'functions')
      .map(item => ({ name: item.name }));

    return new Response(JSON.stringify(folders), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
