-- ============================================================================
-- ARSelNel Rollback: rollback_202611160002.sql
-- Rollback for Migration 202611160002_fix_selbot_assistant_messages.sql
-- ============================================================================

DROP FUNCTION IF EXISTS public.selbot_record_assistant_message(UUID, TEXT, TEXT);

DROP POLICY IF EXISTS "Users can insert messages into own conversations" ON public.selbot_messages;

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
