import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Settings,
  Building2,
  Download,
} from 'lucide-react';
import type { ManutencaoComDetalhes } from '@/types';
import { exportManutencoesToICS } from '@/lib/exportUtils';

interface CalendarioPageProps {
  manutencoes: ManutencaoComDetalhes[];
  onSelectManutencao: (id: string) => void;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarioPage({ manutencoes, onSelectManutencao }: CalendarioPageProps) {
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  const diasNoMes = useMemo(() => {
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasAnterior = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();
    
    const dias: (number | null)[] = [];
    
    // Dias vazios do mês anterior
    for (let i = 0; i < diasAnterior; i++) {
      dias.push(null);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= totalDias; i++) {
      dias.push(i);
    }
    
    return dias;
  }, [anoAtual, mesAtual]);

  const manutencoesPorDia = useMemo(() => {
    const map: Record<number, ManutencaoComDetalhes[]> = {};
    manutencoes.forEach((m) => {
      const data = new Date(m.dataPrevista);
      if (data.getFullYear() === anoAtual && data.getMonth() === mesAtual) {
        const dia = data.getDate();
        if (!map[dia]) map[dia] = [];
        map[dia].push(m);
      }
    });
    return map;
  }, [manutencoes, anoAtual, mesAtual]);

  const manutencoesSelecionadas = useMemo(() => {
    if (diaSelecionado === null) return [];
    return manutencoesPorDia[diaSelecionado] || [];
  }, [manutencoesPorDia, diaSelecionado]);

  const navegarMes = (direcao: number) => {
    let novoMes = mesAtual + direcao;
    let novoAno = anoAtual;
    
    if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    }
    
    setMesAtual(novoMes);
    setAnoAtual(novoAno);
    setDiaSelecionado(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-amber-500';
      case 'em_curso': return 'bg-blue-500';
      case 'concluida': return 'bg-green-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const hoje = new Date();
  const isHoje = (dia: number) => 
    hoje.getDate() === dia && 
    hoje.getMonth() === mesAtual && 
    hoje.getFullYear() === anoAtual;

  // Manutenções do mês atual visível
  const manutencoesMesAtual = useMemo(() => {
    return manutencoes.filter((m) => {
      const data = new Date(m.dataPrevista);
      return data.getFullYear() === anoAtual && data.getMonth() === mesAtual;
    });
  }, [manutencoes, anoAtual, mesAtual]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendário de Manutenções</h2>
          <p className="text-muted-foreground">Visualizar planeamento anual das manutenções</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportManutencoesToICS(manutencoesMesAtual, `Manutencoes_${MESES[mesAtual]}_${anoAtual}`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Mês (ICS)
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navegarMes(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <span className="text-lg font-semibold">{MESES[mesAtual]}</span>
              <span className="text-lg text-muted-foreground ml-2">{anoAtual}</span>
            </div>
            <Button variant="outline" size="icon" onClick={() => navegarMes(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setMesAtual(hoje.getMonth());
              setAnoAtual(hoje.getFullYear());
              setDiaSelecionado(hoje.getDate());
            }}
          >
            Hoje
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {dia}
                </div>
              ))}
            </div>
            
            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {diasNoMes.map((dia, index) => (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                    ${dia === null ? 'bg-muted/30 border-transparent cursor-default' : 'hover:border-primary'}
                    ${dia !== null && diaSelecionado === dia ? 'border-primary bg-primary/5' : ''}
                    ${dia !== null && isHoje(dia) ? 'ring-2 ring-primary ring-offset-1' : ''}
                  `}
                  onClick={() => dia !== null && setDiaSelecionado(dia)}
                >
                  {dia !== null && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isHoje(dia) ? 'text-primary' : ''}`}>
                        {dia}
                      </div>
                      {manutencoesPorDia[dia] && (
                        <div className="space-y-1">
                          {manutencoesPorDia[dia].slice(0, 3).map((m, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full ${getStatusColor(m.status)}`}
                              style={{ width: '100%' }}
                              title={m.titulo}
                            />
                          ))}
                          {manutencoesPorDia[dia].length > 3 && (
                            <div className="text-[10px] text-muted-foreground text-center">
                              +{manutencoesPorDia[dia].length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-muted-foreground">Pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">Em Curso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Concluída</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">Cancelada</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do dia selecionado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {diaSelecionado ? (
                <>
                  {diaSelecionado} de {MESES[mesAtual]} de {anoAtual}
                  {isHoje(diaSelecionado) && (
                    <Badge variant="outline" className="ml-2">Hoje</Badge>
                  )}
                </>
              ) : (
                'Selecione um dia'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {diaSelecionado === null ? (
                <p className="text-muted-foreground text-center py-8">
                  Clique num dia do calendário para ver as manutenções
                </p>
              ) : manutencoesSelecionadas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma manutenção agendada para este dia
                </p>
              ) : (
                <div className="space-y-3">
                  {manutencoesSelecionadas.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={() => onSelectManutencao(m.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{m.titulo}</h4>
                        <Badge
                          variant="outline"
                          className={
                            m.status === 'pendente' ? 'text-amber-600 border-amber-600' :
                            m.status === 'em_curso' ? 'text-blue-600 border-blue-600' :
                            m.status === 'concluida' ? 'text-green-600 border-green-600' :
                            'text-red-600 border-red-600'
                          }
                        >
                          {m.status === 'pendente' ? 'Pendente' :
                           m.status === 'em_curso' ? 'Em Curso' :
                           m.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{m.cliente.nome}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <span className="truncate">{m.sistema.nome}</span>
                        </div>
                        {m.tecnico && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{m.tecnico.nome}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{m.duracaoEstimada} min</span>
                        </div>
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
