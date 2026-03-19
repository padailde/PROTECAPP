import * as XLSX from 'xlsx';
import type { Cliente, Sistema, Tecnico, Manutencao, TipoManutencao, StatusManutencao } from '@/types';

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
  data?: unknown[];
}

// ==================== IMPORTAÇÃO DE CLIENTES ====================

export function importClientesFromExcel(
  file: File,
  existingClientes: Cliente[]
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ success: false, message: 'Ficheiro vazio', imported: 0, errors: ['Ficheiro vazio'] });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        const importedClientes: Omit<Cliente, 'id' | 'createdAt'>[] = [];
        const errors: string[] = [];

        jsonData.forEach((row, index) => {
          const nome = row['Nome'] || row['nome'] || row['NOME'];
          
          if (!nome || typeof nome !== 'string' || nome.trim() === '') {
            errors.push(`Linha ${index + 2}: Nome é obrigatório`);
            return;
          }

          // Verificar duplicados por NIF
          const nif = row['NIF'] || row['nif'] || row['Nif'] || '';
          if (nif && existingClientes.some(c => c.nif === nif)) {
            errors.push(`Linha ${index + 2}: Cliente com NIF ${nif} já existe`);
            return;
          }

          importedClientes.push({
            nome: nome.trim(),
            morada: String(row['Morada'] || row['morada'] || row['MORADA'] || ''),
            contacto: String(row['Contacto'] || row['contacto'] || row['CONTACTO'] || row['Telefone'] || ''),
            email: String(row['Email'] || row['email'] || row['EMAIL'] || ''),
            nif: String(nif),
          });
        });

        resolve({
          success: errors.length === 0 || importedClientes.length > 0,
          message: `Importados ${importedClientes.length} clientes${errors.length > 0 ? `, ${errors.length} erros` : ''}`,
          imported: importedClientes.length,
          errors,
          data: importedClientes,
        });
      } catch (error) {
        resolve({
          success: false,
          message: 'Erro ao processar ficheiro',
          imported: 0,
          errors: [String(error)],
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: 'Erro ao ler ficheiro', imported: 0, errors: ['Erro ao ler ficheiro'] });
    };

    reader.readAsBinaryString(file);
  });
}

// ==================== IMPORTAÇÃO DE SISTEMAS ====================

export function importSistemasFromExcel(
  file: File,
  _existingSistemas: Sistema[],
  clientes: Cliente[]
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ success: false, message: 'Ficheiro vazio', imported: 0, errors: ['Ficheiro vazio'] });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        const importedSistemas: Omit<Sistema, 'id' | 'createdAt'>[] = [];
        const errors: string[] = [];

        const clientesMap = new Map(clientes.map(c => [c.nome.toLowerCase(), c.id]));

        jsonData.forEach((row, index) => {
          const nome = row['Nome'] || row['nome'] || row['NOME'];
          const clienteNome = row['Cliente'] || row['cliente'] || row['CLIENTE'];
          
          if (!nome || typeof nome !== 'string' || nome.trim() === '') {
            errors.push(`Linha ${index + 2}: Nome do sistema é obrigatório`);
            return;
          }

          if (!clienteNome) {
            errors.push(`Linha ${index + 2}: Cliente é obrigatório`);
            return;
          }

          const clienteId = clientesMap.get(String(clienteNome).toLowerCase());
          if (!clienteId) {
            errors.push(`Linha ${index + 2}: Cliente "${clienteNome}" não encontrado`);
            return;
          }

          importedSistemas.push({
            clienteId,
            nome: nome.trim(),
            tipo: String(row['Tipo'] || row['tipo'] || row['TIPO'] || 'Outro'),
            localizacao: String(row['Localização'] || row['localizacao'] || row['Localizacao'] || ''),
            descricao: String(row['Descrição'] || row['descricao'] || row['Descricao'] || ''),
          });
        });

        resolve({
          success: errors.length === 0 || importedSistemas.length > 0,
          message: `Importados ${importedSistemas.length} sistemas${errors.length > 0 ? `, ${errors.length} erros` : ''}`,
          imported: importedSistemas.length,
          errors,
          data: importedSistemas,
        });
      } catch (error) {
        resolve({
          success: false,
          message: 'Erro ao processar ficheiro',
          imported: 0,
          errors: [String(error)],
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: 'Erro ao ler ficheiro', imported: 0, errors: ['Erro ao ler ficheiro'] });
    };

    reader.readAsBinaryString(file);
  });
}

