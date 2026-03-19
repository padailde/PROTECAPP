// Tipos para autenticação e permissões

export type UserRole = 'admin' | 'gestor' | 'tecnico' | 'visualizador';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
}

export interface UserPermissions {
  dashboard: Permission;
  clientes: Permission;
  sistemas: Permission;
  tecnicos: Permission;
  calendario: Permission;
  manutencoes: Permission;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  ativo: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Permissões por role
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: true, import: true },
    clientes: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    sistemas: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    tecnicos: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    calendario: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    manutencoes: { view: true, create: true, edit: true, delete: true, export: true, import: true },
  },
  gestor: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: true, import: false },
    clientes: { view: true, create: true, edit: true, delete: false, export: true, import: true },
    sistemas: { view: true, create: true, edit: true, delete: false, export: true, import: true },
    tecnicos: { view: true, create: true, edit: true, delete: false, export: true, import: false },
    calendario: { view: true, create: true, edit: true, delete: false, export: true, import: false },
    manutencoes: { view: true, create: true, edit: true, delete: false, export: true, import: true },
  },
  tecnico: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: false, import: false },
    clientes: { view: true, create: false, edit: false, delete: false, export: false, import: false },
    sistemas: { view: true, create: false, edit: false, delete: false, export: false, import: false },
    tecnicos: { view: false, create: false, edit: false, delete: false, export: false, import: false },
    calendario: { view: true, create: false, edit: true, delete: false, export: true, import: false },
    manutencoes: { view: true, create: false, edit: true, delete: false, export: false, import: false },
  },
  visualizador: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: false, import: false },
    clientes: { view: true, create: false, edit: false, delete: false, export: false, import: false },
    sistemas: { view: true, create: false, edit: false, delete: false, export: false, import: false },
    tecnicos: { view: true, create: false, edit: false, delete: false, export: false, import: false },
    calendario: { view: true, create: false, edit: false, delete: false, export: false, import: false },
    manutencoes: { view: true, create: false, edit: false, delete: false, export: false, import: false },
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  tecnico: 'Técnico',
  visualizador: 'Visualizador',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acesso total a todas as funcionalidades',
  gestor: 'Pode gerir clientes, sistemas e atribuir manutenções',
  tecnico: 'Pode ver e atualizar apenas as suas manutenções',
  visualizador: 'Apenas visualização de dados',
};
