# DoneFlow 2.0

Aplicativo React responsivo inspirado no fluxo mobile do Instagram, com Tailwind CSS e Firestore em tempo real.

## Funcionalidades
- **Agendamento de Posts**: seleção de data/hora, múltiplas plataformas e envio direto para a coleção `scheduled_posts` no Firestore.
- **Workflow de Equipe**: painel de "Aprovação Pendente" com botão de Aprovar que atualiza o status no banco em tempo real.
- **SAC 2.0**: Inbox consolidada simulando mensagens de diferentes redes.
- **Analytics e Concorrência**: cartões de métricas e seção de análise rápida de concorrentes com insights simulados.
- **Recursos de IA**: geração de legendas (simula gemini-2.5-flash-preview-09-2025) e moodboards com o modelo Nanobanana 3.
- **Tema Claro/Escuro**: alternância de tema com navegação inferior no estilo Instagram para mobile.

## Prévia rápida
- **Dashboard**: cards de métricas, análise rápida de concorrentes e lista de posts em aprovação com ação de **Aprovar**.
- **Agendamento**: formulário compacto com seleção de múltiplas plataformas, data/hora e botão de **Agendar Post**.
- **SAC 2.0**: caixa de mensagens simulando atendimentos multicanal para demonstrar o fluxo de equipe.
- **Labs de IA**: botões para gerar legenda otimizada e moodboard/arte conceitual diretamente do card do post.

## Executando localmente
```bash
npm install
npm run dev
```

Para compartilhar uma prévia na rede local (por exemplo, acessar do celular), exponha o host:
```bash
npm run dev:public
```

Crie um arquivo `.env.local` com as chaves do seu projeto Firebase:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER=...
VITE_FIREBASE_APP_ID=...
```

## Publicando online (deploy rápido)
- **Vercel**
  1. No dashboard da Vercel, escolha “Import Git Repository” e selecione este repositório.
  2. Em *Environment Variables*, adicione as mesmas chaves do `.env.local` começando com `VITE_`.
  3. Deploy com o framework **Vite** (build `npm run build`, output `dist`). O preview ficará disponível em um domínio `.vercel.app`.

- **Netlify**
  1. Crie um site a partir do repositório.
  2. Configure as variáveis de ambiente `VITE_...` em *Site settings → Environment variables*.
  3. Build command: `npm run build` / Publish directory: `dist`. O link público será gerado automaticamente.

- **Hospedagem estática + Firebase**
  1. Rode `npm install && npm run build` para gerar `dist/`.
  2. Envie o conteúdo de `dist/` para qualquer CDN/host estático (Cloudflare Pages, S3 + CloudFront, etc.).
  3. Garanta que as variáveis `VITE_` estejam presentes no ambiente de build para conectar ao Firestore.
