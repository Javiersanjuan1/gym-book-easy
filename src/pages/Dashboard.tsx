import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIERS } from "@/lib/subscription-tiers";
import { Dumbbell, Calendar, CreditCard, LogOut, Crown, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Dashboard() {
  const { user, subscribed, tier, subscriptionEnd, signOut, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchReservations();
    // Check if redirected from checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      checkSubscription();
      toast({ title: "¡Pago exitoso!", description: "Tu membresía está activa." });
      navigate("/dashboard", { replace: true });
    }
  }, [user]);

  const fetchReservations = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("*, gym_classes(*)")
      .eq("status", "confirmed")
      .gte("reservation_date", new Date().toISOString().split("T")[0])
      .order("reservation_date", { ascending: true });
    setReservations(data || []);
    setLoading(false);
  };

  const cancelReservation = async (id: string) => {
    await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id);
    toast({ title: "Reserva cancelada" });
    fetchReservations();
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      window.open(data.url, "_blank");
    } catch {
      toast({ title: "Error", description: "No se pudo abrir el portal de pagos", variant: "destructive" });
    }
  };

  const currentTier = tier ? TIERS[tier] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gym flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">
              <span className="text-gradient-gym">POWER</span>GYM
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/classes">
              <Button variant="ghost" size="sm"><Calendar className="w-4 h-4 mr-2" />Clases</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm"><CreditCard className="w-4 h-4 mr-2" />Planes</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">¡Hola, {user?.user_metadata?.full_name || "Atleta"}! 💪</h1>

        {/* Subscription Status */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" /> Tu Membresía
            </CardTitle>
            {subscribed && (
              <Badge className={tier === "premium" ? "gradient-premium border-0" : "gradient-gym border-0"}>
                {currentTier?.name}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {subscribed ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Plan activo hasta {subscriptionEnd ? format(new Date(subscriptionEnd), "d 'de' MMMM, yyyy", { locale: es }) : "—"}
                </p>
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  Gestionar suscripción
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">No tienes una membresía activa.</p>
                <Link to="/pricing">
                  <Button className="gradient-gym border-0">Ver Planes</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reservations */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Próximas Reservas
            </CardTitle>
            <Link to="/classes">
              <Button variant="outline" size="sm">Reservar clase</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : reservations.length === 0 ? (
              <p className="text-muted-foreground">No tienes reservas próximas.</p>
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div>
                      <p className="font-medium">{r.gym_classes?.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {DAYS[r.gym_classes?.day_of_week]} — {r.gym_classes?.start_time?.slice(0, 5)} a {r.gym_classes?.end_time?.slice(0, 5)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(r.reservation_date), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => cancelReservation(r.id)}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
