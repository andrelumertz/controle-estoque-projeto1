/**
 * @fileoverview Módulo de autenticação da aplicação.
 * Responsável por capturar os dados do formulário de login,
 * autenticar o usuário via API e, em caso de sucesso, redirecionar
 * para a dashboard.
 */
import { autenticar } from './services/api.js';

// 1. Pega as referências dos elementos
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('password');
const submitButton = loginForm.querySelector('button[type="submit"]');

// 2. Adiciona o "escutador" de envio
/**
 * Event Listener principal para o envio do formulário de login.
 * Realiza os seguintes passos:
 * 1. Previne o comportamento padrão (recarregamento da página).
 * 2. Desabilita o botão de submissão.
 * 3. Chama a API para autenticação (salvando o token no LocalStorage).
 * 4. Em sucesso, redireciona para 'dashboard.html'.
 * 5. Em falha, exibe um alerta de erro e reabilita o botão.
 *
 * @param {Event} event - O evento de 'submit' do formulário.
 * @returns {void}
 */
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Impede o recarregamento da página

  const email = emailInput.value;
  const senha = senhaInput.value;

  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    // 3. Tenta autenticar. A função 'autenticar' já trata a chamada à API e o salvamento no localStorage.
    await autenticar(email, senha);
    
    // SUCESSO! Apenas redireciona.
    window.location.href = 'dashboard.html';

  } catch (error) {
    // FALHA!
    console.error(error);
    // Exibe a mensagem de erro da API.
    alert(error.message); 
    
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});

// A função parseJwt não é mais usada nesta página.
// function parseJwt(token) { ... }