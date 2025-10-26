import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface MatchFormProps {
  onClose: () => void;
}

// Interfaces para os dados buscados da API
interface Team {
  id_time: number;
  nome_time: string;
}

interface Local {
  id_local: number;
  nome: string;
}

export const MatchForm = ({ onClose }: MatchFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    id_time_casa: "",
    id_time_visitante: "",
    id_local: "",
    data_partida: "", // YYYY-MM-DD
    horario_ini: "",  // HH:MM
    horario_fim: "",   // HH:MM (Novo campo)
  });

  // Estados para armazenar os dados vindos da API
  const [teams, setTeams] = useState<Team[]>([]);
  const [locals, setLocals] = useState<Local[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Busca dados dos times e locais ao carregar o componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        // Assumindo que você tenha endpoints para buscar times e locais
        const [teamsRes, localsRes] = await Promise.all([
          fetch("/times", { // Crie este endpoint no backend
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/locais", { // Crie este endpoint no backend
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!teamsRes.ok || !localsRes.ok) {
          throw new Error("Falha ao buscar dados iniciais.");
        }

        const teamsData = await teamsRes.json();
        const localsData = await localsRes.json();

        setTeams(teamsData);
        setLocals(localsData);
      } catch (error) {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Não foi possível carregar os dados.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Validar se time da casa e visitante são diferentes
    if (formData.id_time_casa === formData.id_time_visitante) {
      toast({
        title: "Erro de Validação",
        description: "O time da casa e o visitante não podem ser o mesmo.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // 2. Combinar data e hora para o formato ISO esperado pelo backend
    const dthr_ini = `${formData.data_partida}T${formData.horario_ini}`;
    const dthr_fim = `${formData.data_partida}T${formData.horario_fim}`;

    // 3. Montar o payload final para a API
    const payload = {
      id_time_casa: Number(formData.id_time_casa),
      id_time_visitante: Number(formData.id_time_visitante),
      id_local: Number(formData.id_local),
      dthr_ini: dthr_ini,
      dthr_fim: dthr_fim,
    };

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch("/partidas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Se a resposta não for OK, lê a mensagem de erro da API
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      // Sucesso
      toast({
        title: "Partida cadastrada!",
        description: "A partida foi agendada com sucesso.",
      });

      // Invalida a query de 'matches' para forçar a atualização da lista
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      onClose();

    } catch (error) {
      // Exibe o erro da API (ou de rede) no toast
      toast({
        title: "Erro ao agendar partida",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* --- SELEÇÃO DE TIMES --- */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="home-team">Time da Casa</Label>
          <Select
            value={formData.id_time_casa}
            onValueChange={(value) =>
              setFormData({ ...formData, id_time_casa: value })
            }
            required
            disabled={isLoading}
          >
            <SelectTrigger id="home-team">
              <SelectValue placeholder="Selecione o time da casa" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id_time} value={String(team.id_time)}>
                  {team.nome_time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="away-team">Time Visitante</Label>
          <Select
            value={formData.id_time_visitante}
            onValueChange={(value) =>
              setFormData({ ...formData, id_time_visitante: value })
            }
            required
            disabled={isLoading}
          >
            <SelectTrigger id="away-team">
              <SelectValue placeholder="Selecione o time visitante" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id_time} value={String(team.id_time)}>
                  {team.nome_time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- SELEÇÃO DE LOCAL --- */}
      <div className="space-y-2">
        <Label htmlFor="match-location">Local</Label>
        <Select
          value={formData.id_local}
          onValueChange={(value) =>
            setFormData({ ...formData, id_local: value })
          }
          required
          disabled={isLoading}
        >
          <SelectTrigger id="match-location">
            <SelectValue placeholder="Selecione o local da partida" />
          </SelectTrigger>
          <SelectContent>
            {locals.map((local) => (
              <SelectItem key={local.id_local} value={String(local.id_local)}>
                {local.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- DATA E HORÁRIOS --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="match-date">Data</Label>
          <Input
            id="match-date"
            type="date"
            value={formData.data_partida}
            onChange={(e) =>
              setFormData({ ...formData, data_partida: e.target.value })
            }
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="match-start-time">Horário de Início</Label>
          <Input
            id="match-start-time"
            type="time"
            value={formData.horario_ini}
            onChange={(e) =>
              setFormData({ ...formData, horario_ini: e.target.value })
            }
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="match-end-time">Horário de Fim</Label>
          <Input
            id="match-end-time"
            type="time"
            value={formData.horario_fim}
            onChange={(e) =>
              setFormData({ ...formData, horario_fim: e.target.value })
            }
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* --- BOTÕES DE AÇÃO --- */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Agendando..." : "Agendar Partida"}
        </Button>
      </div>
    </form>
  );
};