// ==================== IMPORTAÇÃO DE TÉCNICOS ====================

export function importTecnicosFromExcel(
  file: File,
  existingTecnicos: Tecnico[]
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ success: false, message: 'Ficheiro vazio', imported: 0, errors: ['Ficheiro vazio'] });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        const importedTecnicos: Omit<Tecnico, 'id' | 'createdAt'>[] = [];
        const errors: string[] = [];

        jsonData.forEach((row, index) => {
          const nome = row['Nome'] || row['nome'] || row['NOME'];
          
          if (!nome || typeof nome !== 'string' || nome.trim() === '') {
            errors.push(`Linha ${index + 2}: Nome é obrigatório`);
            return;
          }

          // Verificar duplicados por email
          const email = String(row['Email'] || row['email'] || row['EMAIL'] || '');
          if (email && existingTecnicos.some(t => t.email === email)) {
            errors.push(`Linha ${index + 2}: Técnico com email ${email} já existe`);
            return;
          }

          importedTecnicos.push({
            nome: nome.trim(),
            email,
            contacto: String(row['Contacto'] || row['contacto'] || row['CONTACTO'] || ''),
            especialidade: String(row['Especialidade'] || row['especialidade'] || row['ESPECIALIDADE'] || 'Multiuso'),
            cor: String(row['Cor'] || row['cor'] || row['COR'] || '#3b82f6'),
            ativo: row['Ativo'] === 'Sim' || row['Ativo'] === true || row['ativo'] === 'Sim' || row['ativo'] === true,
          });
        });

        resolve({
          success: errors.length === 0 || importedTecnicos.length > 0,
          message: `Importados ${importedTecnicos.length} técnicos${errors.length > 0 ? `, ${errors.length} erros` : ''}`,
          imported: importedTecnicos.length,
          errors,
          data: importedTecnicos,
        });
      } catch (error) {
        resolve({
          success: false,
          message: 'Erro ao processar ficheiro',
          imported: 0,
          errors: [String(error)],
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: 'Erro ao ler ficheiro', imported: 0, errors: ['Erro ao ler ficheiro'] });
    };

    reader.readAsBinaryString(file);
  });
}

// ==================== IMPORTAÇÃO DE MANUTENÇÕES ====================

