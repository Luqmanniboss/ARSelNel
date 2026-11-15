-- ============================================================================
-- ARSelNel Migration: 202611160002_fix_selbot_assistant_messages.sql
-- Fasa 4E-G.1.4: Fix Missing SelBot Assistant Messages in Chat History
-- ============================================================================

-- 1. Kemas kini Polisi RLS selbot_messages untuk membenarkan INSERT bagi role 'user' & 'assistant'
-- Pengguna hanya boleh memasukkan mesej ke dalam perbualan miliknya sendiri
DROP POLICY IF EXISTS "Users can insert own user messages" ON public.selbot_messages;
DROP POLICY IF EXISTS "Users can insert messages into own conversations" ON public.selbot_messages;

CREATE POLICY "Users can insert messages into own conversations"
ON public.selbot_messages FOR INSERT TO authenticated
WITH CHECK (
    (select auth.uid()) = user_id 
    AND role IN ('user', 'assistant')
    AND EXISTS (
        SELECT 1 FROM public.selbot_conversations c 
        WHERE c.id = conversation_id AND c.user_id = (select auth.uid())
    )
);

-- 2. Fungsi RPC Selamat: selbot_record_assistant_message
-- Menyimpan jawapan AI dengan pengesahan identiti dan pemilikan perbualan
CREATE OR REPLACE FUNCTION public.selbot_record_assistant_message(
    p_conversation_id UUID,
    p_content TEXT,
    p_model_info TEXT DEFAULT 'Gemini AI'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_caller_uid UUID;
    v_conv_owner UUID;
    v_new_msg_id UUID;
BEGIN
    -- 1. Dapatkan UID pemanggil daripada auth.uid()
    v_caller_uid := auth.uid();
    
    IF v_caller_uid IS NULL THEN
        RAISE EXCEPTION 'Akses ditolak: Pengguna tidak disahkan.';
    END IF;

    -- 2. Sahkan bahawa perbualan wujud dan dimiliki oleh pemanggil
    SELECT user_id INTO v_conv_owner
    FROM public.selbot_conversations
    WHERE id = p_conversation_id;

    IF v_conv_owner IS NULL THEN
        RAISE EXCEPTION 'Perbualan tidak dijumpai.';
    END IF;

    IF v_conv_owner != v_caller_uid THEN
        RAISE EXCEPTION 'Akses ditolak: Anda tidak memiliki perbualan ini.';
    END IF;

    -- 3. Masukkan mesej assistant secara selamat
    INSERT INTO public.selbot_messages (
        conversation_id,
        user_id,
        role,
        content,
        model_info
    )
    VALUES (
        p_conversation_id,
        v_caller_uid,
        'assistant',
        p_content,
        p_model_info
    )
    RETURNING id INTO v_new_msg_id;

    -- 4. Kemas kini tarikh kemas kini perbualan
    UPDATE public.selbot_conversations
    SET updated_at = now()
    WHERE id = p_conversation_id;

    RETURN jsonb_build_object(
        'success', true,
        'message_id', v_new_msg_id
    );
END;
$$;

-- 3. Kebenaran Pelaksanaan (Execute Permissions)
GRANT EXECUTE ON FUNCTION public.selbot_record_assistant_message(UUID, TEXT, TEXT) TO authenticated, service_role;
