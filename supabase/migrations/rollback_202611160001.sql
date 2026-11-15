-- ============================================================================
-- ARSelNel Migration Rollback: rollback_202611160001.sql
-- Fasa 4E-G.1.2: Rollback SelBot Chat History, Messages & RLS Policies
-- ============================================================================

-- 1. Gugurkan fungsi pelayan
DROP FUNCTION IF EXISTS public.selbot_server_append_assistant_message(UUID, UUID, TEXT, TEXT);

-- 2. Gugurkan polisi RLS selbot_messages
DROP POLICY IF EXISTS "Users can select own messages" ON public.selbot_messages;
DROP POLICY IF EXISTS "Users can insert own user messages" ON public.selbot_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.selbot_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.selbot_messages;

-- 3. Gugurkan polisi RLS selbot_conversations
DROP POLICY IF EXISTS "Users can select own conversations" ON public.selbot_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.selbot_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.selbot_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.selbot_conversations;

-- 4. Gugurkan jadual (selbot_messages bergantung kepada selbot_conversations)
DROP TABLE IF EXISTS public.selbot_messages CASCADE;
DROP TABLE IF EXISTS public.selbot_conversations CASCADE;
