// Tipos para a aplicação de gestão de manutenções preventivas

export interface Cliente {
  id: string;
  nome: string;
  morada: string;
  contacto: string;
  email: string;
  nif: string;
  createdAt: Date;
}

export interface Sistema {
  id: string;
  clienteId: string;
  nome: string;
  tipo: string;
  localizacao: string;
  descricao: string;
  createdAt: Date;
}

export interface Tecnico {
  id: string;
  nome: string;
  email: string;
  contacto: string;
  especialidade: string;
  cor: string;
  ativo: boolean;
  createdAt: Date;
}

export type StatusManutencao = 'pendente' | 'em_curso' | 'concluida' | 'cancelada';
export type TipoManutencao = 'preventiva' | 'corretiva';

export interface Manutencao {
  id: string;
  clienteId: string;
  sistemaId: string;
  tecnicoId: string | null;
  titulo: string;
  descricao: string;
  tipo: TipoManutencao;
  status: StatusManutencao;
  dataPrevista: Date;
  dataRealizacao: Date | null;
  duracaoEstimada: number; // em minutos
  observacoes: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalClientes: number;
  totalSistemas: number;
  totalTecnicos: number;
  manutencoesPendentes: number;
  manutencoesEmCurso: number;
  manutencoesConcluidas: number;
  manutencoesAtrasadas: number;
}

export interface ManutencaoComDetalhes extends Manutencao {
  cliente: Cliente;
  sistema: Sistema;
  tecnico: Tecnico | null;
}
