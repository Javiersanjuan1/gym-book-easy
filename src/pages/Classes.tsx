import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Calendar, CreditCard, LogOut, Clock, User, Users, Lock } from "lucide-react";
import { addDays, nextDay, format } from "date-fns";
import { es } from "date-fns/locale";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Classes() {
  const { user, subscribed, tier, signOut } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [reservedIds, setReservedIds] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
    if (user) fetchMyReservations();
  }, [user]);

  const fetchClasses = async () => {
    const { data } = await supabase.from("gym_classes").select("*").order("day_of_week").order("start_time");
    setClasses(data || []);
  };

  const fetchMyReservations = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("class_id")
      .eq("status", "confirmed")
      .gte("reservation_date", new Date().toISOString().split("T")[0]);
    setReservedIds(new Set((data || []).map((r) => r.class_id)));
  };

  const getNextDate = (dayOfWeek: number) => {
    const today = new Date();
    if (today.getDay() === dayOfWeek) return today;
    return nextDay(today, dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  };

  const bookClass = async (classItem: any) => {
    if (!subscribed) {
      toast({ title: "Membresía requerida", description: "Necesitas una membresía activa para reservar.", variant: "destructive" });
      return;
    }
    if (classItem.class_type === "premium" && tier !== "premium") {
      toast({ title: "Plan Premium requerido", description: "Esta clase es exclusiva del plan Premium.", variant: "destructive" });
      return;
    }

    setBookingId(classItem.id);
    const date = format(getNextDate(classItem.day_of_week), "yyyy-MM-dd");

    const { error } = await supabase.from("reservations").insert({
      user_id: user!.id,
      class_id: classItem.id,
      reservation_date: date,
    });

    if (error) {
      toast({ title: "Error", description: error.message.includes("duplicate") ? "Ya tienes esta reserva" : error.message, variant: "destructive" });
    } else {
      toast({ title: "¡Reservado!", description: `${classItem.name} — ${DAYS[classItem.day_of_week]}` });
      fetchMyReservations();
    }
    setBookingId(null);
  };

  const filtered = selectedDay !== null ? classes.filter((c) => c.day_of_week === selectedDay) : classes;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gym flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg"><span className="text-gradient-gym">POWER</span>GYM</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
            <Link to="/pricing"><Button variant="ghost" size="sm"><CreditCard className="w-4 h-4 mr-2" />Planes</Button></Link>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Clases Disponibles</h1>

        {/* Day filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button variant={selectedDay === null ? "default" : "outline"} size="sm" onClick={() => setSelectedDay(null)} className={selectedDay === null ? "gradient-gym border-0" : ""}>
            Todas
          </Button>
          {DAYS.map((day, i) => (
            <Button key={i} variant={selectedDay === i ? "default" : "outline"} size="sm" onClick={() => setSelectedDay(i)} className={selectedDay === i ? "gradient-gym border-0" : ""}>
              {day.slice(0, 3)}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const isPremium = c.class_type === "premium";
            const isReserved = reservedIds.has(c.id);
            const canBook = subscribed && (!isPremium || tier === "premium");

            return (
              <Card key={c.id} className="bg-card border-border overflow-hidden">
                <div className={`h-1.5 ${isPremium ? "gradient-premium" : "gradient-gym"}`} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display font-bold text-lg">{c.name}</h3>
                    {isPremium && (
                      <Badge className="gradient-premium border-0 text-xs">Premium</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{c.instructor}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{DAYS[c.day_of_week]}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{c.start_time.slice(0, 5)} — {c.end_time.slice(0, 5)}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{c.max_capacity} cupos</span>
                  </div>
                  <Button
                    className={`w-full ${isReserved ? "" : canBook ? (isPremium ? "gradient-premium" : "gradient-gym") + " border-0" : ""}`}
                    variant={isReserved ? "secondary" : canBook ? "default" : "outline"}
                    disabled={isReserved || !canBook || bookingId === c.id}
                    onClick={() => bookClass(c)}
                  >
                    {isReserved ? "✓ Reservado" : !subscribed ? (
                      <><Lock className="w-4 h-4 mr-1" />Requiere membresía</>
                    ) : !canBook ? (
                      <><Lock className="w-4 h-4 mr-1" />Solo Premium</>
                    ) : bookingId === c.id ? "Reservando..." : "Reservar"}
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
