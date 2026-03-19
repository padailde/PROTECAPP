import { useState, useCallback } from 'react';
import type { Cliente, Sistema, Tecnico, Manutencao, StatusManutencao } from '@/types';

// Dados iniciais de exemplo
const clientesIniciais: Cliente[] = [
  {
    id: '1',
    nome: 'Hotel Estrela do Mar',
    morada: 'Av. da Praia 123, Lisboa',
    contacto: '210123456',
    email: 'geral@estreladomar.pt',
    nif: '501234567',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    nome: 'Edifício Atlântico',
    morada: 'Rua do Comércio 45, Porto',
    contacto: '220987654',
    email: 'admin@atlantico.pt',
    nif: '502345678',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    nome: 'Centro Comercial Norte',
    morada: 'Estrada Nacional 10, Braga',
    contacto: '253111222',
    email: 'seguranca@ccnorte.pt',
    nif: '503456789',
    createdAt: new Date('2024-03-05'),
  },
];

const sistemasIniciais: Sistema[] = [
  {
    id: '1',
    clienteId: '1',
    nome: 'Sistema de Incêndio - Bloco A',
    tipo: 'Incêndio',
    localizacao: 'Piso -1 e -2 (Parque)',
    descricao: 'Sistema completo de deteção e combate a incêndios',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    clienteId: '1',
    nome: 'Sistema de Climatização',
    tipo: 'HVAC',
    localizacao: 'Todos os pisos',
    descricao: 'Sistema de ar condicionado central',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    clienteId: '2',
    nome: 'Sistema de Segurança',
    tipo: 'CCTV',
    localizacao: 'Entradas e Corredores',
    descricao: 'Câmaras de vigilância e gravação',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '4',
    clienteId: '3',
    nome: 'Sistema de Incêndio',
    tipo: 'Incêndio',
    localizacao: 'Todas as lojas',
    descricao: 'Detetores, extintores e sistema de alarme',
    createdAt: new Date('2024-03-05'),
  },
];

const tecnicosIniciais: Tecnico[] = [
  {
    id: '1',
    nome: 'António Silva',
    email: 'antonio.silva@empresa.pt',
    contacto: '912345678',
    especialidade: 'Incêndio',
    cor: '#3b82f6',
    ativo: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@empresa.pt',
    contacto: '923456789',
    especialidade: 'HVAC',
    cor: '#10b981',
    ativo: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    nome: 'João Pereira',
    email: 'joao.pereira@empresa.pt',
    contacto: '934567890',
    especialidade: 'CCTV',
    cor: '#f59e0b',
    ativo: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'ana.costa@empresa.pt',
    contacto: '945678901',
    especialidade: 'Multiuso',
    cor: '#8b5cf6',
    ativo: true,
    createdAt: new Date('2024-01-01'),
  },
];

const manutencoesIniciais: Manutencao[] = [
  {
    id: '1',
    clienteId: '1',
    sistemaId: '1',
    tecnicoId: '1',
    titulo: 'Manutenção Trimestral',
    descricao: 'Verificação de detetores e extintores',
    tipo: 'preventiva',
    status: 'concluida',
    dataPrevista: new Date('2025-01-15'),
    dataRealizacao: new Date('2025-01-15'),
    duracaoEstimada: 180,
    observacoes: 'Todos os equipamentos em bom estado',
    createdAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    clienteId: '1',
    sistemaId: '2',
    tecnicoId: '2',
    titulo: 'Manutenção Mensal',
    descricao: 'Limpeza de filtros e verificação de pressões',
    tipo: 'preventiva',
    status: 'pendente',
    dataPrevista: new Date('2025-03-20'),
    dataRealizacao: null,
    duracaoEstimada: 120,
    observacoes: '',
    createdAt: new Date('2025-02-01'),
  },
  {
    id: '3',
    clienteId: '2',
    sistemaId: '3',
    tecnicoId: '3',
    titulo: 'Manutenção Semestral',
    descricao: 'Verificação das câmaras e sistema de gravação',
    tipo: 'preventiva',
    status: 'pendente',
    dataPrevista: new Date('2025-03-25'),
    dataRealizacao: null,
    duracaoEstimada: 240,
    observacoes: '',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '4',
    clienteId: '3',
    sistemaId: '4',
    tecnicoId: '1',
    titulo: 'Manutenção Trimestral',
    descricao: 'Teste de alarmes e verificação de extintores',
    tipo: 'preventiva',
    status: 'em_curso',
    dataPrevista: new Date('2025-03-18'),
    dataRealizacao: null,
    duracaoEstimada: 300,
    observacoes: 'Em progresso - verificação do piso 1',
    createdAt: new Date('2025-02-15'),
  },
];

// Gerar IDs únicos
const generateId = () => Math.random().toString(36).substring(2, 9);

