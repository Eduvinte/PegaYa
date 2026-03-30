import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/cn";

type ParticleLevel = "low" | "medium" | "high";

type LightParticlesProps = {
  className?: string;
  level?: ParticleLevel;
};

type Particle = {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

const PARTICLES: Particle[] = [
  { top: "8%", left: "12%", size: 8, delay: 0, duration: 8, opacity: 0.45 },
  { top: "14%", left: "38%", size: 6, delay: 1, duration: 10, opacity: 0.4 },
  { top: "20%", left: "72%", size: 10, delay: 0.5, duration: 11, opacity: 0.55 },
  { top: "30%", left: "88%", size: 7, delay: 2, duration: 9, opacity: 0.45 },
  { top: "42%", left: "56%", size: 12, delay: 1.5, duration: 12, opacity: 0.38 },
  { top: "48%", left: "22%", size: 9, delay: 2.3, duration: 9, opacity: 0.5 },
  { top: "60%", left: "76%", size: 8, delay: 3, duration: 10, opacity: 0.42 },
  { top: "66%", left: "10%", size: 11, delay: 2.4, duration: 13, opacity: 0.36 },
  { top: "72%", left: "48%", size: 7, delay: 1.1, duration: 8, opacity: 0.45 },
  { top: "82%", left: "30%", size: 9, delay: 3.4, duration: 11, opacity: 0.4 },
  { top: "86%", left: "64%", size: 6, delay: 0.9, duration: 9, opacity: 0.5 },
  { top: "90%", left: "84%", size: 10, delay: 2.2, duration: 12, opacity: 0.35 },
];

const PARTICLE_COUNT: Record<ParticleLevel, number> = {
  low: 5,
  medium: 8,
  high: 12,
};

export function LightParticles({ className, level = "medium" }: LightParticlesProps) {
  const count = PARTICLE_COUNT[level];
  const activeParticles = PARTICLES.slice(0, count);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {activeParticles.map((particle, index) => {
        const style: CSSProperties = {
          top: particle.top,
          left: particle.left,
          width: particle.size,
          height: particle.size,
          opacity: particle.opacity,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`,
        };

        return <span key={`particle-${index}`} className="light-particle" style={style} />;
      })}
    </div>
  );
}
