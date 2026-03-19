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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Plus,
  Search,
  Wrench,
  Calendar as CalendarIcon,
  Clock,
  User,
  Settings,
  Building2,
  CheckCircle2,
  Play,
  XCircle,
  Trash2,
  Edit,
  Filter,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import type { Manutencao, Cliente, Sistema, Tecnico, StatusManutencao, TipoManutencao } from '@/types';
import type { User as AuthUser } from '@/types/auth';
import { exportManutencoesToExcel, exportManutencoesToICS } from '@/lib/exportUtils';

interface ManutencoesPageProps {
  manutencoes: Manutencao[];
  clientes: Cliente[];
  sistemas: Sistema[];
  tecnicos: Tecnico[];
  onAdd: (manutencao: Omit<Manutencao, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, dados: Partial<Manutencao>) => void;
  onDelete: (id: string) => void;
  onAtribuirTecnico: (manutencaoId: string, tecnicoId: string | null) => void;
  onAlterarStatus: (manutencaoId: string, status: StatusManutencao) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  onImport?: () => void;
  currentUser?: AuthUser | null;
}

export function ManutencoesPage({
  manutencoes,
  clientes,
  sistemas,
  tecnicos,
  onAdd,
  onUpdate,
  onDelete,
  onAtribuirTecnico,
  onAlterarStatus,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  canExport = true,
  canImport = true,
  onImport,
  currentUser: _currentUser,
}: ManutencoesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroCliente, setFiltroCliente] = useState<string>('');
  const [filtroTecnico, setFiltroTecnico] = useState<string>('');
  const [editingManutencao, setEditingManutencao] = useState<Manutencao | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAtribuirDialogOpen, setIsAtribuirDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    clienteId: '',
    sistemaId: '',
    titulo: '',
    descricao: '',
    tipo: 'preventiva' as TipoManutencao,
    dataPrevista: new Date(),
    duracaoEstimada: 120,
    observacoes: '',
  });

  const clientesMap = useMemo(() => {
    const map: Record<string, Cliente> = {};
    clientes.forEach((c) => (map[c.id] = c));
    return map;
  }, [clientes]);

  const sistemasMap = useMemo(() => {
    const map: Record<string, Sistema> = {};
    sistemas.forEach((s) => (map[s.id] = s));
    return map;
  }, [sistemas]);

  const tecnicosMap = useMemo(() => {
    const map: Record<string, Tecnico> = {};
    tecnicos.forEach((t) => (map[t.id] = t));
    return map;
  }, [tecnicos]);

  const sistemasFiltrados = useMemo(() => {
    if (!formData.clienteId) return [];
    return sistemas.filter((s) => s.clienteId === formData.clienteId);
  }, [sistemas, formData.clienteId]);

  const filteredManutencoes = manutencoes.filter((m) => {
    const matchSearch =
      m.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filtroStatus || m.status === filtroStatus;
    const matchCliente = !filtroCliente || m.clienteId === filtroCliente;
    const matchTecnico = !filtroTecnico || m.tecnicoId === filtroTecnico;
    return matchSearch && matchStatus && matchCliente && matchTecnico;
  });

  const handleAdd = () => {
    onAdd({
      ...formData,
      tecnicoId: null,
      status: 'pendente',
      dataRealizacao: null,
    });
    setFormData({
      clienteId: '',
      sistemaId: '',
      titulo: '',
      descricao: '',
      tipo: 'preventiva',
      dataPrevista: new Date(),
      duracaoEstimada: 120,
      observacoes: '',
    });
    setIsAddDialogOpen(false);
  };

  const handleEdit = () => {
    if (editingManutencao) {
      onUpdate(editingManutencao.id, formData);
      setEditingManutencao(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = () => {
    if (editingManutencao) {
      onDelete(editingManutencao.id);
      setEditingManutencao(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (manutencao: Manutencao) => {
    setEditingManutencao(manutencao);
    setFormData({
      clienteId: manutencao.clienteId,
      sistemaId: manutencao.sistemaId,
      titulo: manutencao.titulo,
      descricao: manutencao.descricao,
      tipo: manutencao.tipo,
      dataPrevista: new Date(manutencao.dataPrevista),
      duracaoEstimada: manutencao.duracaoEstimada,
      observacoes: manutencao.observacoes,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (manutencao: Manutencao) => {
    setEditingManutencao(manutencao);
    setIsDeleteDialogOpen(true);
  };

  const openAtribuirDialog = (manutencao: Manutencao) => {
    setEditingManutencao(manutencao);
    setIsAtribuirDialogOpen(true);
  };

  const getStatusBadge = (status: StatusManutencao) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Pendente</Badge>;
      case 'em_curso':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Em Curso</Badge>;
      case 'concluida':
        return <Badge variant="outline" className="text-green-600 border-green-600">Concluída</Badge>;
      case 'cancelada':
        return <Badge variant="outline" className="text-red-600 border-red-600">Cancelada</Badge>;
    }
  };

  const ManutencaoForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cliente">Cliente *</Label>
        <Select
          value={formData.clienteId}
          onValueChange={(value) => setFormData({ ...formData, clienteId: value, sistemaId: '' })}
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
        <Label htmlFor="sistema">Sistema *</Label>
        <Select
          value={formData.sistemaId}
          onValueChange={(value) => setFormData({ ...formData, sistemaId: value })}
          disabled={!formData.clienteId}
        >
          <SelectTrigger>
            <SelectValue placeholder={formData.clienteId ? "Selecionar sistema" : "Selecione um cliente primeiro"} />
          </SelectTrigger>
          <SelectContent>
            {sistemasFiltrados.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          placeholder="Ex: Manutenção Trimestral"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Descrição dos trabalhos a realizar"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value: TipoManutencao) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventiva">Preventiva</SelectItem>
              <SelectItem value="corretiva">Corretiva</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duracao">Duração Estimada (min)</Label>
          <Input
            id="duracao"
            type="number"
            value={formData.duracaoEstimada}
            onChange={(e) => setFormData({ ...formData, duracaoEstimada: parseInt(e.target.value) || 0 })}
            min={15}
            step={15}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Data Prevista *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(formData.dataPrevista, 'PPP', { locale: pt })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.dataPrevista}
              onSelect={(date) => date && setFormData({ ...formData, dataPrevista: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Manutenções</h2>
          <p className="text-muted-foreground">Gerir planeamento e atribuição de manutenções</p>
        </div>
        <div className="flex items-center gap-2">
          {canImport && onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          )}
          {canExport && (
            <>
              <Button variant="outline" onClick={() => exportManutencoesToExcel(manutencoes, clientes, sistemas, tecnicos)}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button variant="outline" onClick={() => exportManutencoesToICS(manutencoes.map(m => ({
                ...m,
                cliente: clientes.find(c => c.id === m.clienteId)!,
                sistema: sistemas.find(s => s.id === m.sistemaId)!,
                tecnico: tecnicos.find(t => t.id === m.tecnicoId) || null,
              })))}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Exportar Calendário
              </Button>
            </>
          )}
          {canCreate && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Manutenção
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Manutenção</DialogTitle>
                </DialogHeader>
                <ManutencaoForm />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button
                    onClick={handleAdd}
                    disabled={!formData.titulo.trim() || !formData.clienteId || !formData.sistemaId}
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
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar manutenções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_curso">Em Curso</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroTecnico} onValueChange={setFiltroTecnico}>
              <SelectTrigger className="w-[180px]">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="null">Não atribuído</SelectItem>
                {tecnicos.filter(t => t.ativo).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredManutencoes.length} manutenções</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manutenção</TableHead>
                  <TableHead>Cliente / Sistema</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManutencoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma manutenção encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredManutencoes.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{m.titulo}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {m.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {m.duracaoEstimada} min
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">
                              {clientesMap[m.clienteId]?.nome || 'Desconhecido'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Settings className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">
                              {sistemasMap[m.sistemaId]?.nome || 'Desconhecido'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(m.dataPrevista), 'dd/MM/yyyy', { locale: pt })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {m.tecnicoId ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: tecnicosMap[m.tecnicoId]?.cor || '#ccc' }}
                            />
                            <span className="text-sm">{tecnicosMap[m.tecnicoId]?.nome}</span>
                          </div>
                        ) : canEdit ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAtribuirDialog(m)}
                          >
                            <User className="h-3 w-3 mr-1" />
                            Atribuir
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Não atribuído</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(m.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && m.status === 'pendente' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAlterarStatus(m.id, 'em_curso')}
                              title="Iniciar"
                            >
                              <Play className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          {canEdit && m.status === 'em_curso' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAlterarStatus(m.id, 'concluida')}
                              title="Concluir"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {canEdit && (m.status === 'pendente' || m.status === 'em_curso') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAlterarStatus(m.id, 'cancelada')}
                              title="Cancelar"
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(m)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(m)}
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Manutenção</DialogTitle>
          </DialogHeader>
          <ManutencaoForm />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={!formData.titulo.trim() || !formData.clienteId || !formData.sistemaId}>
              Guardar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Atribuição */}
      <Dialog open={isAtribuirDialogOpen} onOpenChange={setIsAtribuirDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Atribuir Técnico</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {tecnicos.filter(t => t.ativo).map((t) => (
              <Button
                key={t.id}
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  if (editingManutencao) {
                    onAtribuirTecnico(editingManutencao.id, t.id);
                    setIsAtribuirDialogOpen(false);
                    setEditingManutencao(null);
                  }
                }}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: t.cor }}
                />
                <div className="text-left">
                  <p className="font-medium">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.especialidade}</p>
                </div>
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                if (editingManutencao) {
                  onAtribuirTecnico(editingManutencao.id, null);
                  setIsAtribuirDialogOpen(false);
                  setEditingManutencao(null);
                }
              }}
            >
              Remover atribuição
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Eliminação */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Tem certeza que deseja eliminar a manutenção <strong>{editingManutencao?.titulo}</strong>?
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
