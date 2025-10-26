import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TeamFormProps {
  onClose: () => void;
}

const coaches = [
  { value: "abel-ferreira", label: "Abel Ferreira" },
  { value: "tite", label: "Tite" },
  { value: "dorival-junior", label: "Dorival Júnior" },
  { value: "fernando-diniz", label: "Fernando Diniz" },
  { value: "renato-gaucho", label: "Renato Gaúcho" },
];

export const TeamForm = ({ onClose }: TeamFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nome_time: "",
    nome_responsavel: "", // O campo de técnico está comentado, mas vamos manter o estado
    cor_uniforme: "#10b981",
  });
  const [isLoading, setIsLoading] = useState(false);
  // const [openCoach, setOpenCoach] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // O backend espera 'nome_time' e 'nome_responsavel'.
    const payload = {
      nome_time: formData.nome_time,
      nome_responsavel: formData.nome_responsavel || "Não definido", // Garante um valor
      cor_uniforme: formData.cor_uniforme,
    };

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch("/times", {
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
        title: "Time cadastrado!",
        description: `${formData.nome_time} foi adicionado com sucesso.`,
      });

      // Invalida a query de 'teams' para forçar a atualização da lista de times
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      onClose(); // Fecha o formulário
    } catch (error) {
      toast({
        title: "Erro ao cadastrar time",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Label htmlFor="team-name">Nome do Time</Label>
          <Input
            id="team-name"
            placeholder="Ex: Palmeiras FC"
            value={formData.nome_time}
            onChange={(e) => setFormData({ ...formData, nome_time: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        {/* <div className="space-y-2">
          <Label>Técnico</Label>
          <Popover open={openCoach} onOpenChange={setOpenCoach}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCoach}
                className="w-full justify-between"
              >
                {formData.coach
                  ? coaches.find((coach) => coach.value === formData.coach)?.label
                  : "Selecione o técnico..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar técnico..." />
                <CommandList>
                  <CommandEmpty>Nenhum técnico encontrado.</CommandEmpty>
                  <CommandGroup>
                    {coaches.map((coach) => (
                      <CommandItem
                        key={coach.value}
                        value={coach.value}
                        onSelect={(currentValue) => {
                          setFormData({ ...formData, coach: currentValue });
                          setOpenCoach(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.coach === coach.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {coach.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div> */}
      </div>
      <div className="space-y-2">
        <Label htmlFor="team-color">Cor do Time</Label>
        <div className="flex gap-2 items-center">
          <Input
            id="team-color"
            type="color"
            value={formData.cor_uniforme}
            onChange={(e) => setFormData({ ...formData, cor_uniforme: e.target.value })}
            className="w-20 h-10 cursor-pointer"
            disabled={isLoading}
            required
          />
          <Input
            type="text"
            value={formData.cor_uniforme}
            onChange={(e) => setFormData({ ...formData, cor_uniforme: e.target.value })}
            placeholder="#10b981"
            className="flex-1"
            disabled={isLoading}
            pattern="^#[0-9A-Fa-f]{6}$"
            required
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Time"}
        </Button>
      </div>
    </form>
  );
};
