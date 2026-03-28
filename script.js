// Carregar agendamentos do localStorage
let agendamentos = [];

// Carregar dados salvos ao iniciar
function carregarDados() {
    const salvos = localStorage.getItem('agendamentos_barbearia');
    if (salvos) {
        agendamentos = JSON.parse(salvos);
    }
    exibirAgendamentos();
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('agendamentos_barbearia', JSON.stringify(agendamentos));
}

// Verificar se horário está disponível
function horarioDisponivel(data, horario, idIgnorar = null) {
    return !agendamentos.some(agendamento => {
        if (idIgnorar && agendamento.id === idIgnorar) return false;
        return agendamento.data === data && agendamento.horario === horario;
    });
}

// Exibir mensagem
function mostrarMensagem(texto, tipo) {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem ${tipo}`;
    
    setTimeout(() => {
        mensagemDiv.style.display = 'none';
    }, 3000);
}

// Exibir lista de agendamentos
function exibirAgendamentos() {
    const listaDiv = document.getElementById('listaAgendamentos');
    
    if (agendamentos.length === 0) {
        listaDiv.innerHTML = '<p style="text-align: center; color: #999;">Nenhum agendamento realizado</p>';
        return;
    }
    
    listaDiv.innerHTML = '';
    agendamentos.forEach(agendamento => {
        const card = document.createElement('div');
        card.className = 'appointment-card';
        
        const statusClass = agendamento.status === 'pendente' ? 'status-pendente' : 'status-confirmado';
        const statusText = agendamento.status === 'pendente' ? '⏳ Pendente' : '✓ Confirmado';
        
        card.innerHTML = `
            <div class="appointment-info">
                <h3>${agendamento.nome}</h3>
                <p>📞 ${agendamento.telefone} | ✉️ ${agendamento.email}</p>
                <p>✂️ ${agendamento.servico}</p>
                <p>📅 ${formatarData(agendamento.data)} às ${agendamento.horario}</p>
                <span class="appointment-status ${statusClass}">${statusText}</span>
            </div>
            <button class="btn-cancelar" onclick="cancelarAgendamento('${agendamento.id}')">Cancelar</button>
        `;
        
        listaDiv.appendChild(card);
    });
}

// Formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Cancelar agendamento
function cancelarAgendamento(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        agendamentos = agendamentos.filter(a => a.id !== id);
        salvarDados();
        exibirAgendamentos();
        mostrarMensagem('Agendamento cancelado com sucesso!', 'success');
    }
}

// Gerar ID único
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Enviar email de confirmação (simulado)
function enviarEmailSimulado(email, nome, servico, data, horario) {
    console.log('=== SIMULAÇÃO DE EMAIL ===');
    console.log(`Para: ${email}`);
    console.log(`Assunto: Confirmação de Agendamento - Barbearia Estilo`);
    console.log(`
    Olá ${nome}!
    
    Seu agendamento foi realizado com sucesso:
    Serviço: ${servico}
    Data: ${formatarData(data)}
    Horário: ${horario}
    
    Aguardamos você!
    
    Barbearia Estilo
    `);
    console.log('========================');
    
    // Aqui você pode integrar com um serviço de email real depois
    return true;
}

// Processar agendamento
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Pegar valores do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    
    // Validações
    if (!nome || !email || !telefone || !servico || !data || !horario) {
        mostrarMensagem('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Validar data (não pode ser no passado)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSelecionada = new Date(data);
    
    if (dataSelecionada < hoje) {
        mostrarMensagem('Não é possível agendar para datas passadas!', 'error');
        return;
    }
    
    // Validar horário disponível
    if (!horarioDisponivel(data, horario)) {
        mostrarMensagem('Este horário já está ocupado! Escolha outro horário.', 'error');
        return;
    }
    
    // Criar agendamento
    const novoAgendamento = {
        id: gerarId(),
        nome: nome,
        email: email,
        telefone: telefone,
        servico: servico,
        data: data,
        horario: horario,
        status: 'pendente',
        dataCriacao: new Date().toISOString()
    };
    
    // Salvar
    agendamentos.push(novoAgendamento);
    salvarDados();
    exibirAgendamentos();
    
    // Enviar email simulado
    enviarEmailSimulado(email, nome, servico, data, horario);
    
    // Limpar formulário
    this.reset();
    
    // Mostrar mensagem de sucesso
    mostrarMensagem('✓ Agendamento realizado com sucesso! Verifique seu email.', 'success');
});

// Configurar data mínima (hoje)
const hoje = new Date().toISOString().split('T')[0];
document.getElementById('data').min = hoje;

// Inicializar
carregarDados();

// Função para verificar horários ocupados ao selecionar data
document.getElementById('data').addEventListener('change', function() {
    const dataSelecionada = this.value;
    const horarioSelect = document.getElementById('horario');
    
    // Resetar horário
    horarioSelect.value = '';
    
    // Habilitar todos os horários
    for (let option of horarioSelect.options) {
        if (option.value) {
            option.disabled = false;
            option.style.opacity = '1';
        }
    }
    
    // Desabilitar horários ocupados
    agendamentos.forEach(agendamento => {
        if (agendamento.data === dataSelecionada) {
            for (let option of horarioSelect.options) {
                if (option.value === agendamento.horario) {
                    option.disabled = true;
                    option.style.opacity = '0.5';
                }
            }
        }
    });
});
