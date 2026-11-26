import { useCallback, useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import {
  clearAiMessages,
  fetchAiMessages,
  isSupabaseConfigured,
  saveAiMessage,
} from '../lib/supabase';

export interface LuniChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  trackContext?: string | null;
  createdAt: string;
}

const GUEST_CHAT_KEY = 'ctrl_path_luni_guest_chat_v1';

const WELCOME_MESSAGE: LuniChatMessage = {
  id: 'luni-welcome',
  role: 'assistant',
  content:
    "Hi Luminary! ✨ I'm Luni, your CTRL+PATH academic guide. Ask me anything about Networking Technology (NT), Business Analytics (BA), or Service Management (SM)!",
  createdAt: new Date().toISOString(),
};

function readGuestMessages(): LuniChatMessage[] {
  try {
    const raw = localStorage.getItem(GUEST_CHAT_KEY);
    if (!raw) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

function writeGuestMessages(messages: LuniChatMessage[]) {
  try {
    localStorage.setItem(GUEST_CHAT_KEY, JSON.stringify(messages.slice(-100)));
  } catch {}
}

export function useLuniChatHistory() {
  const { authSession } = useStudent();
  const isSignedIn = Boolean(authSession && isSupabaseConfigured);

  const [messages, setMessages] = useState<LuniChatMessage[]>([WELCOME_MESSAGE]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // I-load ang chat history kapag nag-sign in o nag-switch ng account
  useEffect(() => {
    let active = true;

    async function load() {
      if (!isSignedIn) {
        if (active) setMessages(readGuestMessages());
        return;
      }

      setLoadingHistory(true);
      try {
        const rows = await fetchAiMessages();
        if (!active) return;

        if (rows.length === 0) {
          setMessages([WELCOME_MESSAGE]);
        } else {
          setMessages(
            rows.map((r) => ({
              id: r.id,
              role: r.role,
              content: r.content,
              trackContext: r.track_context,
              createdAt: r.created_at,
            })),
          );
        }
      } finally {
        if (active) setLoadingHistory(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isSignedIn, authSession?.email]);

  // Mag-append at mag-save ng bagong message (user o assistant)
  const appendMessage = useCallback(
    async (params: {
      role: 'user' | 'assistant';
      content: string;
      trackContext?: string;
    }) => {
      const cleanContent = params.content.trim();
      if (!cleanContent) return;

      const optimistic: LuniChatMessage = {
        id: crypto.randomUUID(),
        role: params.role,
        content: cleanContent,
        trackContext: params.trackContext ?? null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        const next = [...prev, optimistic];
        if (!isSignedIn) writeGuestMessages(next);
        return next;
      });

      if (isSignedIn) {
        try {
          const saved = await saveAiMessage({
            role: params.role,
            content: cleanContent,
            trackContext: params.trackContext,
          });
          if (saved) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === optimistic.id
                  ? {
                      id: saved.id,
                      role: saved.role,
                      content: saved.content,
                      trackContext: saved.track_context,
                      createdAt: saved.created_at,
                    }
                  : m,
              ),
            );
          }
        } catch (err) {
          console.error('Failed to persist AI message to Supabase:', err);
        }
      }
    },
    [isSignedIn],
  );

  // I-clear ang buong conversation history
  const clearHistory = useCallback(async () => {
    setMessages([WELCOME_MESSAGE]);
    if (isSignedIn) {
      await clearAiMessages();
    } else {
      localStorage.removeItem(GUEST_CHAT_KEY);
    }
  }, [isSignedIn]);

  return {
    messages,
    loadingHistory,
    appendMessage,
    clearHistory,
  };
}