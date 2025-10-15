const API_URL = 'http://localhost:5000/api/produtos'; 

/**
 * Busca todos os produtos da API (Método GET).
 * @returns {Promise<Array>} Uma lista de produtos.
 */
export async function getProdutos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos da API.');
    }
    return await response.json();
  } catch (error) {
    console.error('Falha em getProdutos:', error);
    return []; // Retorna um array vazio em caso de erro para não quebrar a página.
  }
}

/**
 * Adiciona um novo produto na API (Método POST).
 * @param {object} produto - O objeto do produto a ser criado.
 * @returns {Promise<object|null>} O produto criado ou null em caso de erro.
 */
export async function addProduto(produto) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produto),
    });
    if (!response.ok) {
      throw new Error('Falha ao adicionar o produto.');
    }
    return await response.json();
  } catch (error) {
    console.error('Falha em addProduto:', error);
    return null;
  }
}

/**
 * Deleta um produto da API (Método DELETE).
 * @param {number} id - O ID do produto a ser deletado.
 * @returns {Promise<boolean>} Retorna true se a exclusão for bem-sucedida, false caso contrário.
 */
export async function deleteProduto(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Falha ao deletar o produto.');
      }
      return true;
    } catch (error) {
      console.error('Falha em deleteProduto:', error);
      return false;
    }
}

/**
 * Envia as credenciais para o endpoint de autenticação da API.
 * @param {string} email - O email do usuário.
 * @param {string} senha - A senha do usuário.
 * @returns {Promise<string|null>} O token de autenticação em caso de sucesso, ou null em caso de falha.
 */
export async function autenticar(email, senha) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, { // <-- Verifique se este é seu endpoint de login
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }), // Envia email e senha no corpo da requisição
    });

    if (!response.ok) {
      // Se a resposta for um erro (401, 404, etc.), lança um erro para o catch.
      throw new Error('Falha na autenticação');
    }

    const data = await response.json();
    return data.token; // Supondo que sua API retorna um objeto como { token: "..." }
  
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return null; // Retorna null para indicar que o login falhou
  }
}