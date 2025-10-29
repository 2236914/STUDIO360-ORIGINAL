-- Support ticketing schema (Supabase/PostgreSQL)
-- Tables
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES support_messages(id) ON DELETE SET NULL,
  cloudinary_public_id TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_seller ON support_tickets(seller_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_attachments_ticket ON support_attachments(ticket_id);

-- Optional convenience view for recent messages with ticket subject
CREATE OR REPLACE VIEW support_messages_view AS
SELECT m.*, t.seller_id, t.subject
FROM support_messages m
JOIN support_tickets t ON t.id = m.ticket_id;

-- RLS (optional if backend-only access)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY seller_can_read_own_tickets ON support_tickets
    FOR SELECT USING (seller_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY seller_can_insert_own_tickets ON support_tickets
    FOR INSERT WITH CHECK (seller_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY seller_can_read_own_msgs ON support_messages
    FOR SELECT USING (EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND t.seller_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY seller_can_insert_own_msgs ON support_messages
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND t.seller_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY seller_can_read_own_attachments ON support_attachments
    FOR SELECT USING (EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND t.seller_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY seller_can_insert_own_attachments ON support_attachments
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND t.seller_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


