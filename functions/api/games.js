export async function onRequest(context) {
  const { request, env } = context;
  
  // Bloqueia se o usuário tentar acessar direto digitando a URL no navegador
  const fetchMode = request.headers.get('sec-fetch-mode');
  const fetchSite = request.headers.get('sec-fetch-site');
  
  if (fetchMode === 'navigate' || (fetchSite && fetchSite !== 'same-origin')) {
    return new Response(JSON.stringify({ error: 'Acesso direto não permitido.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const user = env.GITHUB_USER;
  const repo = env.GITHUB_REPO;

  if (!user || !repo) {
    return new Response(JSON.stringify({ error: 'Configuração incompleta.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/`, {
      headers: { 'User-Agent': 'Cloudflare-Pages-Function' }
    });
    
    if (!response.ok) throw new Error('Erro ao acessar GitHub');
    
    const data = await response.json();
    
    // Filtra e limpa os dados aqui no servidor. Envia apenas o estritamente necessário (o nome)
    const folders = data
      .filter(item => item.type === 'dir' && !item.name.startsWith('.') && !item.name.startsWith('_'))
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
