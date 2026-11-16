/**
 * ARSelNel - SelBot Conversation & Chat Synchronization Service
 * assets/js/selbot-conversation-service.js
 * 
 * FASA 4F.2: Shared Data Layer & Two-Way Synchronization Engine
 * Unifies Supabase Auth, Conversations, Message Persistence, and Real-Time State
 * across SelBot Main (selbot_ai/code.html) and SelBot WebAR (kotak_arselnel/).
 */

(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    ACTIVE_CONV_PREFIX: 'arselnel_active_conv_',
    CONV_CACHE_PREFIX: 'arselnel_conv_cache_',
    CURRENT_USER: 'arselnel_current_user'
  };

  class SelBotConversationServiceClass {
    constructor() {
      this.supabaseClient = null;
      this.currentUser = null;
      this.currentUserId = null;
      this.activeConversationId = null;
      this.conversations = [];
      this.activeMessages = [];
      this.listeners = new Set();
      this.isInitializing = false;
      this.isInitialized = false;
      this.authSubscription = null;
    }

    /**
     * Subscribe to state change notifications
     * @param {Function} callback (event, data)
     * @returns {Function} unsubscribe function
     */
    subscribe(callback) {
      if (typeof callback === 'function') {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
      }
      return () => {};
    }

    notify(event, data = {}) {
      this.listeners.forEach((fn) => {
        try {
          fn(event, { ...data, service: this });
        } catch (e) {
          console.warn('[SelBotService] Subscriber error:', e);
        }
      });
    }

    /**
     * Get or initialize the Supabase client
     */
    async getSupabaseClient() {
      if (this.supabaseClient) return this.supabaseClient;

      if (global.ARSupabase && typeof global.ARSupabase.getClient === 'function') {
        try {
          this.supabaseClient = await global.ARSupabase.getClient();
        } catch (_) {}
      }
      if (!this.supabaseClient && global.supabase) {
        this.supabaseClient = global.supabase;
      }
      return this.supabaseClient;
    }

    /**
     * Comprehensive multi-tier user identity resolution:
     * 1. Supabase getSession() (instant from localStorage)
     * 2. Supabase getUser() (validated server token)
     * 3. AuthGuard.getUser() (app authentication layer)
     * 4. localStorage 'arselnel_current_user'
     */
    async resolveCurrentUser() {
      const client = await this.getSupabaseClient();
      let foundUser = null;

      // Tier 1: Supabase Session (Fastest)
      if (client?.auth) {
        try {
          const { data: sessData } = await client.auth.getSession();
          if (sessData?.session?.user?.id) {
            foundUser = sessData.session.user;
          }
        } catch (_) {}
      }

      // Tier 2: Supabase User Check
      if (!foundUser && client?.auth) {
        try {
          const { data: userData } = await client.auth.getUser();
          if (userData?.user?.id) {
            foundUser = userData.user;
          }
        } catch (_) {}
      }

      // Tier 3: App AuthGuard
      if (!foundUser && global.AuthGuard && typeof global.AuthGuard.getUser === 'function') {
        const agUser = global.AuthGuard.getUser();
        if (agUser && agUser.id && !global.AuthGuard.isGuest()) {
          foundUser = agUser;
        }
      }

      // Tier 4: Local Storage Backup
      if (!foundUser) {
        try {
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
          if (stored && stored.id && stored.id !== 'guest') {
            foundUser = stored;
          }
        } catch (_) {}
      }

      // If user is guest
      if (!foundUser && global.AuthGuard && typeof global.AuthGuard.isGuest === 'function' && global.AuthGuard.isGuest()) {
        foundUser = { id: 'guest', isGuest: true, name: 'Tetamu' };
      }

      return foundUser;
    }

    /**
     * Initialize auth and load initial conversation state
     */
    async init() {
      if (this.isInitializing) return;
      this.isInitializing = true;

      try {
        const client = await this.getSupabaseClient();
        const user = await this.resolveCurrentUser();

        if (user && user.id) {
          const isUserChanged = this.currentUserId && this.currentUserId !== user.id;
          if (isUserChanged) {
            this.clearSensitiveLocalState();
          }
          this.currentUser = user;
          this.currentUserId = user.id;

          if (user.id !== 'guest') {
            await this.listConversations();
          }
        } else {
          this.currentUser = { id: 'guest', isGuest: true };
          this.currentUserId = 'guest';
        }

        // Attach Supabase Auth Change Listener once
        if (client?.auth && !this.authSubscription) {
          const { data: sub } = client.auth.onAuthStateChange(async (event, session) => {
            console.log('[SelBotService] Auth state changed:', event);

            if (event === 'SIGNED_OUT') {
              this.clearSensitiveLocalState();
              this.notify('auth:signed_out');
            } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user?.id) {
              const newId = session.user.id;
              if (this.currentUserId !== newId) {
                this.clearSensitiveLocalState();
                this.currentUser = session.user;
                this.currentUserId = newId;
                await this.listConversations();
                this.notify('auth:signed_in', { user: session.user });
              }
            }
          });
          this.authSubscription = sub;
        }

        this.isInitialized = true;
        this.notify('initialized', { user: this.currentUser });
      } catch (err) {
        console.warn('[SelBotService] init notice:', err.message);
        this.notify('error', { error: err });
      } finally {
        this.isInitializing = false;
      }
    }

    /**
     * Clear memory and per-user local storage on logout/user switch
     */
    clearSensitiveLocalState() {
      const uid = this.currentUserId;
      if (uid && uid !== 'guest') {
        try {
          sessionStorage.removeItem(`${STORAGE_KEYS.ACTIVE_CONV_PREFIX}${uid}`);
          localStorage.removeItem(`${STORAGE_KEYS.ACTIVE_CONV_PREFIX}${uid}`);
        } catch (_) {}
      }
      this.currentUser = null;
      this.currentUserId = null;
      this.activeConversationId = null;
      this.conversations = [];
      this.activeMessages = [];
      this.notify('state:cleared');
    }

    /**
     * Fetch user conversations from Supabase
     */
    async listConversations(forceRefresh = false) {
      const uid = this.currentUserId;
      if (!uid || uid === 'guest') {
        this.conversations = [];
        this.notify('conversations:updated', { conversations: [] });
        return [];
      }

      const client = await this.getSupabaseClient();
      if (!client) {
        // Fall back to local cache if offline
        try {
          const cached = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.CONV_CACHE_PREFIX}${uid}`) || '[]');
          this.conversations = cached;
          this.notify('conversations:updated', { conversations: this.conversations });
          return this.conversations;
        } catch (_) {
          return [];
        }
      }

      try {
        const { data, error } = await client
          .from('selbot_conversations')
          .select('id, user_id, title, created_at, updated_at')
          .eq('user_id', uid)
          .order('updated_at', { ascending: false })
          .limit(50);

        if (error) {
          console.warn('[SelBotService] listConversations query error:', error.message);
          this.notify('conversations:error', { error });
          throw error;
        }

        if (Array.isArray(data)) {
          // Strict user_id ownership guard
          this.conversations = data.filter(c => c.user_id === uid);
          try {
            localStorage.setItem(`${STORAGE_KEYS.CONV_CACHE_PREFIX}${uid}`, JSON.stringify(this.conversations));
          } catch (_) {}

          // Resolve active conversation
          const activeId = this.resolveActiveConversationId();
          if (activeId && (!this.activeMessages.length || forceRefresh)) {
            await this.getConversationMessages(activeId);
          }

          this.notify('conversations:updated', { conversations: this.conversations, activeId });
          return this.conversations;
        }
      } catch (err) {
        console.warn('[SelBotService] listConversations exception:', err.message);
        throw err;
      }

      return this.conversations;
    }

    /**
     * Resolve active conversation ID from storage or fall back to latest
     */
    resolveActiveConversationId() {
      const uid = this.currentUserId;
      if (!uid || uid === 'guest') return null;

      let storedId = null;
      try {
        storedId = sessionStorage.getItem(`${STORAGE_KEYS.ACTIVE_CONV_PREFIX}${uid}`) ||
                   localStorage.getItem(`${STORAGE_KEYS.ACTIVE_CONV_PREFIX}${uid}`);
      } catch (_) {}

      if (storedId && this.conversations.some(c => c.id === storedId)) {
        this.activeConversationId = storedId;
        return storedId;
      }

      if (this.conversations.length > 0) {
        this.activeConversationId = this.conversations[0].id;
        this.setActiveConversationId(this.activeConversationId);
        return this.activeConversationId;
      }

      this.activeConversationId = null;
      return null;
    }

    /**
     * Set active conversation ID in memory and storage
     */
    setActiveConversationId(convId) {
      const uid = this.currentUserId;
      this.activeConversationId = convId;
      if (uid && uid !== 'guest') {
        try {
          if (convId) {
            sessionStorage.setItem(`${STORAGE_KEYS.ACTIVE_CONV_PREFIX}${uid}`, convId);
            localStorage.setItem(`${STORAGE_KEYS.ACTIVE_CONV_PREFIX}${uid}`, convId);
          } else {
            sessionStorage.removeItem(`${STORAGE_KEYS.ACTIVE_CONV_PREFIX}${uid}`);
            localStorage.removeItem(`${STORAGE_KEYS.ACTIVE_CONV_PREFIX}${uid}`);
          }
        } catch (_) {}
      }
      this.notify('conversation:selected', { conversationId: convId });
    }

    /**
     * Fetch all messages for a conversation
     */
    async getConversationMessages(convId) {
      const uid = this.currentUserId;
      if (!convId) {
        this.activeMessages = [];
        this.notify('messages:updated', { conversationId: null, messages: [] });
        return [];
      }

      const client = await this.getSupabaseClient();
      if (!client || !uid || uid === 'guest') {
        this.activeMessages = [];
        return [];
      }

      try {
        const { data, error } = await client
          .from('selbot_messages')
          .select('id, conversation_id, user_id, role, content, model_info, created_at')
          .eq('conversation_id', convId)
          .eq('user_id', uid)
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('[SelBotService] getConversationMessages error:', error.message);
          this.notify('messages:error', { conversationId: convId, error });
          throw error;
        }

        if (Array.isArray(data)) {
          this.activeMessages = data;
          this.setActiveConversationId(convId);
          this.notify('messages:updated', { conversationId: convId, messages: this.activeMessages });
          return this.activeMessages;
        }
      } catch (err) {
        console.warn('[SelBotService] getConversationMessages notice:', err.message);
        throw err;
      }

      return [];
    }

    /**
     * Create a new conversation row in Supabase
     */
    async createConversation(initialPrompt) {
      const uid = this.currentUserId;
      if (!uid || uid === 'guest') return null;

      const client = await this.getSupabaseClient();
      if (!client) return null;

      try {
        const safeTitle = String(initialPrompt || 'Perbualan Baharu').trim();
        const autoTitle = safeTitle.length > 36 ? safeTitle.slice(0, 36) + '...' : safeTitle;

        const { data, error } = await client
          .from('selbot_conversations')
          .insert({
            user_id: uid,
            title: autoTitle
          })
          .select()
          .single();

        if (!error && data) {
          this.conversations.unshift(data);
          this.setActiveConversationId(data.id);
          this.activeMessages = [];
          this.notify('conversation:created', { conversation: data });
          return data;
        }
      } catch (err) {
        console.warn('[SelBotService] createConversation notice:', err.message);
      }
      return null;
    }

    /**
     * Delete conversation from Supabase and update state
     */
    async deleteConversation(convId) {
      const uid = this.currentUserId;
      if (!uid || uid === 'guest' || !convId) return false;

      const client = await this.getSupabaseClient();
      if (!client) return false;

      try {
        const { error } = await client
          .from('selbot_conversations')
          .delete()
          .eq('id', convId)
          .eq('user_id', uid);

        if (!error) {
          this.conversations = this.conversations.filter(c => c.id !== convId);
          if (this.activeConversationId === convId) {
            this.activeConversationId = null;
            this.activeMessages = [];
            this.resolveActiveConversationId();
          }
          this.notify('conversation:deleted', { conversationId: convId });
          return true;
        }
      } catch (err) {
        console.warn('[SelBotService] deleteConversation notice:', err.message);
      }
      return false;
    }

    /**
     * Send user question to backend API and handle two-way database persistence
     */
    async sendMessage({ message, history = [], onAssistantReply = null }) {
      const cleanVal = String(message || '').trim();
      if (!cleanVal) throw new Error('Mesej tidak boleh kosong.');

      const uid = this.currentUserId;
      let convId = this.activeConversationId;

      // 1. Create conversation if authenticated and fresh
      if (uid && uid !== 'guest' && !convId) {
        const newConv = await this.createConversation(cleanVal);
        if (newConv) {
          convId = newConv.id;
        }
      }

      // 2. Insert user message to Supabase
      const client = await this.getSupabaseClient();
      let userMsgRecord = null;

      if (client && uid && uid !== 'guest' && convId) {
        try {
          const { data: userMsg, error: uErr } = await client
            .from('selbot_messages')
            .insert({
              conversation_id: convId,
              user_id: uid,
              role: 'user',
              content: cleanVal
            })
            .select()
            .single();

          if (!uErr && userMsg) {
            userMsgRecord = userMsg;
            this.activeMessages.push(userMsg);
            this.notify('messages:user_added', { message: userMsg });
          }
        } catch (uErr) {
          console.warn('[SelBotService] Save user message notice:', uErr.message);
        }
      }

      // 3. Get JWT token
      let userToken = '';
      if (client?.auth) {
        try {
          const { data: sessData } = await client.auth.getSession();
          userToken = sessData?.session?.access_token || '';
        } catch (_) {}
      }

      // 4. Send to /api/selbot/chat
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 16000);

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (userToken) {
          headers['Authorization'] = `Bearer ${userToken}`;
        }

        const response = await fetch('/api/selbot/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: cleanVal,
            conversation_id: convId || undefined,
            history
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json().catch(() => ({}));

        if (!response.ok || (!data.success && !data.reply)) {
          const errText = data.error || `Ralat pelayan (${response.status}). Sila cuba sebentar lagi.`;
          throw new Error(errText);
        }

        const replyText = data.reply || 'Maaf, saya tidak menerima respons yang lengkap.';
        const modelBadge = data.provider === 'google-gemini' ? 'Gemini AI' :
                           data.provider === 'openai' ? 'GPT-4o Mini' :
                           data.provider === 'groq' ? 'Groq Llama' :
                           'Kurikulum Sains T1';

        // 5. Dual-persistence guarantee: if server didn't save, save on client
        if (client && uid && uid !== 'guest' && convId && !data.saved) {
          try {
            const { error: rpcErr } = await client.rpc('selbot_record_assistant_message', {
              p_conversation_id: convId,
              p_content: replyText,
              p_model_info: modelBadge
            });
            if (rpcErr) {
              await client.from('selbot_messages').insert({
                conversation_id: convId,
                user_id: uid,
                role: 'assistant',
                content: replyText,
                model_info: modelBadge
              });
            }
          } catch (fbErr) {
            console.warn('[SelBotService] Fallback assistant save notice:', fbErr.message);
          }
        }

        // 6. Update conversation timestamp locally and on server
        if (convId && this.conversations.length > 0) {
          const targetC = this.conversations.find(c => c.id === convId);
          if (targetC) {
            targetC.updated_at = new Date().toISOString();
            // Re-order to top
            this.conversations = [
              targetC,
              ...this.conversations.filter(c => c.id !== convId)
            ];
          }
          if (client && uid && uid !== 'guest') {
            client
              .from('selbot_conversations')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', convId)
              .eq('user_id', uid)
              .then(() => {})
              .catch(() => {});
          }
        }

        const assistantMsg = {
          id: data.message_id || ('msg_ast_' + Date.now()),
          conversation_id: convId,
          user_id: uid,
          role: 'assistant',
          content: replyText,
          model_info: modelBadge,
          created_at: new Date().toISOString()
        };

        this.activeMessages.push(assistantMsg);
        this.notify('messages:assistant_added', { message: assistantMsg });

        if (typeof onAssistantReply === 'function') {
          onAssistantReply(assistantMsg);
        }

        return {
          reply: replyText,
          modelBadge,
          conversationId: convId,
          messageId: assistantMsg.id,
          saved: data.saved || true
        };
      } catch (reqErr) {
        clearTimeout(timeoutId);
        throw reqErr;
      }
    }
  }

  // Singleton instance
  const instance = new SelBotConversationServiceClass();
  global.SelBotConversationService = instance;

})(typeof window !== 'undefined' ? window : global);
