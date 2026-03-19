import * as XLSX from 'xlsx';
import type { Cliente, Sistema, Tecnico, Manutencao, ManutencaoComDetalhes } from '@/types';

// ==================== EXPORTAÇÃO PARA EXCEL ====================

export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = 'Dados'
) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportClientesToExcel(clientes: Cliente[]) {
  const data = clientes.map((c) => ({
    'Nome': c.nome,
    'Morada': c.morada,
    'Contacto': c.contacto,
    'Email': c.email,
    'NIF': c.nif,
    'Data de Criação': new Date(c.createdAt).toLocaleDateString('pt-PT'),
  }));
  exportToExcel(data, 'Clientes', 'Clientes');
}

export function exportSistemasToExcel(sistemas: Sistema[], clientes: Cliente[]) {
  const clientesMap = new Map(clientes.map((c) => [c.id, c.nome]));
  
  const data = sistemas.map((s) => ({
    'Nome': s.nome,
    'Cliente': clientesMap.get(s.clienteId) || 'Desconhecido',
    'Tipo': s.tipo,
    'Localização': s.localizacao,
    'Descrição': s.descricao,
    'Data de Criação': new Date(s.createdAt).toLocaleDateString('pt-PT'),
  }));
  exportToExcel(data, 'Sistemas', 'Sistemas');
}

export function exportTecnicosToExcel(tecnicos: Tecnico[]) {
  const data = tecnicos.map((t) => ({
    'Nome': t.nome,
    'Email': t.email,
    'Contacto': t.contacto,
    'Especialidade': t.especialidade,
    'Cor': t.cor,
    'Ativo': t.ativo ? 'Sim' : 'Não',
    'Data de Criação': new Date(t.createdAt).toLocaleDateString('pt-PT'),
  }));
  exportToExcel(data, 'Tecnicos', 'Técnicos');
}

export function exportManutencoesToExcel(
  manutencoes: Manutencao[],
  clientes: Cliente[],
  sistemas: Sistema[],
  tecnicos: Tecnico[]
) {
  const clientesMap = new Map(clientes.map((c) => [c.id, c.nome]));
  const sistemasMap = new Map(sistemas.map((s) => [s.id, s.nome]));
  const tecnicosMap = new Map(tecnicos.map((t) => [t.id, t.nome]));

  const data = manutencoes.map((m) => ({
    'Título': m.titulo,
    'Descrição': m.descricao,
    'Cliente': clientesMap.get(m.clienteId) || 'Desconhecido',
    'Sistema': sistemasMap.get(m.sistemaId) || 'Desconhecido',
    'Técnico': m.tecnicoId ? tecnicosMap.get(m.tecnicoId) || 'Desconhecido' : 'Não atribuído',
    'Tipo': m.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva',
    'Estado': m.status === 'pendente' ? 'Pendente' :
              m.status === 'em_curso' ? 'Em Curso' :
              m.status === 'concluida' ? 'Concluída' : 'Cancelada',
    'Data Prevista': new Date(m.dataPrevista).toLocaleDateString('pt-PT'),
    'Data Realização': m.dataRealizacao ? new Date(m.dataRealizacao).toLocaleDateString('pt-PT') : '-',
    'Duração Estimada (min)': m.duracaoEstimada,
    'Observações': m.observacoes,
  }));
  exportToExcel(data, 'Manutencoes', 'Manutenções');
}

export function exportAllData(
  clientes: Cliente[],
  sistemas: Sistema[],
  tecnicos: Tecnico[],
  manutencoes: Manutencao[]
) {
  const wb = XLSX.utils.book_new();

  // Clientes
  const clientesData = clientes.map((c) => ({
    'Nome': c.nome,
    'Morada': c.morada,
    'Contacto': c.contacto,
    'Email': c.email,
    'NIF': c.nif,
    'Data de Criação': new Date(c.createdAt).toLocaleDateString('pt-PT'),
  }));
  const wsClientes = XLSX.utils.json_to_sheet(clientesData);
  XLSX.utils.book_append_sheet(wb, wsClientes, 'Clientes');

  // Sistemas
  const clientesMap = new Map(clientes.map((c) => [c.id, c.nome]));
  const sistemasData = sistemas.map((s) => ({
    'Nome': s.nome,
    'Cliente': clientesMap.get(s.clienteId) || 'Desconhecido',
    'Tipo': s.tipo,
    'Localização': s.localizacao,
    'Descrição': s.descricao,
    'Data de Criação': new Date(s.createdAt).toLocaleDateString('pt-PT'),
  }));
  const wsSistemas = XLSX.utils.json_to_sheet(sistemasData);
  XLSX.utils.book_append_sheet(wb, wsSistemas, 'Sistemas');

  // Técnicos
  const tecnicosData = tecnicos.map((t) => ({
    'Nome': t.nome,
    'Email': t.email,
    'Contacto': t.contacto,
    'Especialidade': t.especialidade,
    'Cor': t.cor,
    'Ativo': t.ativo ? 'Sim' : 'Não',
    'Data de Criação': new Date(t.createdAt).toLocaleDateString('pt-PT'),
  }));
  const wsTecnicos = XLSX.utils.json_to_sheet(tecnicosData);
  XLSX.utils.book_append_sheet(wb, wsTecnicos, 'Técnicos');

  // Manutenções
  const sistemasMap = new Map(sistemas.map((s) => [s.id, s.nome]));
  const tecnicosMap = new Map(tecnicos.map((t) => [t.id, t.nome]));
  const manutencoesData = manutencoes.map((m) => ({
    'Título': m.titulo,
    'Descrição': m.descricao,
    'Cliente': clientesMap.get(m.clienteId) || 'Desconhecido',
    'Sistema': sistemasMap.get(m.sistemaId) || 'Desconhecido',
    'Técnico': m.tecnicoId ? tecnicosMap.get(m.tecnicoId) || 'Desconhecido' : 'Não atribuído',
    'Tipo': m.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva',
    'Estado': m.status === 'pendente' ? 'Pendente' :
              m.status === 'em_curso' ? 'Em Curso' :
              m.status === 'concluida' ? 'Concluída' : 'Cancelada',
    'Data Prevista': new Date(m.dataPrevista).toLocaleDateString('pt-PT'),
    'Data Realização': m.dataRealizacao ? new Date(m.dataRealizacao).toLocaleDateString('pt-PT') : '-',
    'Duração Estimada (min)': m.duracaoEstimada,
    'Observações': m.observacoes,
  }));
  const wsManutencoes = XLSX.utils.json_to_sheet(manutencoesData);
  XLSX.utils.book_append_sheet(wb, wsManutencoes, 'Manutenções');

  XLSX.writeFile(wb, 'Gestao_Manutencoes_Completo.xlsx');
}

