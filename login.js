import { autenticar } from './services/api.js';

// 1. Pega as referências dos elementos
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
    // 3. Tenta autenticar.
    // A função 'autenticar' (do api.js) vai:
    // 1. Chamar a API
    // 2. Pegar o { token, role }
    // 3. Salvar TUDO no localStorage
    // 4. Retornar o { token, role } (que não precisamos usar aqui)
    
    await autenticar(email, senha); //
    
    // Se a linha acima NÃO deu erro, o login foi sucesso
    // e o localStorage JÁ FOI salvo pela própria função 'autenticar'.
    
    // SUCESSO! Apenas redireciona.
    window.location.href = 'dashboard.html';

  } catch (error) {
    // FALHA!
    console.error(error);
    // A função 'autenticar' (do api.js) já formata a msg de erro
    alert(error.message); 
    
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});

// A função parseJwt não é mais usada nesta página.
// function parseJwt(token) { ... }