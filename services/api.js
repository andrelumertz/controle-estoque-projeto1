// --- 1. CONFIGURAÇÃO PRINCIPAL ---
const API_URL = 'https://localhost:7202/api';

// --- 2. CRIAÇÃO DA INSTÂNCIA DO AXIOS ---
const api = axios.create({
  baseURL: API_URL
});

// --- 3. INTERCEPTOR DE REQUISIÇÃO (Adiciona o Token) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 4. INTERCEPTOR DE RESPOSTA (Trata erros) ---
api.interceptors.response.use(
  (response) => response, // Sucesso
  (error) => { // Erro
    const { response } = error;
    if (response && (response.status === 401 || response.status === 403)) {
      alert("A sua sessão expirou ou não tem permissão! Faça o login novamente.");
      localStorage.removeItem('authToken');
      window.location.href = 'login.html'; // Corrigido para caminho relativo
    }
    // Retorna a mensagem de erro da API C#
    const errorMessage = response?.data?.message || response?.data?.title || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

// --- 5. FUNÇÕES DA API (completas) ---

/**
 * AUTENTICAÇÃO (chamada pelo login.js)
 */
export async function autenticar(email, senha) {
  try {
    const response = await axios.post(`${API_URL}/Auth/login`, {
      email: email, // Usando camelCase
      senha: senha
    });

    const token = response.data.token; // Esperando camelCase
    if (!token) {
      throw new Error("Token não recebido da API.");
    }
    
    localStorage.setItem('authToken', token);
    return token;

  } catch (err) {
    const errorMessage = err.response?.data?.message || err.response?.data?.title || err.response?.data || "Email ou senha inválidos";
    throw new Error(errorMessage);
  }
}

/**
 * PRODUTOS (chamada pelo script.js)
 */
export async function getProdutos() {
  const response = await api.get('/Produtos');
  return response.data; // Retorna os dados (axios já faz o .json())
}

export async function getProduto(id) {
  const response = await api.get(`/Produtos/${id}`);
  return response.data;
}

export async function addProduto(produto) {
  // O 'produto' (em camelCase) vem do script.js
  const response = await api.post('/Produtos', produto);
  return response.data;
}

export async function updateProduto(id, produto) {
  await api.put(`/Produtos/${id}`, produto);
  // PUT não retorna conteúdo (204 No Content)
}

export async function deleteProduto(id) {
  await api.delete(`/Produtos/${id}`);
  // DELETE não retorna conteúdo (204 No Content)
}

/**
 * CLIENTES (chamada pelo script.js)
 */
export async function getClientes() {
  const response = await api.get('/Clientes'); // Verifique este endpoint no C#
  return response.data;
}

export async function addCliente(cliente) {
  const response = await api.post('/Clientes', cliente);
  return response.data;
}

// (Adicione updateCliente e deleteCliente aqui quando precisar)


/**
 * PEDIDOS (NOVO - chamado pelo script.js)
 */
export async function getPedidos() {
  const response = await api.get('/Pedidos');
  return response.data;
}

export async function addPedido(pedido) {
  // O 'pedido' vem do script.js
  const response = await api.post('/Pedidos', pedido);
  return response.data;
}

export async function updatePedido(id, pedido) {
  await api.put(`/Pedidos/${id}`, pedido);
  // PUT não retorna conteúdo (204 No Content)
}

export async function deletePedido(id) {
  await api.delete(`/Pedidos/${id}`);
  // DELETE não retorna conteúdo (204 No Content)
}


/**
 * USUÁRIOS (chamada pelo script.js)
 */
export async function getUsuarios() {
  const response = await api.get('/Usuarios'); // Verifique este endpoint no C#
  return response.data;
}

export async function addUsuario(usuario) {
  const response = await api.post('/Usuarios', usuario);
  return response.data;
}
// (Adicione updateUsuario e deleteUsuario aqui quando precisar)


/**
 * MOVIMENTAÇÕES (Saídas e Entradas)
 * (chamada pelo script.js)
 */
export async function registrarSaida(saida) {
  // 'saida' vem em camelCase (produtoId, quantidade, motivo)
  const response = await api.post('/Saidas', saida); // Verifique este endpoint no C#
  return response.data;
}

export async function registrarEntrada(entrada) {
  // 'entrada' vem em camelCase (produtoId, quantidade, ...)
  const response = await api.post('/Entradas', entrada); // Verifique este endpoint no C#
  return response.data;
}

/**
 * DASHBOARD (Visão Geral)
 */
export async function getVisaoGeralEstoque() {
    // Verifique este endpoint no C#
    const response = await api.get('/Relatorios/estoque/visaogeral'); 
    return response.data;
}