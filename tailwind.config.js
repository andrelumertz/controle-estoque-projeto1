/** * @fileoverview Configuração principal do Tailwind CSS.
 * Define quais arquivos o Tailwind deve escanear para gerar
 * o CSS otimizado (PurgeCSS) e permite a extensão de temas.
 * * @type {import('tailwindcss').Config} 
 */
module.exports = {
    // A propriedade 'content' garante que apenas as classes
    // usadas nos arquivos HTML e JS sejam incluídas no output.css.
    content: ["./*.{html,js}"], // Procura classes em arquivos HTML (dashboard.html, login.html) e JS (script.js, login.js)
    theme: {
        extend: {
            // Aqui você pode adicionar cores, fontes, tamanhos, etc., personalizados.
        },
    },
    plugins: [],
}