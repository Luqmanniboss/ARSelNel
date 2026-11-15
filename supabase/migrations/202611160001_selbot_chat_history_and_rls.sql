-- ============================================================================
-- ARSelNel Migration: 202611160001_selbot_chat_history_and_rls.sql
-- Fasa 4E-G.1.2: Persistent Chat History, Private User Conversations & Supabase RLS
-- ============================================================================

-- 1. Jadual Perbualan (selbot_conversations)
CREATE TABLE IF NOT EXISTS public.selbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Perbualan Baharu',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks untuk kelajuan capaian senarai perbualan
CREATE INDEX IF NOT EXISTS idx_selbot_conv_user_updated 
ON public.selbot_conversations(user_id, updated_at DESC);

-- 2. Jadual Mesej Perbualan (selbot_messages)
CREATE TABLE IF NOT EXISTS public.selbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.selbot_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    model_info TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks untuk kelajuan capaian turutan mesej
CREATE INDEX IF NOT EXISTS idx_selbot_msg_conv_created 
ON public.selbot_messages(conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_selbot_msg_user 
ON public.selbot_messages(user_id);

-- 3. Pengaktifan Row Level Security (RLS)
ALTER TABLE public.selbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selbot_messages ENABLE ROW LEVEL SECURITY;

-- 4. Polisi RLS untuk selbot_conversations
DROP POLICY IF EXISTS "Users can select own conversations" ON public.selbot_conversations;
CREATE POLICY "Users can select own conversations"
ON public.selbot_conversations FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON public.selbot_conversations;
CREATE POLICY "Users can insert own conversations"
ON public.selbot_conversations FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.selbot_conversations;
CREATE POLICY "Users can update own conversations"
ON public.selbot_conversations FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.selbot_conversations;
CREATE POLICY "Users can delete own conversations"
ON public.selbot_conversations FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- 5. Polisi RLS untuk selbot_messages
DROP POLICY IF EXISTS "Users can select own messages" ON public.selbot_messages;
CREATE POLICY "Users can select own messages"
ON public.selbot_messages FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

-- Pengguna biasa HANYA boleh INSERT mesej berstatus 'user' ke dalam perbualannya sendiri
-- Ini menghalang pemalsuan identiti serta pemalsuan jawapan AI ('assistant') dari klien
DROP POLICY IF EXISTS "Users can insert own user messages" ON public.selbot_messages;
CREATE POLICY "Users can insert own user messages"
ON public.selbot_messages FOR INSERT TO authenticated
WITH CHECK (
    (select auth.uid()) = user_id 
    AND role = 'user'
    AND EXISTS (
        SELECT 1 FROM public.selbot_conversations c 
        WHERE c.id = conversation_id AND c.user_id = (select auth.uid())
    )
);

-- Pengguna TIDAK mempunyai akses UPDATE pada mesej bagi memelihara integriti sejarah
DROP POLICY IF EXISTS "Users can update own messages" ON public.selbot_messages;

-- Pemadaman mesej dihadkan kepada pemilik
DROP POLICY IF EXISTS "Users can delete own messages" ON public.selbot_messages;
CREATE POLICY "Users can delete own messages"
ON public.selbot_messages FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- 6. Fungsi Khas Pelayan untuk Merekod Respons AI (Server-Only Trusted Function)
-- Fungsi ini HANYA boleh dipanggil oleh peranan yang dipercayai (service_role atau backend)
-- Hak akses EXECUTE ditarik balik daripada public, anon dan authenticated
CREATE OR REPLACE FUNCTION public.selbot_server_append_assistant_message(
    p_conversation_id UUID,
    p_user_id UUID,
    p_content TEXT,
    p_model_info TEXT DEFAULT 'Gemini AI'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_verified_user_id UUID;
    v_new_msg_id UUID;
BEGIN
    -- Sahkan bahawa conversation_id sepadan dengan user_id
    SELECT user_id INTO v_verified_user_id 
    FROM public.selbot_conversations 
    WHERE id = p_conversation_id AND user_id = p_user_id;

    IF v_verified_user_id IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pemilikan perbualan tidak sah.';
    END IF;

    -- Masukkan mesej assistant secara selamat
    INSERT INTO public.selbot_messages (conversation_id, user_id, role, content, model_info)
    VALUES (p_conversation_id, p_user_id, 'assistant', p_content, p_model_info)
    RETURNING id INTO v_new_msg_id;

    -- Kemas kini masa updated_at perbualan
    UPDATE public.selbot_conversations 
    SET updated_at = now() 
    WHERE id = p_conversation_id;

    RETURN jsonb_build_object('success', true, 'message_id', v_new_msg_id);
END;
$$;

-- Sekat akses klien biasa: HANYA peranan pelayan yang dipercayai (service_role) dibenarkan menjalankan fungsi ini
REVOKE ALL ON FUNCTION public.selbot_server_append_assistant_message(UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.selbot_server_append_assistant_message(UUID, UUID, TEXT, TEXT) TO service_role;
