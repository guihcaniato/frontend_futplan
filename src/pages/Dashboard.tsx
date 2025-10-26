import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Trophy, MapPin } from "lucide-react";
import { TeamForm } from "@/components/dashboard/TeamForm";
import { MatchForm } from "@/components/dashboard/MatchForm";
import { LocalForm } from "@/components/dashboard/LocalForm";
import { TeamsList } from "@/components/dashboard/TeamsList";
import { MatchesList } from "@/components/dashboard/MatchesList";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showLocalForm, setShowLocalForm] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      // no token -> redirect to login
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">FutPlan</h1>
          </div>
          <Button variant="outline" size="sm">
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Times
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Partidas
            </TabsTrigger>
            <TabsTrigger value="locals" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locais
            </TabsTrigger>
          </TabsList>

          {/* Times Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Times</CardTitle>
                    <CardDescription>
                      Cadastre e gerencie os times das suas partidas
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowTeamForm(!showTeamForm)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Time
                  </Button>
                </div>
              </CardHeader>
              {showTeamForm && (
                <CardContent className="border-t pt-6">
                  <TeamForm onClose={() => setShowTeamForm(false)} />
                </CardContent>
              )}
            </Card>

            <TeamsList />
          </TabsContent>

          {/* Partidas Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Partidas</CardTitle>
                    <CardDescription>
                      Cadastre e acompanhe as partidas dos seus times
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowMatchForm(!showMatchForm)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Partida
                  </Button>
                </div>
              </CardHeader>
              {showMatchForm && (
                <CardContent className="border-t pt-6">
                  <MatchForm onClose={() => setShowMatchForm(false)} />
                </CardContent>
              )}
            </Card>

            <MatchesList />
          </TabsContent>
                    {/* Partidas Tab */}
          <TabsContent value="locals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar locais de partida</CardTitle>
                    <CardDescription>
                      Confira e crie novos locais de partida para seus jogos.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowLocalForm(!showLocalForm)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Local
                  </Button>
                </div>
              </CardHeader>
              {showLocalForm && (
                <CardContent className="border-t pt-6">
                  <LocalForm onClose={() => setShowLocalForm(false)} />
                </CardContent>
              )}
            </Card>

            <MatchesList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
