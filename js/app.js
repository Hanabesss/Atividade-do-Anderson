// js/app.js
import { AlunoService } from './services/alunos.js';
import { AvaliadorService } from './services/avaliadores.js';
import { ProvaService } from './services/provas.js';
import { NotaService } from './services/notas.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('appStore', () => ({
    // Navegação e Autenticação
    currentTab: 'dashboard',
    user: { nome: 'Coordenação', area: 'Línguas Estrangeiras' },
    activeSemestre: '2026-2',

    // Sistema Global de Toast Notificações
    toasts: [],
    showToast(title, message, type = 'success') {
      const id = Date.now();
      this.toasts.push({ id, title, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 4000);
    },

    // Coleções do Estado
    alunos: [],
    avaliadores: [],
    disponibilidades: [],
    provas: [],

    // Filtros do Dashboard/Geral
    filtros: {
      semestre: '2026-2',
      status: 'todos',
      avaliador_nome: 'todos',
      busca: ''
    },

    // Filtros da tela Alunos
    alunoFiltro: {
      busca: '',
      curso: 'ALL',
      situacao: 'ALL'
    },

    // Wizard Agendamento State (T9)
    wizardStep: 2, // 1: Candidato, 2: Avaliador/Horário, 3: Revisão
    wizard: {
      aluno: {
        id: 'a6',
        nome: 'Mariana Ribeiro Guimarães',
        ra: '1430962323019',
        email: 'mariana.guimaraes@fatec.sp.gov.br',
        curso: 'Tecnologia em GTI',
        semestre: '5º Semestre • Noturno'
      },
      avaliador: {
        id: 'av4',
        nome: 'Profa. Dra. Helena Salles',
        area: 'Letras Anglo-Germânicas',
        banca: 'Banca A'
      },
      slot: {
        date: '15/10/2026',
        time: '10:00 - 10:45',
        room: 'Sala NEPLE 02 (Bloco Acadêmico B)'
      },
      modalSucesso: false,
      tokenGerado: 'f83e291a84c90e2b'
    },

    // Modal Lançamento de Notas (T11)
    notaModal: {
      open: false,
      provaId: null,
      alunoNome: '',
      alunoRA: '',
      nota: '',
      nivel: '',
      observacoes: ''
    },

    // Modal Convocação e Token (T10 Link Preview)
    convocacaoModal: {
      open: false,
      alunoNome: '',
      alunoRA: '',
      sessao: '',
      local: '',
      avaliador: '',
      tokenLink: '',
      token: ''
    },

    // Modal Novo Avaliador (T8)
    novoAvaliadorModal: {
      open: false,
      nome: '',
      email: '',
      titulacao: 'Doutor',
      idioma: 'EN'
    },

    // Modal Importar CSV (T7)
    importCsvModal: {
      open: false,
      previewVisible: true,
      parsedPreview: [
        { linha: '#1', ra: '2840482411001', nome: 'Ana Beatriz Mendonça de Souza', email: 'ana.souza18@fatec.sp.gov.br', curso: 'DSM', semestre: '2026-2', status: 'Válido', valido: true },
        { linha: '#2', ra: '2840482411015', nome: 'Carlos Eduardo Albuquerque', email: 'carlos.albuquerque@fatec.sp.gov.br', curso: 'GTI', semestre: '2026-2', status: 'Válido', valido: true },
        { linha: '#3', ra: '2840482411028', nome: 'Danielle Cristina dos Passos', email: 'danielle.passos@gmail.com', curso: 'GPI', semestre: '2026-2', status: 'Erro de Domínio', valido: false },
        { linha: '#4', ra: '2840482411033', nome: 'Felipe Augusto Ramos da Cunha', email: 'felipe.cunha@fatec.sp.gov.br', curso: 'DSM', semestre: '2026-2', status: 'Válido', valido: true },
        { linha: '#5', ra: '2840482411049', nome: 'Gabriela Martins Nogueira', email: 'gabriela.nogueira@fatec.sp.gov.br', curso: 'COMEX', semestre: '2026-2', status: 'Válido', valido: true }
      ]
    },

    async init() {
      await this.carregarDados();
    },

    async carregarDados() {
      this.alunos = await AlunoService.listar();
      this.avaliadores = await AvaliadorService.listar();
      this.disponibilidades = await AvaliadorService.listarDisponibilidades();
      this.provas = await ProvaService.listar(this.filtros);
    },

    async aplicarFiltrosProvas() {
      this.provas = await ProvaService.listar(this.filtros);
    },

    // Getters Filtrados
    get provasFiltradas() {
      let items = this.provas;
      if (this.filtros.status && this.filtros.status !== 'todos') {
        items = items.filter(p => p.status === this.filtros.status);
      }
      if (this.filtros.avaliador_nome && this.filtros.avaliador_nome !== 'todos') {
        items = items.filter(p => p.avaliador_nome === this.filtros.avaliador_nome);
      }
      if (this.filtros.busca) {
        const term = this.filtros.busca.toLowerCase();
        items = items.filter(p => p.aluno_nome.toLowerCase().includes(term) || p.ra.includes(term));
      }
      return items;
    },

    get alunosFiltrados() {
      let items = this.alunos;
      if (this.alunoFiltro.busca) {
        const term = this.alunoFiltro.busca.toLowerCase();
        items = items.filter(a => a.nome.toLowerCase().includes(term) || a.ra.includes(term));
      }
      if (this.alunoFiltro.curso !== 'ALL') {
        items = items.filter(a => a.curso === this.alunoFiltro.curso);
      }
      if (this.alunoFiltro.situacao !== 'ALL') {
        if (this.alunoFiltro.situacao === 'AGENDADO') items = items.filter(a => a.status_agendamento === 'agendada');
        if (this.alunoFiltro.situacao === 'CONCLUIDO') items = items.filter(a => a.status_agendamento === 'concluida');
        if (this.alunoFiltro.situacao === 'SEM_AGENDAMENTO') items = items.filter(a => a.status_agendamento === 'sem_agendamento');
      }
      return items;
    },

    // Wizard Seleções (T9)
    selecionarAvaliador(av) {
      this.wizard.avaliador = {
        id: av.id,
        nome: av.nome,
        area: av.titulacao || 'Línguas',
        banca: 'Banca A'
      };
    },

    selecionarSlot(date, time, room) {
      this.wizard.slot = { date, time, room };
    },

    async confirmarAgendamentoWizard() {
      const novaProva = await ProvaService.agendar({
        aluno_id: this.wizard.aluno.id,
        aluno_nome: this.wizard.aluno.nome,
        ra: this.wizard.aluno.ra,
        aluno_email: this.wizard.aluno.email,
        curso: 'GTI',
        avaliador_id: this.wizard.avaliador.id,
        avaliador_nome: this.wizard.avaliador.nome,
        data: '2026-10-15',
        hora_inicio: this.wizard.slot.time.split(' - ')[0],
        hora_fim: this.wizard.slot.time.split(' - ')[1] || '10:45',
        sala: this.wizard.slot.room
      });

      this.wizard.tokenGerado = novaProva.token_confirmacao;
      this.wizard.modalSucesso = true;
      this.showToast('Prova Agendada!', 'Convocação emitida com sucesso.');
      await this.carregarDados();
    },

    // Lançamento de Notas (T11)
    abrirNotaModal(prova) {
      this.notaModal.open = true;
      this.notaModal.provaId = prova.id;
      this.notaModal.alunoNome = prova.aluno_nome;
      this.notaModal.alunoRA = prova.ra;
      this.notaModal.nota = prova.nota || '';
      this.notaModal.nivel = prova.nivel_proficiencia || '';
      this.notaModal.observacoes = prova.observacoes || '';
    },

    async salvarNotaModal() {
      if (!this.notaModal.nota || !this.notaModal.nivel) {
        this.showToast('Atenção', 'Preencha a nota e o nível de proficiência.', 'error');
        return;
      }
      await NotaService.registrar(
        this.notaModal.provaId,
        this.notaModal.nota,
        this.notaModal.nivel,
        this.notaModal.observacoes
      );
      this.notaModal.open = false;
      this.showToast('Nota Homologada', 'Nota e nível CEFR registrados com sucesso.');
      await this.carregarDados();
    },

    // Modal de Convocação
    abrirConvocacaoModal(prova) {
      this.convocacaoModal.open = true;
      this.convocacaoModal.alunoNome = prova.aluno_nome;
      this.convocacaoModal.alunoRA = prova.ra;
      this.convocacaoModal.sessao = `${prova.data} às ${prova.hora_inicio}`;
      this.convocacaoModal.local = prova.sala;
      this.convocacaoModal.avaliador = prova.avaliador_nome;
      this.convocacaoModal.token = prova.token_confirmacao;
      this.convocacaoModal.tokenLink = `${window.location.origin}/pages/confirmar.html?token=${prova.token_confirmacao}`;
    },

    copiarTexto(texto) {
      navigator.clipboard.writeText(texto).then(() => {
        this.showToast('Copiado!', 'Texto copiado para a área de transferência.');
      });
    },

    // Novo Avaliador (T8)
    async salvarNovoAvaliador() {
      if (!this.novoAvaliadorModal.nome || !this.novoAvaliadorModal.email) {
        this.showToast('Erro', 'Nome e e-mail são obrigatórios.', 'error');
        return;
      }
      await AvaliadorService.criar({
        nome: this.novoAvaliadorModal.nome,
        email: this.novoAvaliadorModal.email,
        titulacao: this.novoAvaliadorModal.titulacao,
        idioma: this.novoAvaliadorModal.idioma
      });
      this.novoAvaliadorModal.open = false;
      this.novoAvaliadorModal.nome = '';
      this.novoAvaliadorModal.email = '';
      this.showToast('Avaliador Cadastrado', 'Docente habilitado no sistema.');
      await this.carregarDados();
    },

    // Confirmação Importação CSV (T7)
    async confirmarImportacaoCSV() {
      const elegiveis = this.importCsvModal.parsedPreview.filter(p => p.valido);
      await AlunoService.importarCSV(elegiveis);
      this.importCsvModal.open = false;
      this.showToast('Importação Concluída', `${elegiveis.length} alunos cadastrados no sistema.`);
      await this.carregarDados();
    },

    baixarModeloCSV() {
      const csvContent = "data:text/csv;charset=utf-8,RA;Nome;Email;Curso;Semestre\n2840482411000;Nome Exemplo;aluno@fatec.sp.gov.br;DSM;2026-2";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "modelo_importacao_neple.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast('Modelo Baixado', 'Arquivo CSV modelo gerado com sucesso.');
    },

    // Exportar CSV Relatórios (T12)
    exportarRelatorioCSV() {
      let csv = 'RA;Nome;Email;Curso;Data;Hora;Sala;Avaliador;Status;Nota;Nivel\n';
      this.provas.forEach(p => {
        csv += `${p.ra};${p.aluno_nome};${p.aluno_email};${p.curso};${p.data};${p.hora_inicio};${p.sala};${p.avaliador_nome};${p.status};${p.nota || ''};${p.nivel_proficiencia || ''}\n`;
      });
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `relatorio_neple_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast('Relatório Exportado', 'Download do CSV concluído com sucesso.');
    }
  }));
});
