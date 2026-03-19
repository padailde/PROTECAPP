import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  Settings,
  Users,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import type { ManutencaoComDetalhes } from '@/types';

interface DashboardProps {
  clientes: { id: string; nome: string }[];
  sistemas: { id: string; nome: string; clienteId: string }[];
  tecnicos: { id: string; nome: string; ativo: boolean }[];
  manutencoes: ManutencaoComDetalhes[];
  onNavigate: (page: string) => void;
}

export function Dashboard({ clientes, sistemas, tecnicos, manutencoes, onNavigate }: DashboardProps) {
  const stats = useMemo(() => {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    
    return {
      totalClientes: clientes.length,
      totalSistemas: sistemas.length,
      totalTecnicos: tecnicos.filter((t) => t.ativo).length,
      pendentes: manutencoes.filter((m) => m.status === 'pendente').length,
      emCurso: manutencoes.filter((m) => m.status === 'em_curso').length,
      concluidas: manutencoes.filter((m) => m.status === 'concluida').length,
      atrasadas: manutencoes.filter(
        (m) => m.status === 'pendente' && new Date(m.dataPrevista) < hoje
      ).length,
      hoje: manutencoes.filter(
        (m) => new Date(m.dataPrevista).toISOString().split('T')[0] === hojeStr
      ).length,
    };
  }, [clientes, sistemas, tecnicos, manutencoes]);

  const manutencoesRecentes = useMemo(() => {
    return [...manutencoes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [manutencoes]);

  const manutencoesHoje = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    return manutencoes.filter(
      (m) => new Date(m.dataPrevista).toISOString().split('T')[0] === hoje
    );
  }, [manutencoes]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Pendente</Badge>;
      case 'em_curso':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Em Curso</Badge>;
      case 'concluida':
        return <Badge variant="outline" className="text-green-600 border-green-600">Concluída</Badge>;
      case 'cancelada':
        return <Badge variant="outline" className="text-red-600 border-red-600">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('clientes')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground mt-1">Clique para gerir</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('sistemas')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Sistemas</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSistemas}</div>
            <p className="text-xs text-muted-foreground mt-1">Clique para gerir</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('tecnicos')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Técnicos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTecnicos}</div>
            <p className="text-xs text-muted-foreground mt-1">Clique para gerir</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('calendario')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manutenções Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoje}</div>
            <p className="text-xs text-muted-foreground mt-1">Clique para ver calendário</p>
          </CardContent>
        </Card>
      </div>

      {/* Status das Manutenções */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold">{stats.pendentes}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Curso</p>
                <p className="text-3xl font-bold">{stats.emCurso}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-3xl font-bold">{stats.concluidas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasadas</p>
                <p className="text-3xl font-bold">{stats.atrasadas}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manutenções de Hoje e Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Manutenções para Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              {manutencoesHoje.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma manutenção agendada para hoje
                </p>
              ) : (
                <div className="space-y-3">
                  {manutencoesHoje.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{m.titulo}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {m.cliente.nome} - {m.sistema.nome}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {m.tecnico && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: m.tecnico.cor }}
                            title={m.tecnico.nome}
                          />
                        )}
                        {getStatusBadge(m.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Manutenções Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('manutencoes')}>
              Ver todas
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              {manutencoesRecentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma manutenção registada
                </p>
              ) : (
                <div className="space-y-3">
                  {manutencoesRecentes.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{m.titulo}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {m.cliente.nome} - {new Date(m.dataPrevista).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {m.tecnico && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: m.tecnico.cor }}
                            title={m.tecnico.nome}
                          />
                        )}
                        {getStatusBadge(m.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