// ==================== EXPORTAÇÃO PARA CALENDÁRIO (ICS) ====================

function generateICSContent(events: {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizer?: string;
}[]): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GestaoManutencoes//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Manutenções Preventivas',
    'X-WR-TIMEZONE:Europe/Lisbon',
  ];

  events.forEach((event) => {
    icsContent = icsContent.concat([
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.summary}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
    ]);

    if (event.organizer) {
      icsContent.push(`ORGANIZER;CN=${event.organizer}:mailto:${event.organizer}`);
    }

    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n');
}

export function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function exportManutencaoToICS(
  manutencao: ManutencaoComDetalhes,
  includeInOutlook: boolean = false
) {
  const startDate = new Date(manutencao.dataPrevista);
  const endDate = new Date(startDate.getTime() + manutencao.duracaoEstimada * 60000);

  const event = {
    uid: `manutencao-${manutencao.id}@gestaomanutencoes.pt`,
    summary: `[${manutencao.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'}] ${manutencao.titulo}`,
    description: `Cliente: ${manutencao.cliente.nome}
Sistema: ${manutencao.sistema.nome}
Descrição: ${manutencao.descricao}
Estado: ${manutencao.status}
Observações: ${manutencao.observacoes || 'Nenhuma'}`,
    location: `${manutencao.cliente.morada} - ${manutencao.sistema.localizacao}`,
    startDate,
    endDate,
    organizer: manutencao.tecnico?.email,
  };

  const icsContent = generateICSContent([event]);
  
  if (includeInOutlook) {
    // Para Outlook Web, podemos usar o protocolo webcal ou outlook
    const subject = encodeURIComponent(event.summary);
    const body = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&location=${location}&startdt=${start}&enddt=${end}`;
    window.open(outlookUrl, '_blank');
  } else {
    downloadICS(icsContent, `Manutencao_${manutencao.titulo.replace(/\s+/g, '_')}`);
  }
}

export function exportManutencoesToICS(
  manutencoes: ManutencaoComDetalhes[],
  filename: string = 'Manutencoes_Calendario'
) {
  const events = manutencoes.map((m) => {
    const startDate = new Date(m.dataPrevista);
    const endDate = new Date(startDate.getTime() + m.duracaoEstimada * 60000);

    return {
      uid: `manutencao-${m.id}@gestaomanutencoes.pt`,
      summary: `[${m.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'}] ${m.titulo}`,
      description: `Cliente: ${m.cliente.nome}
Sistema: ${m.sistema.nome}
Descrição: ${m.descricao}
Técnico: ${m.tecnico?.nome || 'Não atribuído'}
Estado: ${m.status}
Observações: ${m.observacoes || 'Nenhuna'}`,
      location: `${m.cliente.morada} - ${m.sistema.localizacao}`,
      startDate,
      endDate,
      organizer: m.tecnico?.email,
    };
  });

  const icsContent = generateICSContent(events);
  downloadICS(icsContent, filename);
}

export function exportManutencoesByTecnicoToICS(
  manutencoes: ManutencaoComDetalhes[],
  tecnicoId: string,
  tecnicoNome: string
) {
  const tecnicoManutencoes = manutencoes.filter((m) => m.tecnicoId === tecnicoId);
  exportManutencoesToICS(tecnicoManutencoes, `Manutencoes_${tecnicoNome.replace(/\s+/g, '_')}`);
}

// ==================== EXPORTAÇÃO CSV ====================

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string
) {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
