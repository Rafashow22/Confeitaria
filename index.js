$(document).ready(function () {
  $('#mobile_btn').on('click', function () {
    $('#mobile_menu').toggleClass('active');
    $('#mobile_btn').find('i').toggleClass('fa-x');

  });


});

// ==========================
// ELEMENTOS HTML
// ==========================
const carrinhoModal = document.getElementById('car');
const buttonComprar = document.querySelectorAll('.btn-default');
const fechar = document.getElementById('button-close');
const produtos = document.getElementById('dishes');
const carrinhoLista = document.getElementById('cart-items');
const totalValue = document.getElementById('total-value');
const limpar = document.getElementById('limpar-carrinho');
const finalizar = document.getElementById('button-end');

// ==========================
// ESTADO (CARRINHO)
// ==========================
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// ==========================
// ABRIR CARRINHO
// ==========================
buttonComprar.forEach(btn => {
  btn.addEventListener('click', () => {
    carrinhoModal.style.display = 'flex';
  });
});

// ==========================
// FECHAR CARRINHO
// ==========================
carrinhoModal.addEventListener('click', (event) => {
  if (event.target === carrinhoModal) {
    carrinhoModal.style.display = 'none';
  }
});

fechar.addEventListener('click', () => {
  carrinhoModal.style.display = 'none';
});

// ==========================
// ADICIONAR PRODUTO
// ==========================
produtos.addEventListener('click', function (event) {
  const botao = event.target.closest('.btn-default');

  if (botao) {
    const card = botao.closest('.dish');

    const nome = card.querySelector('.dish-title').textContent.trim();
    const valorTexto = card.querySelector('.dish-price h4').textContent;

    const valor = parseFloat(
      valorTexto.replace('R$', '').replace(',', '.')
    );

    const existente = carrinho.find(item => item.nome === nome);

    if (existente) {
      existente.qtd += 1;
    } else {
      carrinho.push({ nome, valor, qtd: 1 });
    }

    renderizarCarrinho();
  }
});

// ==========================
// RENDERIZAR CARRINHO
// ==========================
function renderizarCarrinho() {
  carrinhoLista.innerHTML = '';

  let total = 0;

  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add('item-carrinho');
    const subtotal = item.valor * item.qtd;

    li.innerHTML = `
    <div =class="item-bolo">
        <i class="fa-solid fa-cookie cake-icon"></i> 
         
    <strong>${item.nome}</strong><br>
    </div>

<div class="controle-qtd">
    <button class="btn-diminuir" data-index="${index}">
      <i class="fa-solid fa-minus"></i>
    </button>

    <span class="qtd">${item.qtd}</span>

    <button class="btn-aumentar" data-index="${index}">
      <i class="fa-solid fa-plus"></i>
    </button>
  </div>
      - ${subtotal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })}

     <button class="btn-remover" data-index="${index}">
    <i class="fa-solid fa-trash"></i>
  </button>
    `;

    carrinhoLista.appendChild(li);

    total += subtotal;
  });

  totalValue.textContent = total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  // 💾 salvar no navegador
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// ==========================
// EVENTOS DO CARRINHO
// ==========================
carrinhoLista.addEventListener('click', (event) => {
  const index = event.target.getAttribute('data-index');

  // ➕ aumentar
  if (event.target.classList.contains('btn-aumentar')) {
    carrinho[index].qtd += 1;
  }

  // ➖ diminuir
  if (event.target.classList.contains('btn-diminuir')) {
    carrinho[index].qtd -= 1;

    if (carrinho[index].qtd <= 0) {
      carrinho.splice(index, 1);
    }
  }

  // ❌ remover
  if (event.target.classList.contains('btn-remover')) {
    carrinho.splice(index, 1);
  }

  renderizarCarrinho();
});

// ==========================
// LIMPAR CARRINHO
// ==========================
limpar.addEventListener('click', () => {
  carrinho = [];
  renderizarCarrinho();
});

// ==========================
// FINALIZAR PEDIDO (WHATSAPP)
// ==========================
finalizar.addEventListener('click', () => {
  if (carrinho.length === 0) {
    alert('Carrinho vazio!');
    return;
  }

  let mensagem = '🛒 Pedido:\n\n';

  carrinho.forEach(item => {
    mensagem += `${item.nome} x${item.qtd} - R$ ${(item.valor * item.qtd).toFixed(2)}\n`;
  });

  mensagem += `\nTotal: ${totalValue.textContent}`;

  const telefone = '5521992638393';

  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, '_blank');
});

// ==========================
// INICIAR
// ==========================
renderizarCarrinho();