// 1. Importa a função de autenticação que acabamos de criar.
import { autenticar } from './services/api.js';

// 2. Pega as referências dos elementos do formulário no login.html
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('password');

// 3. Adiciona um "escutador" para o evento de "submit" do formulário
loginForm.addEventListener('submit', async (event) => {
  // Impede que a página recarregue, que é o comportamento padrão de um formulário
  event.preventDefault(); 

  // Pega os valores digitados pelo usuário
  const email = emailInput.value;
  const senha = senhaInput.value;

  // Mostra um feedback visual (opcional, mas bom para o usuário)
  alert('Enviando dados...');

  // 4. Chama a função de autenticação, passando os dados do usuário
  const token = await autenticar(email, senha);

  // 5. Verifica a resposta
  if (token) {
    // Se o token foi recebido com sucesso...
    alert('Login realizado com sucesso!');
    
    // Salva o token no localStorage do navegador para ser usado depois
    localStorage.setItem('authToken', token);

    // Redireciona o usuário para a página do dashboard
    window.location.href = '/dashboard.html';
  } else {
    // Se a autenticação falhou...
    alert('Email ou senha inválidos. Tente novamente.');
  }
});