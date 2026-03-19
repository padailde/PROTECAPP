import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Users, Shield, Trash2, Edit, CheckCircle2, XCircle } from 'lucide-react';
import type { User, UserRole } from '@/types/auth';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, DEFAULT_PERMISSIONS } from '@/types/auth';

interface UsersPageProps {
  users: User[];
  currentUser: User;
  onAdd: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, dados: Partial<User>) => void;
  onDelete: (id: string) => void;
}

const AVAILABLE_PERMISSIONS = [
  { key: 'view', label: 'Visualizar' },
  { key: 'create', label: 'Criar' },
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Eliminar' },
  { key: 'export', label: 'Exportar' },
  { key: 'import', label: 'Importar' },
] as const;

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'sistemas', label: 'Sistemas' },
  { key: 'tecnicos', label: 'Técnicos' },
  { key: 'calendario', label: 'Calendário' },
  { key: 'manutencoes', label: 'Manutenções' },
] as const;

export function UsersPage({ users, currentUser, onAdd, onUpdate, onDelete }: UsersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'tecnico' as UserRole,
    permissions: DEFAULT_PERMISSIONS.tecnico,
    ativo: true,
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    onAdd(formData);
    setFormData({
      username: '',
      name: '',
      email: '',
      role: 'tecnico',
      permissions: DEFAULT_PERMISSIONS.tecnico,
      ativo: true,
    });
    setIsAddDialogOpen(false);
  };

  const handleEdit = () => {
    if (editingUser) {
      onUpdate(editingUser.id, formData);
      setEditingUser(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = () => {
    if (editingUser) {
      onDelete(editingUser.id);
      setEditingUser(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      ativo: user.ativo,
    });
    setIsEditDialogOpen(true);
  };

  const openPermissionsDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      ativo: user.ativo,
    });
    setIsPermissionsDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setEditingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const updatePermission = (module: keyof typeof formData.permissions, action: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value,
        },
      },
    }));
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'gestor':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'tecnico':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'visualizador':
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const UserForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nome de Utilizador *</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="ex: joao.silva"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome completo"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@empresa.pt"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Perfil *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) =>
            setFormData({
              ...formData,
              role: value,
              permissions: DEFAULT_PERMISSIONS[value],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecionar perfil" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]} - {ROLE_DESCRIPTIONS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {editingUser && (
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="ativo">Utilizador Ativo</Label>
          <Switch
            id="ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Utilizadores</h2>
          <p className="text-muted-foreground">Gerir acessos e permissões dos utilizadores</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Utilizador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
            </DialogHeader>
            <UserForm />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAdd} disabled={!formData.username.trim() || !formData.name.trim()}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar utilizadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filteredUsers.filter((u) => u.ativo).length} ativos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizador</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum utilizador encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={!user.ativo ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>@{user.username}</span>
                              {user.email && (
                                <>
                                  <span>•</span>
                                  <span>{user.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          <Shield className="h-3 w-3 mr-1" />
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.ativo ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 border-gray-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('pt-PT')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openPermissionsDialog(user)}>
                            Permissões
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser.id && (
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
          </DialogHeader>
          <UserForm />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={!formData.username.trim() || !formData.name.trim()}>
              Guardar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Permissões */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Permissões - {editingUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure as permissões detalhadas para cada módulo.
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <TableHead key={perm.key} className="text-center">
                        {perm.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULES.map((module) => (
                    <TableRow key={module.key}>
                      <TableCell className="font-medium">{module.label}</TableCell>
                      {AVAILABLE_PERMISSIONS.map((perm) => (
                        <TableCell key={perm.key} className="text-center">
                          <input
                            type="checkbox"
                            checked={formData.permissions[module.key as keyof typeof formData.permissions][perm.key as keyof typeof formData.permissions.dashboard]}
                            onChange={(e) =>
                              updatePermission(
                                module.key as keyof typeof formData.permissions,
                                perm.key,
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEdit}>Guardar Permissões</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Eliminação */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Tem certeza que deseja eliminar o utilizador <strong>{editingUser?.name}</strong>?
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
