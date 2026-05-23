/* ============================================================
   SCRIPT — Docuras da Lu
   ============================================================ */

// ── Elementos ──────────────────────────────────────────────
const sidebar       = document.getElementById('cart-sidebar');
const overlay       = document.getElementById('cart-overlay');
const btnClose      = document.getElementById('btn-close-cart');
const cartItemsEl   = document.getElementById('cart-items');
const cartEmpty     = document.getElementById('cart-empty');
const cartFooterEl  = document.getElementById('cart-footer');
const subtotalEl    = document.getElementById('subtotal-val');
const entregaEl     = document.getElementById('entrega-val');
const totalEl       = document.getElementById('total-val');
const hdCount       = document.getElementById('cart-hd-count');
const fabBadge      = document.getElementById('fab-badge');
const navBadge      = document.getElementById('nav-cart-badge');
const fab           = document.getElementById('cart-fab');
const btnClear      = document.getElementById('btn-clear');
const btnFinish     = document.getElementById('btn-finish');
const toastEl       = document.getElementById('toast');
const header        = document.getElementById('site-header');

// ── Estado ─────────────────────────────────────────────────
let cart = [];
try { cart = JSON.parse(localStorage.getItem('docuras_cart')) || []; } catch {}

// ── Carrinho abrir/fechar ───────────────────────────────────
function openCart()  { sidebar.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeCart() { sidebar.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; }

document.querySelectorAll('.open-cart-btn, #nav-cart-btn').forEach(b => b.addEventListener('click', openCart));
btnClose.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

// ── Mobile menu ─────────────────────────────────────────────
document.getElementById('mobile_btn').addEventListener('click', () => {
  document.getElementById('mobile_menu').classList.toggle('active');
});

// ── Navbar scroll shadow ─────────────────────────────────────
window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10));

// ── Adicionar produto ────────────────────────────────────────
document.getElementById('dishes').addEventListener('click', e => {
  const btn = e.target.closest('.btn-default');
  if (!btn) return;
  const card = btn.closest('.dish');
  if (!card) return;

  const nome  = card.querySelector('.dish-title').textContent.trim();
  const preco = parseFloat(card.querySelector('.dish-price h4').textContent.replace('R$','').replace(',','.').trim());

  const found = cart.find(i => i.nome === nome);
  found ? found.qtd++ : cart.push({ nome, preco, qtd: 1 });

  save(); render();
  toast(`🍬 ${nome} adicionado!`);

  // bounce no FAB
  fab.classList.add('bounce');
  fab.querySelector('i').addEventListener('animationend', () => fab.classList.remove('bounce'), { once: true });

  openCart();
});

// ── Eventos internos do carrinho ──────────────────────────────
cartItemsEl.addEventListener('click', e => {
  const idx = parseInt((e.target.closest('[data-i]') || {}).dataset?.i ?? -1);
  if (idx < 0) return;

  if (e.target.closest('.btn-plus'))  { cart[idx].qtd++; }
  else if (e.target.closest('.btn-minus')) {
    cart[idx].qtd--;
    if (cart[idx].qtd <= 0) cart.splice(idx, 1);
  } else if (e.target.closest('.btn-rem')) {
    const n = cart[idx].nome;
    cart.splice(idx, 1);
    toast(`🗑 ${n} removido`);
  }
  save(); render();
});

btnClear.addEventListener('click', () => {
  if (!cart.length) return;
  cart = []; save(); render(); toast('🧹 Carrinho limpo!');
});

btnFinish.addEventListener('click', () => {
  if (!cart.length) { toast('⚠️ Adicione itens primeiro!'); return; }
  const addr = document.getElementById('cart-address').value.trim();
  const sub  = cart.reduce((s, i) => s + i.preco * i.qtd, 0);

  let msg = '🍬 *Pedido — Docuras da Lu*\n\n📦 *Itens:*\n';
  cart.forEach(i => msg += `• ${i.nome} x${i.qtd} — ${fmt(i.preco * i.qtd)}\n`);
  msg += `\n📦 Subtotal: ${fmt(sub)}\n🛵 Entrega: R$ 5,00\n💰 *Total: ${fmt(sub + 5)}*`;
  if (addr) msg += `\n\n📍 *Endereço:* ${addr}`;
  msg += '\n\nAguardo confirmação! 🩷';

  window.open(`https://wa.me/5521992638393?text=${encodeURIComponent(msg)}`, '_blank');
});

// ── Render ─────────────────────────────────────────────────
function render() {
  cartItemsEl.innerHTML = '';
  const total = cart.reduce((s,i) => s+i.qtd, 0);

  cartEmpty.style.display    = cart.length ? 'none' : 'flex';
  cartFooterEl.classList.toggle('show', cart.length > 0);
  fab.classList.toggle('show', cart.length > 0);

  hdCount.textContent  = total;
  fabBadge.textContent = total;
  navBadge.textContent = total;
  navBadge.classList.toggle('show', total > 0);

  let sub = 0;
  cart.forEach((item, idx) => {
    sub += item.preco * item.qtd;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item-ico"><i class="fa-solid fa-cookie-bite"></i></div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.nome}</p>
        <p class="cart-item-sub">${fmt(item.preco * item.qtd)}</p>
      </div>
      <div class="cart-ctrl">
        <button class="btn-minus" data-i="${idx}" title="Diminuir"><i class="fa-solid fa-minus" data-i="${idx}"></i></button>
        <span class="qty">${item.qtd}</span>
        <button class="btn-plus" data-i="${idx}" title="Aumentar"><i class="fa-solid fa-plus" data-i="${idx}"></i></button>
      </div>
      <button class="btn-rem" data-i="${idx}" title="Remover"><i class="fa-solid fa-trash" data-i="${idx}"></i></button>
    `;
    cartItemsEl.appendChild(li);
  });

  subtotalEl.textContent = fmt(sub);
  entregaEl.textContent  = 'R$ 5,00';
  totalEl.textContent    = fmt(sub + 5);
}

// ── Helpers ─────────────────────────────────────────────────
function fmt(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function save()  { localStorage.setItem('docuras_cart', JSON.stringify(cart)); }

let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// ── Reveal on scroll ─────────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── Init ────────────────────────────────────────────────────
render();