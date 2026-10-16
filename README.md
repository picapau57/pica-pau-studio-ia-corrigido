# Pica-Pau Studio IA

Plataforma de criação de imagens (DALL-E 3), vídeos, anúncios e campanhas com IA.
Front-end React + Vite + Tailwind; back-end Express (rodando como função serverless na Vercel).

## Rodar localmente
```bash
npm install
cp .env.example .env.local   # preencha GEMINI_API_KEY (e OPENAI_API_KEY se tiver)
npm run dev                  # http://localhost:3000
```
Localmente os dados ficam em `data/studio_db.json` (criado automaticamente, ignorado pelo Git).
Sem `ACCESS_PASSWORD` o acesso local é livre.

## Publicar: GitHub → Vercel
1. Suba o projeto para um repositório no GitHub (`.env` e `node_modules` já estão no `.gitignore`).
2. Na Vercel: **Add New → Project → importe o repositório** (framework Vite é detectado; `vercel.json` já configura tudo).
3. Em **Settings → Environment Variables**, cadastre:
   - `ACCESS_PASSWORD` (obrigatória: senha para entrar no sistema)
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY` (opcional; também dá para colocar no Painel Admin)
4. Em **Storage / Marketplace**, adicione **Upstash Redis** e conecte ao projeto. As variáveis
   `KV_REST_API_URL` / `KV_REST_API_TOKEN` são criadas sozinhas. **Sem isso os dados são temporários.**
5. Faça **Redeploy**. Confira `https://SEU-SITE.vercel.app/api/health` (deve mostrar `"persistence":"redis"`).

## Limitações conhecidas (para evoluir antes de uso comercial)
- Login é só por e-mail (sem senha por usuário); a proteção atual é a senha de acesso única.
- Todo o banco é um único documento JSON no Redis; imagens geradas ficam embutidas (base64) nele,
  então ele cresce rápido. Para produção: Postgres (ex. Supabase/Neon) + Vercel Blob para imagens.
- Vídeo é simulado (vídeo de demonstração), não há geração real.
- Plano Hobby da Vercel é só para uso não comercial.
