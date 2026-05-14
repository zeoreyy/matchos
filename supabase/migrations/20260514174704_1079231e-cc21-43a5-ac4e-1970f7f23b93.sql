
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  analysis JSONB,
  documents JSONB DEFAULT '[]'::jsonb,
  risk_score INTEGER,
  opportunity_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Demo MVP: allow public access (no auth in this hackathon prototype)
CREATE POLICY "Public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update clients" ON public.clients FOR UPDATE USING (true);

CREATE INDEX clients_email_idx ON public.clients (email);
CREATE INDEX clients_created_idx ON public.clients (created_at DESC);
