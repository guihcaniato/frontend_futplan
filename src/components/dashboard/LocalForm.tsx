import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface LocalFormProps {
  onClose: () => void;
}

export const LocalForm = ({ onClose }: LocalFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    capacidade: "",
    disponivel_para_agendamento: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      nome: formData.nome,
      capacidade: Number(formData.capacidade),
      disponivel_para_agendamento: formData.disponivel_para_agendamento,
    };

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch("http://localhost:5000/locais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      toast({
        title: "Local cadastrado!",
        description: `O local "${formData.nome}" foi adicionado com sucesso.`,
      });

      // Invalida a query de 'locais' para forçar a atualização da lista
      await queryClient.invalidateQueries({ queryKey: ["locais"] });
      onClose();

    } catch (error) {
      toast({
        title: "Erro ao cadastrar local",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="local-name">Nome do Local</Label>
        <Input
          id="local-name"
          placeholder="Ex: Maracanã"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="local-capacity">Capacidade</Label>
        <Input
          id="local-capacity"
          type="number"
          placeholder="Ex: 78000"
          value={formData.capacidade}
          onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="local-available"
          checked={formData.disponivel_para_agendamento}
          onCheckedChange={(checked) =>
            setFormData({
              ...formData,
              disponivel_para_agendamento: Boolean(checked),
            })
          }
          disabled={isLoading}
        />
        <Label htmlFor="local-available">Disponível para agendamento</Label>
      </div>

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
          {isLoading ? "Salvando..." : "Salvar Local"}
        </Button>
      </div>
    </form>
  );
};