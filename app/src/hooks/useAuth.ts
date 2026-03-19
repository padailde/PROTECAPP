import { useState, useCallback, useEffect } from 'react';
import type { User, UserPermissions } from '@/types/auth';
import { DEFAULT_PERMISSIONS } from '@/types/auth';

// Utilizadores iniciais
const USUARIOS_INICIAIS: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Administrador',
    email: 'admin@empresa.pt',
    role: 'admin',
    permissions: DEFAULT_PERMISSIONS.admin,
    ativo: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    username: 'gestor',
    name: 'Gestor Técnico',
    email: 'gestor@empresa.pt',
    role: 'gestor',
    permissions: DEFAULT_PERMISSIONS.gestor,
    ativo: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    username: 'tecnico1',
    name: 'António Silva',
    email: 'antonio.silva@empresa.pt',
    role: 'tecnico',
    permissions: DEFAULT_PERMISSIONS.tecnico,
    ativo: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    username: 'visualizador',
    name: 'Utilizador Visitante',
    email: 'visitante@empresa.pt',
    role: 'visualizador',
    permissions: DEFAULT_PERMISSIONS.visualizador,
    ativo: true,
    createdAt: new Date('2024-01-01'),
  },
];

const STORAGE_KEY = 'gestao_manutencoes_auth';
const USERS_KEY = 'gestao_manutencoes_users';

// Hash simples para passwords (em produção usar bcrypt)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

// Passwords padrão (em produção devem ser alteradas)
const USER_PASSWORDS: Record<string, string> = {
  'admin': hashPassword('admin123'),
  'gestor': hashPassword('gestor123'),
  'tecnico1': hashPassword('tecnico123'),
  'visualizador': hashPassword('visual123'),
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar estado de autenticação
  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    const storedUsers = localStorage.getItem(USERS_KEY);
    
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.user && authData.isAuthenticated) {
          setUser(authData.user);
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers.map((u: User) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined,
        })));
      } catch {
        setUsers(USUARIOS_INICIAIS);
        localStorage.setItem(USERS_KEY, JSON.stringify(USUARIOS_INICIAIS));
      }
    } else {
      setUsers(USUARIOS_INICIAIS);
      localStorage.setItem(USERS_KEY, JSON.stringify(USUARIOS_INICIAIS));
    }

    setIsLoading(false);
  }, []);

  // Guardar estado de autenticação
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, isAuthenticated }));
    }
  }, [user, isAuthenticated]);

  // Guardar utilizadores
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users]);

  const login = useCallback((username: string, password: string): boolean => {
    const foundUser = users.find((u) => u.username === username && u.ativo);
    
    if (!foundUser) return false;
    
    const hashedPassword = hashPassword(password);
    const storedPassword = USER_PASSWORDS[username];
    
    if (storedPassword && storedPassword === hashedPassword) {
      const updatedUser = { ...foundUser, lastLogin: new Date() };
      setUser(updatedUser);
      setIsAuthenticated(true);
      
      // Atualizar lastLogin nos users
      setUsers((prev) =>
        prev.map((u) => (u.id === foundUser.id ? updatedUser : u))
      );
      
      return true;
    }
    
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasPermission = useCallback((
    module: keyof UserPermissions,
    action: keyof Permission
  ): boolean => {
    if (!user) return false;
    return user.permissions[module][action];
  }, [user]);

  const canView = useCallback((module: keyof UserPermissions) => {
    return hasPermission(module, 'view');
  }, [hasPermission]);

  const canCreate = useCallback((module: keyof UserPermissions) => {
    return hasPermission(module, 'create');
  }, [hasPermission]);

  const canEdit = useCallback((module: keyof UserPermissions) => {
    return hasPermission(module, 'edit');
  }, [hasPermission]);

  const canDelete = useCallback((module: keyof UserPermissions) => {
    return hasPermission(module, 'delete');
  }, [hasPermission]);

  const canExport = useCallback((module: keyof UserPermissions) => {
    return hasPermission(module, 'export');
  }, [hasPermission]);

  const canImport = useCallback((module: keyof UserPermissions) => {
    return hasPermission(module, 'import');
  }, [hasPermission]);

  // Gestão de utilizadores (apenas admin)
  const addUser = useCallback((userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser.id;
  }, []);

  const updateUser = useCallback((id: string, dados: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...dados } : u))
    );
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const changePassword = useCallback((username: string, newPassword: string) => {
    USER_PASSWORDS[username] = hashPassword(newPassword);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    users,
    login,
    logout,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canImport,
    addUser,
    updateUser,
    deleteUser,
    changePassword,
  };
}

type Permission = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
};
