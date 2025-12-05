const API_BASE_URL = 'http://localhost:3000/api';

let mesasContainer = document.getElementById('mesasContainer');
let reservasContainer = document.getElementById('reservasContainer');
let formReserva = document.getElementById('formReserva');
let reservaForm = document.getElementById('reservaForm');
let btnNovaReserva = document.getElementById('btnNovaReserva');
let btnCancelarForm = document.getElementById('btnCancelarForm');
let btnInicializar = document.getElementById('btnInicializar');
let btnAtualizarStatus = document.getElementById('btnAtualizarStatus');
let filtroCliente = document.getElementById('filtroCliente');
let filtroStatus = document.getElementById('filtroStatus');
let btnAplicarFiltro = document.getElementById('btnAplicarFiltro');
let modalMesa = document.getElementById('modalMesa');
let modalTitulo = document.getElementById('modalTitulo');
let modalCorpo = document.getElementById('modalCorpo');
let modalBotoes = document.getElementById('modalBotoes');

let mesas = [];
let reservas = [];
let mesaSelecionadaParaReserva = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarMesas();
    carregarReservas();
    setInterval(atualizarStatusAutomaticamente, 30000);
});

btnNovaReserva.addEventListener('click', () => {
    formReserva.style.display = 'block';
    formReserva.scrollIntoView({ behavior: 'smooth' });
});

btnCancelarForm.addEventListener('click', () => {
    formReserva.style.display = 'none';
    reservaForm.reset();
    mesaSelecionadaParaReserva = null;
});

btnInicializar.addEventListener('click', inicializarDados);
btnAtualizarStatus.addEventListener('click', atualizarStatusReservas);
btnAplicarFiltro.addEventListener('click', aplicarFiltros);

reservaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    criarReserva();
});

document.querySelector('.close').addEventListener('click', () => {
    modalMesa.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modalMesa) {
        modalMesa.style.display = 'none';
    }
});

async function carregarMesas() {
    try {
        const response = await fetch(`${API_BASE_URL}/mesas`);
        if (!response.ok) throw new Error('Erro ao carregar mesas');
        
        mesas = await response.json();
        renderizarMesas();
        popularSelectMesas();
    } catch (error) {
        mostrarMensagem('Erro ao carregar mesas: ' + error.message, 'erro');
    }
}

async function carregarReservas(filtros = {}) {
    try {
        let url = `${API_BASE_URL}/reservas`;
        const params = new URLSearchParams(filtros).toString();
        if (params) url += `?${params}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar reservas');
        
        reservas = await response.json();
        renderizarReservas();
        renderizarMesas();
    } catch (error) {
        mostrarMensagem('Erro ao carregar reservas: ' + error.message, 'erro');
    }
}

async function criarReserva() {
    try {
        const reservaData = {
            nomeCliente: document.getElementById('nomeCliente').value,
            contatoCliente: document.getElementById('contatoCliente').value,
            numeroMesa: parseInt(document.getElementById('numeroMesa').value),
            quantidadePessoas: parseInt(document.getElementById('quantidadePessoas').value),
            dataHora: document.getElementById('dataHora').value,
            observacoes: document.getElementById('observacoes').value,
            status: 'reservado'
        };
        
        const response = await fetch(`${API_BASE_URL}/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao criar reserva');
        }
        
        mostrarMensagem('Reserva criada com sucesso!', 'sucesso');
        reservaForm.reset();
        formReserva.style.display = 'none';
        carregarReservas();
        
    } catch (error) {
        mostrarMensagem('Erro: ' + error.message, 'erro');
    }
}

async function atualizarStatusReserva(id, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao atualizar reserva');
        }
        
        mostrarMensagem(`Reserva ${status} com sucesso!`, 'sucesso');
        carregarReservas();
        
    } catch (error) {
        mostrarMensagem('Erro: ' + error.message, 'erro');
    }
}

async function cancelarReserva(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao cancelar reserva');
        }
        
        mostrarMensagem('Reserva cancelada com sucesso!', 'sucesso');
        carregarReservas();
        
    } catch (error) {
        mostrarMensagem('Erro: ' + error.message, 'erro');
    }
}

