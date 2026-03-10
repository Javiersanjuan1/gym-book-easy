import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIERS, TierKey } from "@/lib/subscription-tiers";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Check, LogOut, Calendar, Zap } from "lucide-react";

export default function Pricing() {
  const { user, subscribed, tier, signOut } = useAuth();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<TierKey | null>(null);

  const handleCheckout = async (tierKey: TierKey) => {
    if (!user) {
      toast({ title: "Inicia sesión primero", variant: "destructive" });
      return;
    }
    setLoadingTier(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: TIERS[tierKey].price_id },
      });
      if (error) throw error;
      window.open(data.url, "_blank");
    } catch {
      toast({ title: "Error al crear la sesión de pago", variant: "destructive" });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gym flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg"><span className="text-gradient-gym">POWER</span>GYM</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
                <Link to="/classes"><Button variant="ghost" size="sm"><Calendar className="w-4 h-4 mr-2" />Clases</Button></Link>
                <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
              </>
            ) : (
              <Link to="/auth"><Button variant="outline" size="sm">Iniciar Sesión</Button></Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Elige tu <span className="text-gradient-gym">Plan</span></h1>
          <p className="text-muted-foreground text-lg">Pago mensual automático. Cancela cuando quieras.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(([key, t]) => {
            const isActive = subscribed && tier === key;
            const isPremium = key === "premium";

            return (
              <Card key={key} className={`bg-card border-border relative overflow-hidden ${isActive ? "ring-2 ring-primary" : ""}`}>
                {isPremium && <div className="h-1.5 gradient-premium" />}
                {!isPremium && <div className="h-1.5 gradient-gym" />}
                {isActive && (
                  <Badge className="absolute top-4 right-4 gradient-gym border-0">Tu Plan</Badge>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    {isPremium && <Zap className="w-5 h-5 text-gym-premium" />}
                    {t.name}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">${t.price}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-gym-success mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${isActive ? "" : isPremium ? "gradient-premium border-0" : "gradient-gym border-0"}`}
                    variant={isActive ? "outline" : "default"}
                    disabled={isActive || loadingTier === key}
                    onClick={() => handleCheckout(key)}
                  >
                    {isActive ? "Plan Activo" : loadingTier === key ? "Redirigiendo..." : "Suscribirse"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
