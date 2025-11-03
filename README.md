# 🧠 Monitoramento de Progresso

O **Monitoramento de Progresso** é um sistema web inspirado no Trello, desenvolvido como MVP para o gerenciamento de tarefas e acompanhamento de equipes em projetos.  
Ele permite organizar quadros, tarefas, colaboradores e prazos de forma simples, intuitiva e colaborativa.

---

## 🚀 Funcionalidades Principais

- 🔐 **Autenticação de usuários** (cadastro, login e simulação de verificação de e-mail)
- 🗂️ **Criação e gerenciamento de quadros de tarefas**
- ➕ **Criação, edição e exclusão de tarefas**
- 🎯 **Organização por colunas Kanban:** *A Fazer*, *Em Andamento* e *Concluído*
- 🧲 **Drag & Drop interativo:** mova tarefas entre colunas e o status é atualizado automaticamente
- 🗑️ **Botão de exclusão de quadros e tarefas**
- 👥 **Convite de colaboradores via e-mail**
- 📨 **Compartilhamento de quadros entre usuários convidados**
- 🧑‍💼 **Atribuição de tarefas a colaboradores**
- 📅 **Calendário de prazos e alertas automáticos**
  - Prazo se aproximando
  - Último dia de entrega
  - Atrasada
  - Antecipada
- 📊 **Dashboard de progresso e estatísticas automáticas**
- 💾 **Persistência local (dados mantidos mesmo após recarregar a página)**

---

## 💡 Tecnologias Utilizadas

- **Front-end:** React.js / Vite  
- **Estilo:** Tailwind CSS + Shadcn/UI  
- **Gerenciamento de estado:** React Hooks e Context API  
- **Armazenamento:** LocalStorage (simulação de banco de dados)  
- **Protótipo inicial:** Lovable.AI
- 
---

## 🧠 Lógica de Compartilhamento

- Cada **usuário** possui seus próprios quadros.  
- Ao convidar outro usuário via e-mail, o sistema registra o convite.  
- O convidado, ao aceitar, ganha **acesso completo** ao quadro.  
- Todas as mudanças são **sincronizadas localmente** entre os membros do quadro.

---

## 🔔 Alertas de Prazos

- **Andamento:** tarefa dentro do prazo.
- **Antecipada:** concluída antes do prazo.
- **Último dia:** aviso de alerta visual.
- **Atrasada:** prazo expirado e tarefa não concluída.

---

## 🧑‍💻 Equipe

| Integrante | Função |
|-------------|---------|
| Samael | Documentação |
| Bruno Barbosa | Líder, Desenvolvimento, Documentação e Teste |
| Gabriel Cardoso | Desenvolvimento, Teste e Design |
| Victor Gabriel | Desenvolvimento, Design |
| Agenor Neto | Documentação e Desenvolvimento |
| Pedro Diniz | Desenvolvimento |
| Pedro Henrique | Desenvolvimento |

---

## 📅 Status do Projeto

 **Conclusão (versão MVP funcional)**  
As próximas etapas incluem:
- Terminar a Documentação do projeto

---

## 📜 Licença

Este projeto é de uso acadêmico e está sob a licença MIT.  
Sinta-se livre para estudar, modificar e aprimorar.

---

### 💬 Contato
Para dúvidas ou sugestões, entre em contato com a equipe pelo e-mail:  
📧 **brunobfsm10@gmail.com**

---
