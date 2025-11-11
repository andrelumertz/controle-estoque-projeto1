import { autenticar } from './services/api.js';

/**
 * Decodifica um token JWT para extrair o payload (dados).
 * @param {string} token O token JWT
 * @returns {object | null} O payload do token decodificado ou null se falhar.
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar token", e);
        return null;
    }
}

// --- Definição dos Elementos do Formulário ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('password');
const submitButton = loginForm.querySelector('button[type="submit"]');

// --- Evento de Envio do Formulário de Login ---
loginForm.addEventListener('submit', async (event) => {
  // Impede o recarregamento da página
  event.preventDefault(); 

  const email = emailInput.value;
  const senha = senhaInput.value;

  // Desabilita o botão para evitar cliques duplos
  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    // --- Autenticação ---
    // Chama a API para autenticar e receber o token
    const token = await autenticar(email, senha);
    
    // --- Decodificação do Token e Armazenamento da Role ---
    if (token) {
        const payload = parseJwt(token);
        if (payload) {
            // Tenta encontrar a claim de role. 
            // O padrão do .NET é o longo, mas "role" ou "tipo" são comuns.
            const userRole = payload.role || payload.tipo || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            
            if (userRole) {
                localStorage.setItem('userRole', userRole);
            } else {
                console.warn("Claim 'role' ou 'tipo' não encontrada no token JWT. Definindo como 'user'.");
                localStorage.setItem('userRole', 'user'); 
            }
        }
    }
    
    // --- Sucesso ---
    // Redireciona para o dashboard principal
    window.location.href = 'dashboard.html';

  } catch (error) {
    // --- Tratamento de Falha ---
    console.error(error);
    alert(error.message); // Mostra o erro (ex: "Email ou senha inválidos")
    
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});