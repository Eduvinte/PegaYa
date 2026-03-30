"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/features/notifications/services/notifications";
import { Button } from "@/shared/ui";

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read_at).length,
    [items]
  );

  const load = async () => {
    setLoading(true);
    try {
      const notifications = await getNotifications();
      setItems(notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
      );
    } catch (error) {
      console.error(error);
      toast.error("No se pudo marcar la notificación.");
    }
  };

  const onMarkAllRead = async () => {
    const ids = items.filter((item) => !item.read_at).map((item) => item.id);
    if (!ids.length) return;
    try {
      await markAllNotificationsAsRead(ids);
      setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    } catch (error) {
      console.error(error);
      toast.error("No se pudo marcar todo como leído.");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="liquid-focus-ring relative rounded-xl border border-white/20 bg-white/[0.04] px-3 py-2 text-sm text-foreground hover:bg-white/[0.08]"
        onClick={() => setOpen((current) => !current)}
        aria-label="Abrir notificaciones"
      >
        Campana
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 rounded-full bg-danger px-1.5 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="liquid-glass-strong absolute right-0 z-50 mt-2 w-[min(92vw,430px)] rounded-2xl p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Notificaciones</p>
            <Button size="sm" variant="ghost" onClick={onMarkAllRead}>
              Marcar todas
            </Button>
          </div>

          {loading ? (
            <p className="py-4 text-sm text-muted">Cargando...</p>
          ) : items.length ? (
            <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {items.map((item) => {
                const href = getNotificationHref(item);
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border px-3 py-2 ${
                      item.read_at
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-brand/35 bg-brand/10"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    {item.body ? <p className="mt-1 text-xs text-muted">{item.body}</p> : null}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted">{formatDate(item.created_at)}</span>
                      <div className="flex gap-2">
                        {!item.read_at ? (
                          <button
                            type="button"
                            className="text-xs text-brand-soft hover:text-brand"
                            onClick={() => onMarkRead(item.id)}
                          >
                            Marcar leída
                          </button>
                        ) : null}
                        {href ? (
                          <Link href={href} className="text-xs text-brand-soft hover:text-brand" onClick={() => setOpen(false)}>
                            Ver
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-4 text-sm text-muted">No tienes notificaciones.</p>
          )}
        </div>
      ) : null}
    </div>
  );
};

const getNotificationHref = (item: NotificationItem) => {
  if (item.entity_type === "job" && item.entity_id) {
    return `/jobs/${item.entity_id}`;
  }
  return null;
};

const formatDate = (value: string | null) => {
  if (!value) return "Ahora";
  return new Date(value).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
