import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Team = {
  id_time: number;
  nome_time: string;
  nome_responsavel: string;
  players: number;
};

const MOCK_TEAMS: Team[] = [
  { id_time: 1, nome_time: "Palmeiras FC", nome_responsavel: "Abel Ferreira", players: 23 },
  { id_time: 2, nome_time: "Flamengo RJ", nome_responsavel: "Tite", players: 25 },
  { id_time: 3, nome_time: "São Paulo FC", nome_responsavel: "Dorival Júnior", players: 22 },
];

async function fetchTeams(): Promise<Team[]> {
  const token = sessionStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch("http://localhost:5000/times", { headers });
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export const TeamsList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery<Team[], Error>({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id_time: number) => {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`http://localhost:5000/times/${id_time}`, {
        method: 'DELETE',
        headers,
      });
      let errorMsg = 'Falha ao excluir time';
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
      toast({ title: 'Time excluído', description: 'O time foi removido com sucesso.' });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao excluir', description: error?.message || 'Erro desconhecido.' });
    },
  });

  const teams = data ?? (isError ? MOCK_TEAMS : []);

  if (isLoading) {
    return <div>Carregando times...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card key={team.id_time} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {team.nome_time}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium">Técnico:</span> {team.nome_responsavel}
              </p>
              {/* <p className="text-muted-foreground">
                <span className="font-medium">Jogadores:</span> {team.players}
              </p> */}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => deleteMutation.mutate(team.id_time)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
