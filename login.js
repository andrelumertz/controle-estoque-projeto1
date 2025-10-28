import { autenticar } from './services/api.js';

// 1. Pega as referências dos elementos do formulário
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('password');
const submitButton = loginForm.querySelector('button[type="submit"]');

// 2. Adiciona o "escutador" de envio
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Impede o recarregamento da página

  const email = emailInput.value;
  const senha = senhaInput.value;

  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    // 3. Tenta autenticar
    await autenticar(email, senha);
    
    // SUCESSO!
    // A própria função 'autenticar' já salvou o token.
    window.location.href = 'dashboard.html';

  } catch (error) {
    // FALHA!
    // O 'catch' agora recebe a mensagem de erro vinda do axios/back-end
    console.error(error);
    alert(error.message); // Mostra o erro (ex: "Email ou senha inválidos")
    
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});