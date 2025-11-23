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

Crie um arquivo `.env.local` com as chaves do seu projeto Firebase:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER=...
VITE_FIREBASE_APP_ID=...
```