export function importManutencoesFromExcel(
  file: File,
  _existingManutencoes: Manutencao[],
  clientes: Cliente[],
  sistemas: Sistema[],
  tecnicos: Tecnico[]
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ success: false, message: 'Ficheiro vazio', imported: 0, errors: ['Ficheiro vazio'] });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        const importedManutencoes: Omit<Manutencao, 'id' | 'createdAt'>[] = [];
        const errors: string[] = [];

        const clientesMap = new Map(clientes.map(c => [c.nome.toLowerCase(), c.id]));
        const sistemasMap = new Map(sistemas.map(s => [s.nome.toLowerCase(), s.id]));
        const tecnicosMap = new Map(tecnicos.map(t => [t.nome.toLowerCase(), t.id]));

        jsonData.forEach((row, index) => {
          const titulo = row['Título'] || row['titulo'] || row['TITULO'] || row['Titulo'];
          const clienteNome = row['Cliente'] || row['cliente'] || row['CLIENTE'];
          const sistemaNome = row['Sistema'] || row['sistema'] || row['SISTEMA'];
          const dataPrevista = row['Data Prevista'] || row['data prevista'] || row['Data'] || row['data'];
          
          if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
            errors.push(`Linha ${index + 2}: Título é obrigatório`);
            return;
          }

          if (!clienteNome) {
            errors.push(`Linha ${index + 2}: Cliente é obrigatório`);
            return;
          }

          if (!sistemaNome) {
            errors.push(`Linha ${index + 2}: Sistema é obrigatório`);
            return;
          }

          const clienteId = clientesMap.get(String(clienteNome).toLowerCase());
          if (!clienteId) {
            errors.push(`Linha ${index + 2}: Cliente "${clienteNome}" não encontrado`);
            return;
          }

          const sistemaId = sistemasMap.get(String(sistemaNome).toLowerCase());
          if (!sistemaId) {
            errors.push(`Linha ${index + 2}: Sistema "${sistemaNome}" não encontrado`);
            return;
          }

          // Parse data
          let parsedDate: Date;
          if (dataPrevista instanceof Date) {
            parsedDate = dataPrevista;
          } else if (typeof dataPrevista === 'number') {
            // Excel date serial number
            parsedDate = new Date((dataPrevista - 25569) * 86400 * 1000);
          } else if (typeof dataPrevista === 'string') {
            // Try Portuguese format dd/MM/yyyy
            const parts = dataPrevista.split('/');
            if (parts.length === 3) {
              parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else {
              parsedDate = new Date(dataPrevista);
            }
          } else {
            parsedDate = new Date();
          }

          if (isNaN(parsedDate.getTime())) {
            errors.push(`Linha ${index + 2}: Data inválida "${dataPrevista}"`);
            return;
          }

          // Parse tipo
          const tipoStr = String(row['Tipo'] || row['tipo'] || 'preventiva').toLowerCase();
          const tipo: TipoManutencao = tipoStr.includes('corretiva') ? 'corretiva' : 'preventiva';

          // Parse status
          const statusStr = String(row['Estado'] || row['estado'] || row['Status'] || row['status'] || 'pendente').toLowerCase();
          let status: StatusManutencao = 'pendente';
          if (statusStr.includes('curso') || statusStr.includes('progress')) status = 'em_curso';
          else if (statusStr.includes('conclu')) status = 'concluida';
          else if (statusStr.includes('cancel')) status = 'cancelada';

          // Técnico (opcional)
          const tecnicoNome = row['Técnico'] || row['tecnico'] || row['Tecnico'] || row['TECNICO'];
          const tecnicoId = tecnicoNome ? tecnicosMap.get(String(tecnicoNome).toLowerCase()) || null : null;

          // Duração
          const duracaoStr = row['Duração Estimada (min)'] || row['duracao'] || row['Duração'] || row['Duracao'] || 120;
          const duracaoEstimada = typeof duracaoStr === 'number' ? duracaoStr : parseInt(String(duracaoStr)) || 120;

          importedManutencoes.push({
            clienteId,
            sistemaId,
            tecnicoId,
            titulo: titulo.trim(),
            descricao: String(row['Descrição'] || row['descricao'] || row['Descricao'] || ''),
            tipo,
            status,
            dataPrevista: parsedDate,
            dataRealizacao: status === 'concluida' ? new Date() : null,
            duracaoEstimada,
            observacoes: String(row['Observações'] || row['observacoes'] || row['Observacoes'] || ''),
          });
        });

        resolve({
          success: errors.length === 0 || importedManutencoes.length > 0,
          message: `Importadas ${importedManutencoes.length} manutenções${errors.length > 0 ? `, ${errors.length} erros` : ''}`,
          imported: importedManutencoes.length,
          errors,
          data: importedManutencoes,
        });
      } catch (error) {
        resolve({
          success: false,
          message: 'Erro ao processar ficheiro',
          imported: 0,
          errors: [String(error)],
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: 'Erro ao ler ficheiro', imported: 0, errors: ['Erro ao ler ficheiro'] });
    };

    reader.readAsBinaryString(file);
  });
}

