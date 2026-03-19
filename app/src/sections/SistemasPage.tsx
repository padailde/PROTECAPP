import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, Settings, MapPin, FileText, Trash2, Edit, Building2, FileSpreadsheet, Upload } from 'lucide-react';
import type { Sistema, Cliente } from '@/types';
import { exportSistemasToExcel } from '@/lib/exportUtils';

interface SistemasPageProps {
  sistemas: Sistema[];
  clientes: Cliente[];
  manutencoesCount: Record<string, number>;
  onAdd: (sistema: Omit<Sistema, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, dados: Partial<Sistema>) => void;
  onDelete: (id: string) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  onImport?: () => void;
}

const TIPOS_SISTEMA = [
  'Incêndio',
  'HVAC',
  'CCTV',
  'Acesso',
  'Intrusão',
  'Eletricidade',
  'Águas',
  'Outro',
];

export function SistemasPage({ 
  sistemas, 
  clientes, 
  manutencoesCount, 
  onAdd, 
  onUpdate, 
  onDelete,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  canExport = true,
  canImport = true,
  onImport,
}: SistemasPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCliente, setFiltroCliente] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [editingSistema, setEditingSistema] = useState<Sistema | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    clienteId: '',
    nome: '',
    tipo: '',
    localizacao: '',
    descricao: '',
  });

  const clientesMap = useMemo(() => {
    const map: Record<string, Cliente> = {};
    clientes.forEach((c) => (map[c.id] = c));
    return map;
  }, [clientes]);

  const filteredSistemas = sistemas.filter((s) => {
    const matchSearch =
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCliente = !filtroCliente || s.clienteId === filtroCliente;
    const matchTipo = !filtroTipo || s.tipo === filtroTipo;
    return matchSearch && matchCliente && matchTipo;
  });

  const handleAdd = () => {
    onAdd(formData);
    setFormData({ clienteId: '', nome: '', tipo: '', localizacao: '', descricao: '' });
    setIsAddDialogOpen(false);
  };

  const handleEdit = () => {
    if (editingSistema) {
      onUpdate(editingSistema.id, formData);
      setEditingSistema(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = () => {
    if (editingSistema) {
      onDelete(editingSistema.id);
      setEditingSistema(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (sistema: Sistema) => {
    setEditingSistema(sistema);
    setFormData({
      clienteId: sistema.clienteId,
      nome: sistema.nome,
      tipo: sistema.tipo,
      localizacao: sistema.localizacao,
      descricao: sistema.descricao,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (sistema: Sistema) => {
    setEditingSistema(sistema);
    setIsDeleteDialogOpen(true);
  };

  const SistemaForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cliente">Cliente *</Label>
        <Select
          value={formData.clienteId}
          onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecionar cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Sistema *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Ex: Sistema de Incêndio - Bloco A"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de Sistema *</Label>
        <Select
          value={formData.tipo}
          onValueChange={(value) => setFormData({ ...formData, tipo: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_SISTEMA.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="localizacao">Localização</Label>
        <Input
          id="localizacao"
          value={formData.localizacao}
          onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
          placeholder="Ex: Piso -1, Sala de Máquinas"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Descrição do sistema"
        />
      </div>
    </div>
  );

  const getTipoBadgeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'Incêndio': 'bg-red-100 text-red-800 border-red-300',
      'HVAC': 'bg-blue-100 text-blue-800 border-blue-300',
      'CCTV': 'bg-purple-100 text-purple-800 border-purple-300',
      'Acesso': 'bg-green-100 text-green-800 border-green-300',
      'Intrusão': 'bg-amber-100 text-amber-800 border-amber-300',
      'Eletricidade': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Águas': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'Outro': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[tipo] || colors['Outro'];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Sistemas</h2>
          <p className="text-muted-foreground">Gerir sistemas e equipamentos dos clientes</p>
        </div>
        <div className="flex items-center gap-2">
          {canImport && onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          )}
          {canExport && (
            <Button variant="outline" onClick={() => exportSistemasToExcel(sistemas, clientes)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          )}
          {canCreate && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Sistema
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Sistema</DialogTitle>
                </DialogHeader>
                <SistemaForm />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button
                    onClick={handleAdd}
                    disabled={!formData.nome.trim() || !formData.clienteId || !formData.tipo}
                  >
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar sistemas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os clientes</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {TIPOS_SISTEMA.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredSistemas.length} sistemas</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sistema</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Manutenções</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSistemas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum sistema encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSistemas.map((sistema) => (
                    <TableRow key={sistema.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{sistema.nome}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{sistema.localizacao || 'Sem localização'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">
                            {clientesMap[sistema.clienteId]?.nome || 'Desconhecido'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTipoBadgeColor(sistema.tipo)}>
                          {sistema.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          {manutencoesCount[sistema.id] || 0} manutenções
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(sistema)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(sistema)}
                            >
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
            <DialogTitle>Editar Sistema</DialogTitle>
          </DialogHeader>
          <SistemaForm />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={!formData.nome.trim() || !formData.clienteId || !formData.tipo}>
              Guardar Alterações
            </Button>
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
            Tem certeza que deseja eliminar o sistema <strong>{editingSistema?.nome}</strong>?
            <br />
            <span className="text-destructive text-sm">
              Esta ação também eliminará todas as manutenções associadas.
            </span>
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
