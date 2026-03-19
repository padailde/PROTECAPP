import { useState, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/sections/LoginPage';
import { Dashboard } from '@/sections/Dashboard';
import { ClientesPage } from '@/sections/ClientesPage';
import { SistemasPage } from '@/sections/SistemasPage';
import { TecnicosPage } from '@/sections/TecnicosPage';
import { CalendarioPage } from '@/sections/CalendarioPage';
import { ManutencoesPage } from '@/sections/ManutencoesPage';
import { UsersPage } from '@/sections/UsersPage';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, LogOut, User, Users, Shield } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  Settings,
  Users as UsersIcon,
  Calendar,
  Wrench,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import type { UserPermissions } from '@/types/auth';
import { ROLE_LABELS } from '@/types/auth';
import { exportAllData } from '@/lib/exportUtils';
import { importClientesFromExcel, importSistemasFromExcel, importTecnicosFromExcel, importManutencoesFromExcel } from '@/lib/importUtils';
import { ImportDialog } from '@/components/ImportDialog';

type Page = 'dashboard' | 'clientes' | 'sistemas' | 'tecnicos' | 'calendario' | 'manutencoes' | 'utilizadores';

const menuItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' as keyof UserPermissions },
  { id: 'clientes' as Page, label: 'Clientes', icon: Building2, module: 'clientes' as keyof UserPermissions },
  { id: 'sistemas' as Page, label: 'Sistemas', icon: Settings, module: 'sistemas' as keyof UserPermissions },
  { id: 'tecnicos' as Page, label: 'Técnicos', icon: UsersIcon, module: 'tecnicos' as keyof UserPermissions },
  { id: 'calendario' as Page, label: 'Calendário', icon: Calendar, module: 'calendario' as keyof UserPermissions },
  { id: 'manutencoes' as Page, label: 'Manutenções', icon: Wrench, module: 'manutencoes' as keyof UserPermissions },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<'clientes' | 'sistemas' | 'tecnicos' | 'manutencoes'>('clientes');

  const {
    clientes,
    sistemas,
    tecnicos,
    manutencoes,
    addCliente,
    updateCliente,
    deleteCliente,
    addSistema,
    updateSistema,
    deleteSistema,
    addTecnico,
    updateTecnico,
    deleteTecnico,
    addManutencao,
    updateManutencao,
    deleteManutencao,
    atribuirTecnico,
    alterarStatus,
    getClienteById,
    getSistemaById,
    getTecnicoById,
  } = useStore();

  const {
    user,
    isAuthenticated,
    isLoading,
    users,
    login,
    logout,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canImport,
    addUser,
    updateUser,
    deleteUser,
  } = useAuth();

  // Enriquecer manutenções com detalhes (usado implicitamente)

  // Filtrar manutenções para técnicos (apenas as suas)
  const manutencoesFiltradas = useMemo(() => {
    if (user?.role === 'tecnico') {
      const tecnico = tecnicos.find((t) => t.email === user.email);
      if (tecnico) {
        return manutencoes.filter((m) => m.tecnicoId === tecnico.id);
      }
    }
    return manutencoes;
  }, [manutencoes, user, tecnicos]);

  const manutencoesComDetalhesFiltradas = useMemo(() => {
    return manutencoesFiltradas.map((m) => ({
      ...m,
      cliente: getClienteById(m.clienteId)!,
      sistema: getSistemaById(m.sistemaId)!,
      tecnico: getTecnicoById(m.tecnicoId) || null,
    }));
  }, [manutencoesFiltradas, getClienteById, getSistemaById, getTecnicoById]);

  // Contagens para estatísticas
  const sistemasCount = useMemo(() => {
    const count: Record<string, number> = {};
    sistemas.forEach((s) => {
      count[s.clienteId] = (count[s.clienteId] || 0) + 1;
    });
    return count;
  }, [sistemas]);

  const manutencoesCountBySistema = useMemo(() => {
    const count: Record<string, number> = {};
    manutencoes.forEach((m) => {
      count[m.sistemaId] = (count[m.sistemaId] || 0) + 1;
    });
    return count;
  }, [manutencoes]);

  const manutencoesCountByTecnico = useMemo(() => {
    const count: Record<string, number> = {};
    manutencoes.forEach((m) => {
      if (m.tecnicoId) {
        count[m.tecnicoId] = (count[m.tecnicoId] || 0) + 1;
      }
    });
    return count;
  }, [manutencoes]);

  // Import handlers
  const handleImportClientes = async (file: File) => {
    const result = await importClientesFromExcel(file, clientes);
    if (result.success && result.data) {
      result.data.forEach((cliente) => addCliente(cliente as Omit<import('@/types').Cliente, 'id' | 'createdAt'>));
    }
    return result;
  };

  const handleImportSistemas = async (file: File) => {
    const result = await importSistemasFromExcel(file, sistemas, clientes);
    if (result.success && result.data) {
      result.data.forEach((sistema) => addSistema(sistema as Omit<import('@/types').Sistema, 'id' | 'createdAt'>));
    }
    return result;
  };

  const handleImportTecnicos = async (file: File) => {
    const result = await importTecnicosFromExcel(file, tecnicos);
    if (result.success && result.data) {
      result.data.forEach((tecnico) => addTecnico(tecnico as Omit<import('@/types').Tecnico, 'id' | 'createdAt'>));
    }
    return result;
  };

  const handleImportManutencoes = async (file: File) => {
    const result = await importManutencoesFromExcel(file, manutencoes, clientes, sistemas, tecnicos);
    if (result.success && result.data) {
      result.data.forEach((manutencao) => addManutencao(manutencao as Omit<import('@/types').Manutencao, 'id' | 'createdAt'>));
    }
    return result;
  };

  const getImportHandler = () => {
    switch (importType) {
      case 'clientes': return handleImportClientes;
      case 'sistemas': return handleImportSistemas;
      case 'tecnicos': return handleImportTecnicos;
      case 'manutencoes': return handleImportManutencoes;
    }
  };

  const getImportTitle = () => {
    switch (importType) {
      case 'clientes': return 'Importar Clientes';
      case 'sistemas': return 'Importar Sistemas';
      case 'tecnicos': return 'Importar Técnicos';
      case 'manutencoes': return 'Importar Manutenções';
    }
  };

  const getImportColumns = () => {
    switch (importType) {
      case 'clientes': return ['Nome', 'Morada', 'Contacto', 'Email', 'NIF'];
      case 'sistemas': return ['Nome', 'Cliente', 'Tipo', 'Localização', 'Descrição'];
      case 'tecnicos': return ['Nome', 'Email', 'Contacto', 'Especialidade', 'Cor'];
      case 'manutencoes': return ['Título', 'Cliente', 'Sistema', 'Data Prevista', 'Tipo', 'Duração Estimada (min)'];
    }
  };

  const openImportDialog = (type: typeof importType) => {
    setImportType(type);
    setImportDialogOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return canView('dashboard') ? (
          <Dashboard
            clientes={clientes}
            sistemas={sistemas}
            tecnicos={tecnicos}
            manutencoes={manutencoesComDetalhesFiltradas}
            onNavigate={(page: string) => setCurrentPage(page as Page)}
          />
        ) : null;
      case 'clientes':
        return canView('clientes') ? (
          <ClientesPage
            clientes={clientes}
            sistemasCount={sistemasCount}
            onAdd={addCliente}
            onUpdate={updateCliente}
            onDelete={deleteCliente}
            canCreate={canCreate('clientes')}
            canEdit={canEdit('clientes')}
            canDelete={canDelete('clientes')}
            canExport={canExport('clientes')}
            canImport={canImport('clientes')}
            onImport={() => openImportDialog('clientes')}
          />
        ) : null;
      case 'sistemas':
        return canView('sistemas') ? (
          <SistemasPage
            sistemas={sistemas}
            clientes={clientes}
            manutencoesCount={manutencoesCountBySistema}
            onAdd={addSistema}
            onUpdate={updateSistema}
            onDelete={deleteSistema}
            canCreate={canCreate('sistemas')}
            canEdit={canEdit('sistemas')}
            canDelete={canDelete('sistemas')}
            canExport={canExport('sistemas')}
            canImport={canImport('sistemas')}
            onImport={() => openImportDialog('sistemas')}
          />
        ) : null;
      case 'tecnicos':
        return canView('tecnicos') ? (
          <TecnicosPage
            tecnicos={tecnicos}
            manutencoesCount={manutencoesCountByTecnico}
            onAdd={addTecnico}
            onUpdate={updateTecnico}
            onDelete={deleteTecnico}
            canCreate={canCreate('tecnicos')}
            canEdit={canEdit('tecnicos')}
            canDelete={canDelete('tecnicos')}
            canExport={canExport('tecnicos')}
            canImport={canImport('tecnicos')}
            onImport={() => openImportDialog('tecnicos')}
          />
        ) : null;
      case 'calendario':
        return canView('calendario') ? (
          <CalendarioPage
            manutencoes={manutencoesComDetalhesFiltradas}
            onSelectManutencao={(_id: string) => {
              setCurrentPage('manutencoes');
            }}
          />
        ) : null;
      case 'manutencoes':
        return canView('manutencoes') ? (
          <ManutencoesPage
            manutencoes={manutencoesFiltradas}
            clientes={clientes}
            sistemas={sistemas}
            tecnicos={tecnicos}
            onAdd={addManutencao}
            onUpdate={updateManutencao}
            onDelete={deleteManutencao}
            onAtribuirTecnico={atribuirTecnico}
            onAlterarStatus={alterarStatus}
            canCreate={canCreate('manutencoes')}
            canEdit={canEdit('manutencoes')}
            canDelete={canDelete('manutencoes')}
            canExport={canExport('manutencoes')}
            canImport={canImport('manutencoes')}
            onImport={() => openImportDialog('manutencoes')}
            currentUser={user}
          />
        ) : null;
      case 'utilizadores':
        return user?.role === 'admin' ? (
          <UsersPage
            users={users}
            currentUser={user}
            onAdd={addUser}
            onUpdate={updateUser}
            onDelete={deleteUser}
          />
        ) : null;
      default:
        return null;
    }
  };

  // Filtrar menu items baseado nas permissões
  const visibleMenuItems = menuItems.filter((item) => canView(item.module));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Import Dialog */}
      <ImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={getImportHandler()}
        title={getImportTitle()}
        templateColumns={getImportColumns()}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Wrench className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-sm">Manutenção</h1>
                    <p className="text-[10px] text-muted-foreground">Gestão Técnica</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" className="mx-auto" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${sidebarOpen ? '' : 'justify-center px-2'}`}
                    onClick={() => setCurrentPage(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        {item.id === 'manutencoes' && (
                          <Badge variant="outline" className="text-xs">
                            {manutencoesFiltradas.filter((m) => m.status === 'pendente').length}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                );
              })}

              {/* Utilizadores (apenas admin) */}
              {user.role === 'admin' && (
                <Button
                  variant={currentPage === 'utilizadores' ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${sidebarOpen ? '' : 'justify-center px-2'}`}
                  onClick={() => setCurrentPage('utilizadores')}
                >
                  <Users className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-3 flex-1 text-left">Utilizadores</span>}
                </Button>
              )}
            </nav>
          </ScrollArea>

          {/* Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Resumo</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clientes</span>
                    <span className="font-medium">{clientes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sistemas</span>
                    <span className="font-medium">{sistemas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Técnicos</span>
                    <span className="font-medium">{tecnicos.filter((t) => t.ativo).length}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pendentes</span>
                    <span className="font-medium text-amber-600">
                      {manutencoesFiltradas.filter((m) => m.status === 'pendente').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          flex-1 transition-all duration-300
          ${sidebarOpen ? 'ml-64' : 'ml-16'}
        `}
      >
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header com Breadcrumb, User e Exportação */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Gestão Técnica</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">
                {menuItems.find((m) => m.id === currentPage)?.label || 'Utilizadores'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Botão de Exportação Global */}
              {canExport('dashboard') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportAllData(clientes, sistemas, tecnicos, manutencoes)}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar Tudo (Excel)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {sidebarOpen && (
                      <div className="text-left">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <User className="h-4 w-4 mr-2" />
                    {user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Shield className="h-4 w-4 mr-2" />
                    {ROLE_LABELS[user.role]}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Page Content */}
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
