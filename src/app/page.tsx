import Image from "next/image";
import Link from "next/link";
import { Button, Card, LightParticles } from "@/shared/ui";

const highlights = [
  { title: "Vacantes urgentes", detail: "Turnos por dia y reemplazos en 24 horas." },
  { title: "Proyectos por temporada", detail: "Contratacion por semanas o meses." },
  { title: "Posiciones estables", detail: "Roles indefinidos para equipos de largo plazo." },
];

const regions = ["Santiago", "Valparaiso", "Concepcion", "Antofagasta", "Temuco", "Remoto"];

const flow = [
  {
    step: "01",
    title: "Publica la vacante",
    text: "Define cargo, jornada y duracion. Llegas a candidatos reales en minutos.",
  },
  {
    step: "02",
    title: "Recibe postulaciones",
    text: "Filtra por experiencia, ubicacion y disponibilidad para empezar pronto.",
  },
  {
    step: "03",
    title: "Contrata rapido",
    text: "Cierra el proceso en una sola plataforma y mantente en contacto por chat.",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden pb-12 sm:pb-16">
      <section className="relative mx-auto mt-3 w-[min(99%,1760px)] overflow-hidden rounded-[1.4rem] border border-white/10 sm:rounded-[2rem] lg:mt-5">
        <Image
          src="/banner1.jpg"
          alt="Personas trabajando en una vacante"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,17,23,0.94)_12%,rgba(3,26,36,0.86)_47%,rgba(2,16,22,0.8)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(68,235,242,0.26),transparent_42%),radial-gradient(circle_at_78%_20%,rgba(42,240,196,0.18),transparent_48%)]" />
        <LightParticles level="high" className="opacity-80 sm:opacity-100" />

        <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-7 md:px-10 md:py-9">
          <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-brand-soft">Pegaya Chile</p>
              <p className="text-xs text-muted">Vacantes rapidas para personas y empresas</p>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  Ingresar
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="glass" size="sm" className="w-full sm:w-auto">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-soft sm:text-sm">Mercado laboral chileno</p>

              <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-[3.45rem]">
                Publica hoy,
                <span className="text-brand-soft"> contrata rapido</span>
                <br />
                y cubre vacantes desde un dia hasta anos.
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base md:text-lg">
                Diseñada para Chile: procesos simples para empresas, postulaciones claras para
                candidatos y seguimiento en tiempo real para no perder oportunidades.
              </p>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                <Link href="/jobs" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Buscar vacantes
                  </Button>
                </Link>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Publicar vacante
                  </Button>
                </Link>
              </div>

              <div className="liquid-glass mt-1 rounded-2xl p-3.5 sm:mt-2 sm:rounded-3xl sm:p-5">
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <Metric value="+3.200" label="vacantes activas" />
                  <Metric value="48 hrs" label="tiempo promedio de cierre" />
                  <Metric value="16 regiones" label="cobertura nacional" />
                </div>
              </div>
            </div>

            <Card
              variant="glassStrong"
              padding="md"
              title="Modalidades de contratacion"
              description="Ajusta segun la urgencia real de tu operacion."
              className="backdrop-blur-xl sm:p-7"
            >
              <div className="space-y-2.5 sm:space-y-3">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/20 bg-white/5 p-3 sm:p-3.5">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 w-[min(96%,1300px)] space-y-8 sm:mt-14 sm:space-y-10">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-soft sm:text-sm">Cobertura</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Encuentra talento en todo Chile
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => (
              <span
                key={region}
                className="liquid-glass rounded-full px-3 py-1.5 text-xs font-medium text-foreground sm:px-3.5 sm:text-sm"
              >
                {region}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {flow.map((item) => (
            <Card
              key={item.step}
              variant="glass"
              padding="md"
              className="min-h-[200px] sm:min-h-[220px]"
              title={
                <span className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-base text-brand-soft sm:text-lg">{item.step}</span>
                  {item.title}
                </span>
              }
              description={item.text}
            />
          ))}
        </div>

        <Card
          variant="glassStrong"
          padding="md"
          className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          title="Empieza hoy"
          description="Si necesitas personal para manana o quieres crecer tu equipo este trimestre, Pegaya te ayuda a moverte rapido."
        >
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Crear cuenta empresa
              </Button>
            </Link>
            <Link href="/ui-kit" className="w-full sm:w-auto">
              <Button variant="glass" size="lg" className="w-full sm:w-auto">
                Ver sistema UI
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/[0.07] px-3.5 py-3 sm:px-4">
      <p className="text-xl font-bold text-foreground sm:text-[1.75rem]">{value}</p>
      <p className="text-xs text-muted sm:text-sm">{label}</p>
    </div>
  );
}
