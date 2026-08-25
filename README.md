# ⚡ GoodWe Charging Panel

> Painel de estação de carregamento de veículos elétricos — do onboarding do cliente até a persistência do histórico de carregamento num banco de dados real.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=postgresql&logoColor=white)](https://supabase.com)

---

## 🎯 O que é esse projeto

Um painel interativo, no estilo de uma estação real de carregamento de carros elétricos, onde o cliente:

1. Digita o nome ao chegar
2. É "reconhecido" junto com um veículo simulado (bateria, capacidade, potência)
3. Escolhe até quanto quer carregar (ex: +30%)
4. Vê o cálculo automático de energia, tempo e custo
5. Acompanha o carregamento em tempo real, com gráfico de potência ao vivo
6. Ao final, a sessão é **salva num banco de dados PostgreSQL real**, com todos os dados: cliente, veículo, estação, energia gasta, custo e tempo

Esse projeto nasceu como um exercício de aprendizado full stack — a ideia foi construir cada camada entendendo o porquê de cada decisão, não só copiando código pronto.

---

## 🖼️ Prévia

![Print](painel-carregamento/public/print1.png)
![Print](painel-carregamento/public/print2.png)
![Print](painel-carregamento/public/print3.png)
![Print](painel-carregamento/public/print4.png)




---

## 🏗️ Como o sistema é organizado

Pensa nisso como 3 peças que conversam entre si:

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│                 │       │                  │       │                 │
│    FRONTEND     │──────▶│     BACKEND      │──────▶│  BANCO DE DADOS │
│  (React + TS)   │◀──────│  (Python/FastAPI)│◀──────│  (PostgreSQL)   │
│                 │       │                  │       │                 │
└─────────────────┘       └──────────────────┘       └─────────────────┘
   A telinha que o           O "garçom" que leva         A "estante de
   cliente usa                pedidos pra lá e            fichários" onde
                               pra cá                       tudo é guardado
```

- **Frontend** — a interface visual: telas, animações, cálculo em tempo real
- **Backend** — API REST que recebe pedidos do frontend e conversa com o banco
- **Banco de dados** — guarda clientes, veículos, estações e todo o histórico de carregamentos, de forma relacional (nada de dado duplicado)

---

## 🧰 Stack Tecnológico

**Frontend:** React 18 · TypeScript · Tailwind CSS · Recharts (gráficos) · Lucide (ícones)

**Backend:** Python · FastAPI · Pydantic (validação de dados) · psycopg2

**Banco de dados:** PostgreSQL, hospedado no Supabase

**Ferramentas:** Vite (build do front) · Uvicorn (servidor do back) · Claude(AI) · ChatGPT(AI)

---

## 🗄️ Modelo do Banco de Dados

O banco tem 4 tabelas relacionadas. A ideia central: o cliente existe **uma vez só** no banco, mesmo que ele carregue o carro várias vezes — as outras tabelas só *referenciam* ele pelo `id`.

```
customers ──< vehicles
    │
    └──< charge_sessions >── vehicles
                  │
                  └────────── stations
```

- **`customers`** — nome e sobrenome de quem usou o painel
- **`vehicles`** — veículo simulado, vinculado a um cliente: modelo, placa, capacidade da bateria, potência máxima
- **`stations`** — as 4 estações de carregamento disponíveis (código, potência máxima, status)
- **`charge_sessions`** ⭐ — cada carregamento: qual cliente, qual carro, qual estação, quanta energia foi gasta, quanto custou, quanto tempo levou

---

## 🚀 Rodando o projeto localmente

### Pré-requisitos
- Node.js 18+
- Python 3.9+
- Uma conta no [Supabase](https://supabase.com) (ou PostgreSQL local)

### 1. Clonar o repositório

```bash
git clone https://github.com/Camper-Lingo/challenge_goodwe1.git
cd challenge_goodwe1
```

### 2. Configurar o banco de dados

Rode o script `schema.sql` (na pasta `database/`) no SQL Editor do seu projeto Supabase — ele cria as 4 tabelas.

### 3. Configurar o backend

```bash
cd backend_python
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Copie o arquivo `.env.example` para `.env` e preencha com sua própria connection string do Supabase:

```
DATABASE_URL=postgresql://usuario:senha@host:5432/postgres
```

Rode o servidor:

```bash
uvicorn main:app --reload
```

A API vai rodar em `http://localhost:8000`. A documentação interativa fica em `http://localhost:8000/docs`.

### 4. Configurar o frontend

```bash
cd ../frontend        # ajuste pro nome real da sua pasta
npm install
npm run dev
```

O app vai rodar em `http://localhost:5173`.

---

## 📡 Principais Endpoints da API

- `POST /api/customers` — cria um cliente novo
- `POST /api/vehicles` — cria um veículo vinculado a um cliente
- `GET /api/stations` — lista as estações disponíveis
- `POST /api/sessions` — grava uma sessão de carregamento completa
- `GET /api/customers/{id}/history` — busca o histórico de um cliente

---

## 🧠 O que aprendi construindo isso

- Modelagem relacional de banco de dados (normalização, chaves estrangeiras, por que separar tabelas em vez de repetir dados)
- Criar uma API REST do zero com FastAPI, incluindo validação automática de dados
- Conectar frontend e backend, lidando com CORS, variáveis de ambiente e segurança de credenciais
- Debugar problemas reais de conexão (senha, formatação de URL, ambiente virtual corrompido)
- Fluxo de trabalho com Git (commit local vs. push remoto, tags de versão)

---

## 🗺️ Próximos passos

- [ ] Autenticação de verdade (login/senha ou token)
- [ ] Dashboard administrativo para visualizar todas as estações em tempo real
- [ ] Tarifas dinâmicas por horário de pico
- [ ] Deploy em produção (Vercel para o front, Railway/Render para o back)
- [ ] Testes automatizados

---

## 👤 Autor

Feito por João Pedro Camperlingo como projeto de aprendizado full stack, em parceria conceitual com a GoodWe.

