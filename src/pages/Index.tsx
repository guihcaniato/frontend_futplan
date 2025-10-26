import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import soccerHero from "@/assets/soccer-hero.jpg";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [signupData, setSignupData] = useState({
    nome: "",
    email: "",
    genero: "",
    data_nascimento: "",
    celular: "",
    senha: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    // Adicionando estado de carregamento para desabilitar o botão durante a submissão
    const submitButton = (e.target as HTMLFormElement).querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      if (type === 'login') {
        const form = e.target as HTMLFormElement;
        const email = (form.querySelector('#login-email') as HTMLInputElement).value;
        const senha = (form.querySelector('#login-password') as HTMLInputElement).value;

        // Usando o proxy do Vite, assim como nos outros componentes
        const res = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha }),
        });

        if (!res.ok) throw new Error('Erro no login');
        const body = await res.json();
        const token = body.access_token;
        if (!token) throw new Error('Token não retornado');

        sessionStorage.setItem('token', token);
        toast({ title: 'Login realizado!', description: 'Redirecionando para o dashboard...' });
        setTimeout(() => (window.location.href = '/dashboard'), 800);
      } else {
        // signup
        // Usando o proxy do Vite e o endpoint correto /usuarios
        const res = await fetch('/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Enviando os dados do estado, com os nomes de campo corretos para o backend
          body: JSON.stringify(signupData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erro no cadastro');
        }

        toast({ title: 'Cadastro realizado!', description: 'Você pode fazer login agora.' });
        // Muda para a aba de login após o sucesso
        setIsLogin(true);
        document.querySelector<HTMLButtonElement>('button[data-state="inactive"][role="tab"]')?.click();
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.message ?? 'Erro desconhecido';
      toast({ title: 'Erro', description: msg });
    }
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={soccerHero} 
          alt="Campo de futebol" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-4">Bem-vindo ao FutPlan!</h1>
          <p className="text-xl opacity-90">
            Sistema completo para organização e acompanhamento de jogos de futebol
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-center">
              Entre com sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setIsLogin(v === 'login')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Entrar
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <Input 
                      id="signup-name"
                      name="nome"
                      type="text" 
                      placeholder="Seu nome" 
                      value={signupData.nome}
                      onChange={handleSignupChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email"
                      name="email"
                      type="email" 
                      placeholder="seu@email.com" 
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-gender">Gênero</Label>
                    <Select 
                      required 
                      name="genero"
                      value={signupData.genero}
                      onValueChange={(value) => setSignupData({ ...signupData, genero: value })}
                    >
                      <SelectTrigger id="signup-gender">
                        <SelectValue placeholder="Selecione seu gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-birthdate">Data de nascimento</Label>
                    <Input 
                      id="signup-birthdate"
                      name="data_nascimento"
                      type="date" 
                      value={signupData.data_nascimento}
                      onChange={handleSignupChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Número de celular</Label>
                    <Input 
                      id="signup-phone"
                      name="celular"
                      type="tel" 
                      placeholder="(00) 00000-0000" 
                      value={signupData.celular}
                      onChange={handleSignupChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input 
                      id="signup-password"
                      name="senha"
                      type="password" 
                      placeholder="••••••••" 
                      value={signupData.senha}
                      onChange={handleSignupChange}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Criar conta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
