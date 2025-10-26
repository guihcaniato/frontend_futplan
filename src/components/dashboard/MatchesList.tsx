import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Pencil, Trash2 } from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Match = {
  id_partida: number;
  nome_local: string;
  nome_responsavel: string;
  time_casa: string;
  time_visitante: string;
  dthr_ini: Date;
};

type ApiMatch = Omit<Match, 'data_partida'> & {
  // String no formato ISO 8601, ex: "2025-11-15T20:00:00.000Z"
  data_partida: string; 
};

const MOCK_TEAMS: Match[] = [
    {
      id_partida: 1,
      time_casa: "Palmeiras FC",
      time_visitante: "Flamengo RJ",
      dthr_ini: new Date("2025-11-15"),
      nome_local: "Allianz Parque",
      nome_responsavel: "agendada",
    },
    {
      id_partida: 2,
      time_casa: "Palmeiras FC",
      time_visitante: "Flamengo RJ",
      dthr_ini: new Date("2025-11-15"),
      nome_local: "Allianz Parque",
      nome_responsavel: "agendada",
    },
  ];

async function fetchMatches(): Promise<Match[]> {
  const token = sessionStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch("http://localhost:5000/partidas", { headers });
  if (!res.ok) throw new Error("Failed to fetch matches");

  // 1. Recebe os dados da API com a data como string
  const dataFromApi: ApiMatch[] = await res.json();

  // 2. Transforma os dados para o formato que a aplicação espera
  const transformedData: Match[] = dataFromApi.map(match => ({
    ...match,
    dthr_ini: new Date(match.dthr_ini), // Converte a string para Date
  }));

  // 3. Retorna os dados já transformados
  return transformedData;
}

export const MatchesList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery<Match[], Error>({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "default";
      case "em andamento":
        return "secondary";
      case "finalizada":
        return "outline";
      default:
        return "default";
    }
  };
  const deleteMutation = useMutation({
    mutationFn: async (id_partida: number) => {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`http://localhost:5000/partidas/${id_partida}`, {
        method: 'DELETE',
        headers,
      });
      let errorMsg = 'Falha ao excluir partida';
      if (!res.ok) {
        try {
          const errJson = await res.json();
          errorMsg = errJson?.message || errJson?.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Partida excluída', description: 'A partida foi removida com sucesso.' });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao excluir', description: error?.message || 'Erro desconhecido.' });
    },
  });

    const matches = data ?? (isError ? MOCK_TEAMS : []);

  if (isLoading) {
    return <div>Carregando times...</div>;
  }


  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id_partida} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">
                {match.time_casa} vs {match.time_visitante}
              </CardTitle>
              <Badge variant={getStatusColor(match.nome_responsavel)}>
                {match.nome_responsavel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(match.dthr_ini).toLocaleDateString("pt-BR")} às {match.dthr_ini.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo' // Boa prática para garantir o fuso correto
      })}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {match.nome_local}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(match.id_partida)}
                disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
