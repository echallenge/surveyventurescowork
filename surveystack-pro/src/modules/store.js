/**
 * Store Module — Digital products, subscriptions, and commerce per domain
 */

import { htmlResponse, jsonResponse, escHtml } from '../lib/utils.js';
import { getBlogShell } from '../templates/shell.js';

export async function handleStoreRoutes(ctx) {
  const { path, method } = ctx;

  // GET /store — product listing
  if ((path === '/store' || path === '/products') && method === 'GET') {
    return serveStorePage(ctx);
  }

  // GET /store/:id — single product
  const prodMatch = path.match(/^\/(?:store|products)\/(\d+)\/?$/);
  if (prodMatch && method === 'GET') {
    return serveProductPage(ctx, parseInt(prodMatch[1]));
  }

  return jsonResponse({ error: 'Store route not found' }, 404);
}

async function serveStorePage(ctx) {
  const { domain, env, config, hostname } = ctx;

  const products = await env.DB.prepare(
    'SELECT * FROM products WHERE domain_id = ? AND active = 1 ORDER BY id DESC'
  ).bind(domain.id).all();

  const productsHtml = products.results.length === 0
    ? `<div class="empty-state">
        <div class="empty-icon">🏪</div>
        <h2>Store Coming Soon</h2>
        <p>We're preparing exclusive ${escHtml(config.topic)} resources, guides, and tools.</p>
        <a href="/subscribe" class="btn-primary">Get Notified →</a>
      </div>`
    : `<div class="products-grid">${products.results.map(p => `
        <div class="product-card">
          ${p.image_url ? `<img src="${escHtml(p.image_url)}" alt="${escHtml(p.name)}" class="product-img" />` : `<div class="product-placeholder">${config.icon}</div>`}
          <div class="product-info">
            <span class="product-type badge">${escHtml(p.type)}</span>
            <h3>${escHtml(p.name)}</h3>
            <p>${escHtml(p.description || '')}</p>
            <div class="product-footer">
              <span class="product-price">$${(p.price_cents / 100).toFixed(2)}</span>
              <a href="/store/${p.id}" class="btn-small">View →</a>
            </div>
          </div>
        </div>
      `).join('')}</div>`;

  const html = getBlogShell({
    hostname, config, domain,
    title: `${domain.title} Store`,
    content: `
      <div class="store-page">
        <div class="store-header">
          <h1>${config.icon} ${escHtml(domain.title)} <span>Store</span></h1>
          <p>Exclusive resources, guides, and tools for the ${escHtml(config.topic)} community</p>
        </div>
        ${productsHtml}
      </div>
    `,
  });

  return htmlResponse(html);
}

async function serveProductPage(ctx, productId) {
  const { domain, env, config, hostname } = ctx;

  const product = await env.DB.prepare(
    'SELECT * FROM products WHERE id = ? AND domain_id = ? AND active = 1'
  ).bind(productId, domain.id).first();

  if (!product) return htmlResponse('<h1>Product not found</h1>', 404);

  const metadata = JSON.parse(product.metadata || '{}');

  const html = getBlogShell({
    hostname, config, domain,
    title: product.name,
    content: `
      <div class="product-page">
        <a href="/store" class="back-link">← Back to Store</a>
        <div class="product-detail">
          <div class="product-hero">
            ${product.image_url ? `<img src="${escHtml(product.image_url)}" alt="${escHtml(product.name)}" />` : `<div class="product-placeholder-lg">${config.icon}</div>`}
          </div>
          <div class="product-body">
            <span class="product-type badge">${escHtml(product.type)}</span>
            <h1>${escHtml(product.name)}</h1>
            <p class="product-desc">${escHtml(product.description || '')}</p>
            <div class="product-price-lg">$${(product.price_cents / 100).toFixed(2)} ${escHtml(product.currency)}</div>
            ${product.stock !== -1 ? `<p class="stock-info">${product.stock} remaining</p>` : ''}
            <div class="purchase-section">
              <input type="email" id="buyerEmail" class="sub-input" placeholder="your@email.com" />
              <button class="btn-primary btn-full" onclick="initPurchase(${product.id})">Purchase →</button>
              <p class="purchase-note">Secure checkout. Digital delivery instant.</p>
            </div>
          </div>
        </div>
      </div>

      <script>
      async function initPurchase(productId) {
        const email = document.getElementById('buyerEmail').value.trim();
        if (!email || !email.includes('@')) {
          document.getElementById('buyerEmail').style.borderColor = '#ef4444';
          return;
        }
        const res = await fetch('/api/store/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId, email })
        });
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          alert(data.message || 'Order placed! Check your email for delivery.');
        }
      }
      </script>
    `,
  });

  return htmlResponse(html);
}