// ==================== IMPORTAÇÃO COMPLETA ====================

export interface FullImportData {
  clientes: Omit<Cliente, 'id' | 'createdAt'>[];
  sistemas: Omit<Sistema, 'id' | 'createdAt'>[];
  tecnicos: Omit<Tecnico, 'id' | 'createdAt'>[];
  manutencoes: Omit<Manutencao, 'id' | 'createdAt'>[];
}

export function importFullDataFromExcel(file: File): Promise<{
  success: boolean;
  message: string;
  data?: FullImportData;
  errors: string[];
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ success: false, message: 'Ficheiro vazio', errors: ['Ficheiro vazio'] });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const result: FullImportData = {
          clientes: [],
          sistemas: [],
          tecnicos: [],
          manutencoes: [],
        };
        const errors: string[] = [];

        // Processar cada folha
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

          const normalizedName = sheetName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

          if (normalizedName.includes('cliente')) {
            jsonData.forEach((row) => {
              const nome = row['Nome'] || row['nome'];
              if (nome && typeof nome === 'string' && nome.trim()) {
                result.clientes.push({
                  nome: nome.trim(),
                  morada: String(row['Morada'] || row['morada'] || ''),
                  contacto: String(row['Contacto'] || row['contacto'] || ''),
                  email: String(row['Email'] || row['email'] || ''),
                  nif: String(row['NIF'] || row['nif'] || ''),
                });
              }
            });
          } else if (normalizedName.includes('sistema')) {
            jsonData.forEach((row) => {
              const nome = row['Nome'] || row['nome'];
              if (nome && typeof nome === 'string' && nome.trim()) {
                result.sistemas.push({
                  clienteId: '', // Será resolvido depois
                  nome: nome.trim(),
                  tipo: String(row['Tipo'] || row['tipo'] || 'Outro'),
                  localizacao: String(row['Localização'] || row['localizacao'] || ''),
                  descricao: String(row['Descrição'] || row['descricao'] || ''),
                });
              }
            });
          } else if (normalizedName.includes('tecnico')) {
            jsonData.forEach((row) => {
              const nome = row['Nome'] || row['nome'];
              if (nome && typeof nome === 'string' && nome.trim()) {
                result.tecnicos.push({
                  nome: nome.trim(),
                  email: String(row['Email'] || row['email'] || ''),
                  contacto: String(row['Contacto'] || row['contacto'] || ''),
                  especialidade: String(row['Especialidade'] || row['especialidade'] || 'Multiuso'),
                  cor: String(row['Cor'] || row['cor'] || '#3b82f6'),
                  ativo: true,
                });
              }
            });
          } else if (normalizedName.includes('manutencao')) {
            jsonData.forEach((row) => {
              const titulo = row['Título'] || row['titulo'] || row['Titulo'];
              if (titulo && typeof titulo === 'string' && titulo.trim()) {
                result.manutencoes.push({
                  clienteId: '',
                  sistemaId: '',
                  tecnicoId: null,
                  titulo: titulo.trim(),
                  descricao: String(row['Descrição'] || row['descricao'] || ''),
                  tipo: 'preventiva',
                  status: 'pendente',
                  dataPrevista: new Date(),
                  dataRealizacao: null,
                  duracaoEstimada: 120,
                  observacoes: String(row['Observações'] || row['observacoes'] || ''),
                });
              }
            });
          }
        });

        resolve({
          success: true,
          message: `Importados: ${result.clientes.length} clientes, ${result.sistemas.length} sistemas, ${result.tecnicos.length} técnicos, ${result.manutencoes.length} manutenções`,
          data: result,
          errors,
        });
      } catch (error) {
        resolve({
          success: false,
          message: 'Erro ao processar ficheiro',
          errors: [String(error)],
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: 'Erro ao ler ficheiro', errors: ['Erro ao ler ficheiro'] });
    };

    reader.readAsBinaryString(file);
  });
}
