const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Altera o local do cache do Puppeteer para dentro da pasta do projeto
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};