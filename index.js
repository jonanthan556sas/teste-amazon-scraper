const express = require('express');
const { AmazonScraper } = require('@afilimax/amazon-scraper');

const app = express();
const port = process.env.PORT || 10000; // O Render usa a porta 10000 por padrão

app.get('/testar', async (req, res) => {
    console.log("Iniciando teste de scraping na Amazon...");
    
    // Inicializa o scraper
    // Passamos argumentos essenciais para rodar o Chrome em ambiente de container (Render)
    const scraper = new AmazonScraper({
        quiet: false,
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        }
    });

    try {
        // URL de um produto qualquer da Amazon Brasil (pode trocar por um do seu inventário)
        const url = 'https://www.amazon.com.br/dp/B08P2B889P'; 
        
        console.log("Buscando produto:", url);
        const product = await scraper.getProduct({ url });
        
        console.log("Sucesso! Dados extraídos.");
        // Retorna os dados em JSON para vermos no navegador
        res.json({
            status: "sucesso",
            dados: product
        });

    } catch (error) {
        console.error('Erro ao extrair produto:', error);
        res.status(500).json({
            status: "erro",
            mensagem: error.message
        });
    } finally {
        // IMPORTANTE: Fechar o browser para não consumir memória do Render à toa
        await scraper.close();
    }
});

// Rota básica para saber se o servidor está de pé
app.get('/', (req, res) => {
    res.send('Servidor de teste rodando. Acesse /testar para fazer o scraping.');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});