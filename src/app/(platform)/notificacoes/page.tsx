"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/notifications";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function loadNotifications() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    startTransition(async () => {
      await markNotificationRead(id);
    });
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Tudo em dia"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
          >
            <Check className="h-4 w-4 mr-1.5" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg border border-neutral-200 p-4">
              <div className="h-4 bg-neutral-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BellOff className="h-12 w-12 text-neutral-300 mb-4" />
          <p className="text-neutral-500 font-medium">Nenhuma notificação</p>
          <p className="text-neutral-400 text-sm mt-1">
            Você receberá notificações sobre seus fretes aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const timeAgo = formatTimeAgo(notification.created_at);
  const icon = getNotificationIcon(notification.type);

  const content = (
    <div
      className={`flex gap-4 p-4 rounded-lg border transition-colors ${
        notification.is_read
          ? "bg-white border-neutral-200"
          : "bg-brand-50 border-brand-200"
      }`}
    >
      <div className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-base ${
        notification.is_read ? "bg-neutral-100" : "bg-brand-100"
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${notification.is_read ? "text-neutral-700" : "text-neutral-900"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{notification.body}</p>
        <p className="text-xs text-neutral-400 mt-1.5">{timeAgo}</p>
      </div>
      {!notification.is_read && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="shrink-0 self-start mt-0.5 text-neutral-400 hover:text-neutral-600 transition-colors"
          title="Marcar como lida"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={() => !notification.is_read && onMarkRead(notification.id)}>
        {content}
      </Link>
    );
  }

  return content;
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    freight_applied: "📦",
    application_accepted: "✅",
    application_rejected: "❌",
    payment_received: "💳",
    boarding_confirmed: "🚛",
    delivery_confirmed: "🏁",
    freight_cancelled: "🚫",
    registration_approved: "🎉",
    registration_rejected: "⛔",
  };
  return icons[type] || "🔔";
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Agora";
  if (minutes < 60) return `Há ${minutes} min`;
  if (hours < 24) return `Há ${hours}h`;
  if (days === 1) return "Ontem";
  if (days < 7) return `Há ${days} dias`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}
