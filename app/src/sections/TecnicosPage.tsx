import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Search, Phone, Mail, Wrench, Trash2, Edit, Palette, FileSpreadsheet, Upload } from 'lucide-react';
import type { Tecnico } from '@/types';
import { exportTecnicosToExcel } from '@/lib/exportUtils';

interface TecnicosPageProps {
  tecnicos: Tecnico[];
  manutencoesCount: Record<string, number>;
  onAdd: (tecnico: Omit<Tecnico, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, dados: Partial<Tecnico>) => void;
  onDelete: (id: string) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  onImport?: () => void;
}

const CORES_PRESET = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6366f1', // indigo
];

const ESPECIALIDADES = [
  'Incêndio',
  'HVAC',
  'CCTV',
  'Acesso',
  'Intrusão',
  'Eletricidade',
  'Águas',
  'Multiuso',
  'Outro',
];

export function TecnicosPage({ 
  tecnicos, 
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
}: TecnicosPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    contacto: '',
    especialidade: '',
    cor: '#3b82f6',
    ativo: true,
  });

  const filteredTecnicos = tecnicos.filter(
    (t) =>
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.contacto.includes(searchTerm)
  );

  const handleAdd = () => {
    onAdd(formData);
    setFormData({ nome: '', email: '', contacto: '', especialidade: '', cor: '#3b82f6', ativo: true });
    setIsAddDialogOpen(false);
  };

  const handleEdit = () => {
    if (editingTecnico) {
      onUpdate(editingTecnico.id, formData);
      setEditingTecnico(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = () => {
    if (editingTecnico) {
      onDelete(editingTecnico.id);
      setEditingTecnico(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (tecnico: Tecnico) => {
    setEditingTecnico(tecnico);
    setFormData({
      nome: tecnico.nome,
      email: tecnico.email,
      contacto: tecnico.contacto,
      especialidade: tecnico.especialidade,
      cor: tecnico.cor,
      ativo: tecnico.ativo,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (tecnico: Tecnico) => {
    setEditingTecnico(tecnico);
    setIsDeleteDialogOpen(true);
  };

  const TecnicoForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Nome do técnico"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contacto">Contacto</Label>
          <Input
            id="contacto"
            value={formData.contacto}
            onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
            placeholder="Telefone"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.pt"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="especialidade">Especialidade</Label>
        <select
          id="especialidade"
          value={formData.especialidade}
          onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">Selecionar especialidade</option>
          {ESPECIALIDADES.map((esp) => (
            <option key={esp} value={esp}>
              {esp}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Cor de Identificação</Label>
        <div className="flex flex-wrap gap-2">
          {CORES_PRESET.map((cor) => (
            <button
              key={cor}
              type="button"
              onClick={() => setFormData({ ...formData, cor })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.cor === cor ? 'border-black scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: cor }}
            />
          ))}
        </div>
      </div>
      {editingTecnico && (
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="ativo">Técnico Ativo</Label>
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
          <h2 className="text-2xl font-bold">Gestão de Técnicos</h2>
          <p className="text-muted-foreground">Gerir a equipa técnica e suas atribuições</p>
        </div>
        <div className="flex items-center gap-2">
          {canImport && onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          )}
          {canExport && (
            <Button variant="outline" onClick={() => exportTecnicosToExcel(tecnicos)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          )}
          {canCreate && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Técnico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Técnico</DialogTitle>
                </DialogHeader>
                <TecnicoForm />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleAdd} disabled={!formData.nome.trim()}>
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
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar técnicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filteredTecnicos.filter(t => t.ativo).length} ativos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Manutenções</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTecnicos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum técnico encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTecnicos.map((tecnico) => (
                    <TableRow key={tecnico.id} className={!tecnico.ativo ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: tecnico.cor }}
                          >
                            {tecnico.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{tecnico.nome}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {tecnico.contacto || '-'}
                              </span>
                              {tecnico.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {tecnico.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span>{tecnico.especialidade || 'Não definida'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Wrench className="h-3 w-3 mr-1" />
                          {manutencoesCount[tecnico.id] || 0} atribuídas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tecnico.ativo ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 border-gray-500">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(tecnico)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(tecnico)}
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
            <DialogTitle>Editar Técnico</DialogTitle>
          </DialogHeader>
          <TecnicoForm />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={!formData.nome.trim()}>
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
            Tem certeza que deseja eliminar o técnico <strong>{editingTecnico?.nome}</strong>?
            <br />
            <span className="text-destructive text-sm">
              As manutenções atribuídas a este técnico ficarão sem atribuição.
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
