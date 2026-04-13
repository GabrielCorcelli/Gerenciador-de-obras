# Gerenciador-de-obras

## Subir com Docker

Esta estrutura usa 3 containers:

- frontend com Nginx
- backend Django com Gunicorn
- banco PostgreSQL

### Arquivos criados

- `Dockerfile` para o backend
- `frontend/Dockerfile` para gerar e servir o frontend
- `frontend/nginx/default.conf` para servir a aplicacao React e fazer proxy para `/api/`, `/admin/` e `/static/`
- `docker-compose.yaml` para orquestrar toda a infraestrutura
- `.env.example` com as variaveis de ambiente esperadas

### Como executar

1. Copie `.env.example` para `.env`
2. Rode `docker compose up --build`

### Enderecos

- Aplicacao: `http://localhost:8080`
- Admin Django: `http://localhost:8080/admin`
- Backend Django direto: `http://localhost:8000`

### Observacoes

- As migracoes do banco e o `collectstatic` sao executados automaticamente na subida do backend.
- Os arquivos estaticos do Django sao compartilhados com o Nginx via volume Docker.
