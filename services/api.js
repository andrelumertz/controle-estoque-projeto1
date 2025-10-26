// 1. CARREGAR O AXIOS (pela CDN, como fizemos)
// (Não há 'import' aqui, usamos a variável global 'axios')

// --- 2. CONFIGURAÇÃO PRINCIPAL ---
const API_URL = 'https://localhost:7202/api';

// --- 3. CRIAÇÃO DA INSTÂNCIA DO AXIOS ---
const api = axios.create({
  baseURL: API_URL
});

// --- 4. INTERCEPTOR DE REQUISIÇÃO (Adiciona o Token) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 5. INTERCEPTOR DE RESPOSTA (Trata erros) ---
api.interceptors.response.use(
  (response) => response, // Sucesso
  (error) => { // Erro
    const { response } = error;
    if (response && (response.status === 401 || response.status === 403)) {
      alert("A sua sessão expirou ou não tem permissão! Faça o login novamente.");
      localStorage.removeItem('authToken');
      window.location.href = '/login.html';
    }
    const errorMessage = response?.data?.message || response?.data?.title || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

// --- 6. FUNÇÕES DA API (CORRIGIDAS PARA camelCase) ---

/**
 * AUTENTICAÇÃO
 */
export async function autenticar(email, senha) {
  try {
    const response = await axios.post(`${API_URL}/Auth/login`, {
      // CORRIGIDO: Enviando em camelCase
      email: email, 
      senha: senha
    });

    // CORRIGIDO: Lendo a resposta em camelCase
    const token = response.data.token; 
    if (!token) {
      throw new Error("Token não recebido da API.");
    }
    
    localStorage.setItem('authToken', token); // Salva o token
    return token;

  } catch (err) {
    const errorMessage = err.response?.data?.message || err.response?.data?.title || err.response?.data || "Email ou senha inválidos";
    throw new Error(errorMessage);
  }
}

/**
 * CRUD PRODUTOS
 * (Estas funções recebem e enviam camelCase)
 */
export async function getProdutos() {
  const response = await api.get('/Produtos'); // O endpoint no C# (Produtos) não afeta o JSON
  return response.data; // A API retorna um array de objetos em camelCase
}

export async function getProduto(id) {
  const response = await api.get(`/Produtos/${id}`);
  return response.data; // A API retorna um objeto em camelCase
}

export async function addProduto(produto) {
  // Recebe 'produto' em camelCase e envia-o
  const response = await api.post('/Produtos', produto);
  return response.data;
}

export async function updateProduto(id, produto) {
  // Recebe 'produto' em camelCase e envia-o
  await api.put(`/Produtos/${id}`, produto);
}

export async function deleteProduto(id) {
  await api.delete(`/Produtos/${id}`);
}

/**
 * MOVIMENTAÇÕES (SAÍDAS)
 */
export async function registrarSaida(saida) {
  // Recebe 'saida' em camelCase e envia-o
  const response = await api.post('/Saidas', saida); 
  return response.data;
}