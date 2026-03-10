import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, Zap, Calendar, Shield } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gym flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg"><span className="text-gradient-gym">POWER</span>GYM</span>
          </div>
          <div className="flex gap-2">
            <Link to="/pricing"><Button variant="ghost" size="sm">Planes</Button></Link>
            <Link to="/auth"><Button className="gradient-gym border-0" size="sm">Inscríbete</Button></Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6">
          Tu mejor versión<br />
          <span className="text-gradient-gym">empieza aquí</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Inscríbete, paga tu mensualidad automáticamente y reserva tus clases favoritas. Todo desde un solo lugar.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/auth">
            <Button size="lg" className="gradient-gym border-0 text-base px-8">Comenzar Ahora</Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="text-base px-8">Ver Planes</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Zap, title: "Pago Automático", desc: "Tu membresía se renueva cada mes sin que tengas que preocuparte." },
            { icon: Calendar, title: "Reserva Clases", desc: "Yoga, CrossFit, Spinning y más. Reserva tu lugar con un click." },
            { icon: Shield, title: "Cancela Cuando Quieras", desc: "Sin contratos largos. Gestiona tu suscripción en cualquier momento." },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-gym mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