export function useStore() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [sistemas, setSistemas] = useState<Sistema[]>(sistemasIniciais);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>(tecnicosIniciais);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>(manutencoesIniciais);

  // Clientes
  const addCliente = useCallback((cliente: Omit<Cliente, 'id' | 'createdAt'>) => {
    const novoCliente: Cliente = {
      ...cliente,
      id: generateId(),
      createdAt: new Date(),
    };
    setClientes((prev) => [...prev, novoCliente]);
    return novoCliente.id;
  }, []);

  const updateCliente = useCallback((id: string, dados: Partial<Cliente>) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...dados } : c))
    );
  }, []);

  const deleteCliente = useCallback((id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    // Também remove sistemas e manutenções associadas
    setSistemas((prev) => prev.filter((s) => s.clienteId !== id));
    setManutencoes((prev) => prev.filter((m) => m.clienteId !== id));
  }, []);

  // Sistemas
  const addSistema = useCallback((sistema: Omit<Sistema, 'id' | 'createdAt'>) => {
    const novoSistema: Sistema = {
      ...sistema,
      id: generateId(),
      createdAt: new Date(),
    };
    setSistemas((prev) => [...prev, novoSistema]);
    return novoSistema.id;
  }, []);

  const updateSistema = useCallback((id: string, dados: Partial<Sistema>) => {
    setSistemas((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...dados } : s))
    );
  }, []);

  const deleteSistema = useCallback((id: string) => {
    setSistemas((prev) => prev.filter((s) => s.id !== id));
    setManutencoes((prev) => prev.filter((m) => m.sistemaId !== id));
  }, []);

  // Técnicos
  const addTecnico = useCallback((tecnico: Omit<Tecnico, 'id' | 'createdAt'>) => {
    const novoTecnico: Tecnico = {
      ...tecnico,
      id: generateId(),
      createdAt: new Date(),
    };
    setTecnicos((prev) => [...prev, novoTecnico]);
    return novoTecnico.id;
  }, []);

  const updateTecnico = useCallback((id: string, dados: Partial<Tecnico>) => {
    setTecnicos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...dados } : t))
    );
  }, []);

  const deleteTecnico = useCallback((id: string) => {
    setTecnicos((prev) => prev.filter((t) => t.id !== id));
    // Remove atribuições deste técnico
    setManutencoes((prev) =>
      prev.map((m) => (m.tecnicoId === id ? { ...m, tecnicoId: null } : m))
    );
  }, []);

  // Manutenções
  const addManutencao = useCallback((manutencao: Omit<Manutencao, 'id' | 'createdAt'>) => {
    const novaManutencao: Manutencao = {
      ...manutencao,
      id: generateId(),
      createdAt: new Date(),
    };
    setManutencoes((prev) => [...prev, novaManutencao]);
    return novaManutencao.id;
  }, []);

  const updateManutencao = useCallback((id: string, dados: Partial<Manutencao>) => {
    setManutencoes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...dados } : m))
    );
  }, []);

  const deleteManutencao = useCallback((id: string) => {
    setManutencoes((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const atribuirTecnico = useCallback((manutencaoId: string, tecnicoId: string | null) => {
    setManutencoes((prev) =>
      prev.map((m) => (m.id === manutencaoId ? { ...m, tecnicoId } : m))
    );
  }, []);

  const alterarStatus = useCallback((manutencaoId: string, status: StatusManutencao) => {
    setManutencoes((prev) =>
      prev.map((m) =>
        m.id === manutencaoId
          ? {
              ...m,
              status,
              dataRealizacao: status === 'concluida' ? new Date() : m.dataRealizacao,
            }
          : m
      )
    );
  }, []);

  // Helpers
  const getClienteById = useCallback(
    (id: string) => clientes.find((c) => c.id === id),
    [clientes]
  );

  const getSistemaById = useCallback(
    (id: string) => sistemas.find((s) => s.id === id),
    [sistemas]
  );

  const getTecnicoById = useCallback(
    (id: string | null) => (id ? tecnicos.find((t) => t.id === id) : null),
    [tecnicos]
  );

  const getSistemasByCliente = useCallback(
    (clienteId: string) => sistemas.filter((s) => s.clienteId === clienteId),
    [sistemas]
  );

  const getManutencoesByCliente = useCallback(
    (clienteId: string) => manutencoes.filter((m) => m.clienteId === clienteId),
    [manutencoes]
  );

  const getManutencoesByTecnico = useCallback(
    (tecnicoId: string) => manutencoes.filter((m) => m.tecnicoId === tecnicoId),
    [manutencoes]
  );

  const getManutencoesByMes = useCallback(
    (ano: number, mes: number) => {
      return manutencoes.filter((m) => {
        const data = new Date(m.dataPrevista);
        return data.getFullYear() === ano && data.getMonth() === mes;
      });
    },
    [manutencoes]
  );

  // Estatísticas
  const getStats = useCallback(() => {
    const hoje = new Date();
    return {
      totalClientes: clientes.length,
      totalSistemas: sistemas.length,
      totalTecnicos: tecnicos.filter((t) => t.ativo).length,
      manutencoesPendentes: manutencoes.filter((m) => m.status === 'pendente').length,
      manutencoesEmCurso: manutencoes.filter((m) => m.status === 'em_curso').length,
      manutencoesConcluidas: manutencoes.filter((m) => m.status === 'concluida').length,
      manutencoesAtrasadas: manutencoes.filter(
        (m) => m.status === 'pendente' && new Date(m.dataPrevista) < hoje
      ).length,
    };
  }, [clientes, sistemas, tecnicos, manutencoes]);

  return {
    // Dados
    clientes,
    sistemas,
    tecnicos,
    manutencoes,
    // Ações Clientes
    addCliente,
    updateCliente,
    deleteCliente,
    // Ações Sistemas
    addSistema,
    updateSistema,
    deleteSistema,
    // Ações Técnicos
    addTecnico,
    updateTecnico,
    deleteTecnico,
    // Ações Manutenções
    addManutencao,
    updateManutencao,
    deleteManutencao,
    atribuirTecnico,
    alterarStatus,
    // Helpers
    getClienteById,
    getSistemaById,
    getTecnicoById,
    getSistemasByCliente,
    getManutencoesByCliente,
    getManutencoesByTecnico,
    getManutencoesByMes,
    getStats,
  };
}
