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
      localStorage.removeItem('userRole'); // Limpa a role também
      window.location.href = 'login.html';
    }
    const errorMessage = response?.data?.message || response?.data?.title || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

// --- 5. FUNÇÕES DA API (completas) ---

/**
 * AUTENTICAÇÃO
 */
export async function autenticar(email, senha) {
  try {
    const response = await axios.post(`${API_URL}/Auth/login`, {
      email: email,
      senha: senha
    });
    const token = response.data.token;
    if (!token) {
      throw new Error("Token não recebido da API.");
    }
    localStorage.setItem('authToken', token);
    return token; // Retorna o token para o login.js
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.response?.data?.title || err.response?.data || "Email ou senha inválidos";
    throw new Error(errorMessage);
  }
}

/**
 * PRODUTOS
 */
export async function getProdutos() {
  const response = await api.get('/Produtos');
  return response.data;
}
export async function getProduto(id) {
  const response = await api.get(`/Produtos/${id}`);
  return response.data;
}
export async function addProduto(produto) {
  const response = await api.post('/Produtos', produto);
  return response.data;
}
export async function updateProduto(id, produto) {
  await api.put(`/Produtos/${id}`, produto);
}
export async function deleteProduto(id) {
  await api.delete(`/Produtos/${id}`);
}

/**
 * CLIENTES
 */
export async function getClientes() {
  const response = await api.get('/Clientes');
  return response.data;
}
export async function getCliente(id) {
  const response = await api.get(`/Clientes/${id}`);
  return response.data;
}
export async function addCliente(cliente) {
  const response = await api.post('/Clientes', cliente);
  return response.data;
}
export async function updateCliente(id, cliente) {
  await api.put(`/Clientes/${id}`, cliente);
}
export async function deleteCliente(id) {
  await api.delete(`/Clientes/${id}`);
}

/**
 * FORNECEDORES
 */
export async function getFornecedores() {
  const response = await api.get('/Fornecedores');
  return response.data;
}
export async function getFornecedor(id) {
  const response = await api.get(`/Fornecedores/${id}`);
  return response.data;
}
export async function addFornecedor(fornecedor) {
  const response = await api.post('/Fornecedores', fornecedor);
  return response.data;
}
export async function updateFornecedor(id, fornecedor) {
  await api.put(`/Fornecedores/${id}`, fornecedor);
}
export async function deleteFornecedor(id) {
  await api.delete(`/Fornecedores/${id}`);
}

/**
 * PEDIDOS (Saída de Estoque)
 */
export async function getPedidos() {
  const response = await api.get('/Pedidos');
  return response.data;
}
export async function addPedido(pedido) {
  const response = await api.post('/Pedidos', pedido);
  return response.data;
}

/**
 * NOTA FISCAL COMPRA (Entrada de Estoque)
 */
export async function getNotasFiscais() {
  const response = await api.get('/NotaFiscalCompra');
  return response.data;
}
export async function getNotaFiscal(id) {
  const response = await api.get(`/NotaFiscalCompra/${id}`);
  return response.data;
}
export async function addNotaFiscalManual(notaFiscal) {
  const response = await api.post('/NotaFiscalCompra', notaFiscal);
  return response.data;
}
export async function updateNotaFiscal(id, notaFiscal) {
  await api.put(`/NotaFiscalCompra/${id}`, notaFiscal);
}
export async function deleteNotaFiscal(id) {
  await api.delete(`/NotaFiscalCompra/${id}`);
}
export async function addNotaFiscalXml(formData) {
  // (Endpoint 'UploadXML' é uma suposição, ajuste se for diferente)
  const response = await api.post('/NotaFiscalCompra/UploadXML', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

/**
 * USUÁRIOS
 */
export async function getUsuarios() {
  const response = await api.get('/Users');
  return response.data;
}
export async function getUsuario(id) {
  const response = await api.get(`/Users/${id}`);
  return response.data;
}
export async function addUsuario(usuario) {
  const response = await api.post('/Users', usuario);
  return response.data;
}
export async function updateUsuario(id, usuario) {
  await api.put(`/Users/${id}`, usuario);
}
export async function deleteUsuario(id) {
  await api.delete(`/Users/${id}`);
}

/**
 * DASHBOARD (Visão Geral)
 */
export async function getVisaoGeralEstoque() {
    const response = await api.get('/Relatorios/estoque/visaogeral'); 
    return response.data;
}