const express = require('express');
const { AmazonScraper } = require('@afilimax/amazon-scraper');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 10000;

// Rota básica para saber se o servidor está de pé
app.get('/', (req, res) => {
    res.send('Servidor de teste rodando. Acesse /testar ou /testar-ip para fazer os testes.');
});

// ROTA 1: Testar o @afilimax/amazon-scraper
app.get('/testar', async (req, res) => {
    console.log("Iniciando teste de scraping na Amazon (biblioteca)...");
    
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
        const url = 'https://www.amazon.com.br/dp/B08P2B889P'; 
        console.log("Buscando produto com a biblioteca:", url);
        const product = await scraper.getProduct({ url });
        
        console.log("Sucesso! Dados extraídos pela biblioteca.");
        res.json({ status: "sucesso", dados: product });

    } catch (error) {
        console.error('Erro ao extrair produto com a biblioteca:', error);
        res.status(500).json({ status: "erro", mensagem: error.message });
    } finally {
        await scraper.close();
    }
});

// ROTA 2: Testar IP usando Puppeteer Puro
app.get('/testar-ip', async (req, res) => {
    console.log("Iniciando teste de IP com Puppeteer puro...");
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        
        // Vai direto na página do produto da Amazon
        await page.goto('https://www.amazon.com.br/dp/B08P2B889P', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        const title = await page.title();
        // Tenta pegar o título do produto. Se a Amazon bloquear, não vai achar e retorna null.
        const productTitle = await page.$eval('#productTitle', el => el.innerText.trim()).catch(() => null);
        
        await browser.close();
        
        res.json({
            status: "concluido",
            pageTitle: title, // Título da aba
            productTitle: productTitle, // Nome do produto (se não achar, bloqueou)
            blocked: productTitle === null // true = Bloqueado, false = Funcionou
        });
    } catch (error) {
        if (browser) await browser.close();
        console.error("Erro no teste de IP:", error);
        res.status(500).json({ erro: error.message });
    }
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
