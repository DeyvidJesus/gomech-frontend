# GoMech Frontend

Aplicação criada com Next.js utilizando a estrutura baseada em `pages/` e estilização com **styled-components**.

## Desenvolvimento

Instale as dependências e execute o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` para visualizar a aplicação.

## Estrutura

- `src/components/` – componentes reutilizáveis (Sidebar, Topbar, ClientTable).
- `src/pages/` – páginas do Next.js. A listagem de clientes está em `/clientes`.
Os estilos globais ficam definidos em `src/pages/_app.tsx`.

Todo o estilo é feito com styled-components. Tailwind e PostCSS foram removidos do projeto.