async function atualizarStatusReservas() {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/atualizar-status`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao atualizar status');
        }
        
        mostrarMensagem('Status das reservas atualizados!', 'sucesso');
        carregarReservas();
        
    } catch (error) {
        mostrarMensagem('Erro: ' + error.message, 'erro');
    }
}

async function atualizarStatusAutomaticamente() {
    try {
        await fetch(`${API_BASE_URL}/reservas/atualizar-status`);
        carregarReservas();
    } catch (error) {
        console.error('Erro ao atualizar status automaticamente:', error);
    }
}

async function inicializarDados() {
    try {
        const response = await fetch(`${API_BASE_URL}/inicializar`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao inicializar dados');
        }
        
        mostrarMensagem('Dados iniciais criados com sucesso!', 'sucesso');
        carregarMesas();
        
    } catch (error) {
        mostrarMensagem('Erro: ' + error.message, 'erro');
    }
}

function renderizarMesas() {
    mesasContainer.innerHTML = '';
    
    mesas.forEach(mesa => {
        const reservasMesa = reservas.filter(reserva => 
            reserva.numeroMesa === mesa.numero && 
            ['reservado', 'ocupado'].includes(reserva.status)
        );
        
        let status = 'disponivel';
        let statusTexto = 'Disponível';
        
        if (reservasMesa.length > 0) {
            const reservaAtiva = reservasMesa[0];
            status = reservaAtiva.status;
            statusTexto = reservaAtiva.status === 'reservado' ? 'Reservado' : 'Ocupado';
        }
        
        const mesaElement = document.createElement('div');
        mesaElement.className = `mesa ${status}`;
        mesaElement.innerHTML = `
            <div class="mesa-numero">${mesa.numero}</div>
            <div class="mesa-capacidade">${mesa.capacidade} pessoas</div>
            <div class="mesa-localizacao">${mesa.localizacao}</div>
            <div class="status-dot ${status}"></div>
            <div class="mesa-status">${statusTexto}</div>
        `;
        
        mesaElement.addEventListener('click', () => mostrarDetalhesMesa(mesa, reservasMesa));
        mesasContainer.appendChild(mesaElement);
    });
}

function renderizarReservas() {
    reservasContainer.innerHTML = '';
    
    if (reservas.length === 0) {
        reservasContainer.innerHTML = '<p class="sem-dados">Nenhuma reserva encontrada.</p>';
        return;
    }
    
    reservas.forEach(reserva => {
        const dataHora = new Date(reserva.dataHora).toLocaleString('pt-BR');
        const criadoEm = new Date(reserva.createdAt).toLocaleString('pt-BR');
        
        const reservaElement = document.createElement('div');
        reservaElement.className = `reserva-card ${reserva.status}`;
        reservaElement.innerHTML = `
            <div class="reserva-header">
                <div class="reserva-cliente">${reserva.nomeCliente}</div>
                <div class="reserva-status ${reserva.status}">${reserva.status}</div>
            </div>
            <div class="reserva-detalhes">
                <div class="reserva-detalhe-item">
                    <strong>Contato:</strong> ${reserva.contatoCliente}
                </div>
                <div class="reserva-detalhe-item">
                    <strong>Mesa:</strong> ${reserva.numeroMesa}
                </div>
                <div class="reserva-detalhe-item">
                    <strong>Pessoas:</strong> ${reserva.quantidadePessoas}
                </div>
                <div class="reserva-detalhe-item">
                    <strong>Data/Hora:</strong> ${dataHora}
                </div>
                <div class="reserva-detalhe-item">
                    <strong>Criado em:</strong> ${criadoEm}
                </div>
            </div>
            ${reserva.observacoes ? `<p><strong>Observações:</strong> ${reserva.observacoes}</p>` : ''}
            <div class="reserva-acoes">
                ${reserva.status === 'reservado' ? `
                    <button class="btn btn-success" onclick="atualizarStatusReserva('${reserva._id}', 'ocupado')">
                        <i class="fas fa-user-check"></i> Marcar como Ocupado
                    </button>
                    <button class="btn btn-danger" onclick="cancelarReserva('${reserva._id}')">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                ` : ''}
                ${reserva.status === 'ocupado' ? `
                    <button class="btn btn-secondary" onclick="atualizarStatusReserva('${reserva._id}', 'finalizado')">
                        <i class="fas fa-flag-checkered"></i> Finalizar
                    </button>
                ` : ''}
            </div>
        `;
        
        reservasContainer.appendChild(reservaElement);
    });
}

function popularSelectMesas() {
    const selectMesa = document.getElementById('numeroMesa');
    selectMesa.innerHTML = '<option value="">Selecione uma mesa</option>';
    
    mesas.forEach(mesa => {
        const option = document.createElement('option');
        option.value = mesa.numero;
        option.textContent = `Mesa ${mesa.numero} (${mesa.capacidade} pessoas) - ${mesa.localizacao}`;
        selectMesa.appendChild(option);
    });
}

function mostrarDetalhesMesa(mesa, reservasMesa) {
    modalTitulo.textContent = `Mesa ${mesa.numero}`;
    
    let reservasHTML = '';
    if (reservasMesa.length > 0) {
        reservasMesa.forEach(reserva => {
            const dataHora = new Date(reserva.dataHora).toLocaleString('pt-BR');
            reservasHTML += `
                <div class="reserva-info">
                    <p><strong>Cliente:</strong> ${reserva.nomeCliente}</p>
                    <p><strong>Horário:</strong> ${dataHora}</p>
                    <p><strong>Status:</strong> ${reserva.status}</p>
                </div>
                <hr>
            `;
        });
    } else {
        reservasHTML = '<p>Nenhuma reserva ativa para esta mesa.</p>';
    }
    
    modalCorpo.innerHTML = `
        <p><strong>Capacidade:</strong> ${mesa.capacidade} pessoas</p>
        <p><strong>Localização:</strong> ${mesa.localizacao}</p>
        <h4>Reservas Ativas:</h4>
        ${reservasHTML}
    `;
    
    modalBotoes.innerHTML = '';
    
    if (reservasMesa.length === 0) {
        const btnReservar = document.createElement('button');
        btnReservar.className = 'btn btn-primary';
        btnReservar.innerHTML = '<i class="fas fa-calendar-plus"></i> Reservar esta Mesa';
        btnReservar.addEventListener('click', () => {
            modalMesa.style.display = 'none';
            formReserva.style.display = 'block';
            document.getElementById('numeroMesa').value = mesa.numero;
            formReserva.scrollIntoView({ behavior: 'smooth' });
        });
        modalBotoes.appendChild(btnReservar);
    }
    
    modalMesa.style.display = 'block';
}

function aplicarFiltros() {
    const filtros = {};
    
    if (filtroCliente.value) {
        filtros.cliente = filtroCliente.value;
    }
    
    if (filtroStatus.value) {
        filtros.status = filtroStatus.value;
    }
    
    carregarReservas(filtros);
}

function mostrarMensagem(mensagem, tipo) {
    const mensagemElement = document.createElement('div');
    mensagemElement.className = `mensagem mensagem-${tipo}`;
    mensagemElement.textContent = mensagem;
    
    mensagemElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    if (tipo === 'sucesso') {
        mensagemElement.style.backgroundColor = '#2ecc71';
    } else {
        mensagemElement.style.backgroundColor = '#e74c3c';
    }
    
    document.body.appendChild(mensagemElement);
    
    setTimeout(() => {
        mensagemElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(mensagemElement);
        }, 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .sem-dados {
        text-align: center;
        padding: 40px;
        color: #7f8c8d;
        font-style: italic;
    }
    
    .reserva-info {
        background-color: #f8f9fa;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
    }
`;
document.head.appendChild(style);

const dataHoraInput = document.getElementById('dataHora');
const agora = new Date();
const umaHoraDepois = new Date(agora.getTime() + 60 * 60 * 1000);
const dataMinima = umaHoraDepois.toISOString().slice(0, 16);
dataHoraInput.min = dataMinima;