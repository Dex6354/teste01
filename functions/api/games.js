export async function onRequest(context) {
  const { env } = context;
  const user = env.GITHUB_USER;
  const repo = env.GITHUB_REPO;

  if (!user || !repo) {
    return new Response(JSON.stringify({ error: 'Configuração incompleta no Cloudflare.' }), {
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
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
