import { autenticar } from './services/api.js';

/**
 * (NOVA FUNÇÃO) Decodifica um token JWT para extrair o payload.
 * @param {string} token O token JWT
 * @returns {object | null} O payload do token decodificado ou null se falhar.
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1]; // Pega o "payload" do token
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
    // (MUDANÇA): Captura o token retornado pela função
    const token = await autenticar(email, senha);
    
    // (NOVO): Decodifica o token e salva a role
    if (token) {
        const payload = parseJwt(token);
        console.log("CONTEÚDO DO TOKEN:", payload)
        if (payload) {
            // Tenta encontrar a claim de role. 
            // O padrão do .NET é o longo, mas "role" é comum.
            const userRole = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (userRole) {
                localStorage.setItem('userRole', userRole);
            } else {
                console.warn("Claim 'role' não encontrada no token JWT.");
                // Define como 'user' por padrão se a role não for encontrada
                localStorage.setItem('userRole', 'user'); 
            }
        }
    }
    
    // SUCESSO!
    window.location.href = 'dashboard.html';

  } catch (error) {
    // FALHA!
    console.error(error);
    alert(error.message); // Mostra o erro (ex: "Email ou senha inválidos")
    
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});