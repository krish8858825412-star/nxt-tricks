CREATE TABLE IF NOT EXISTS public.visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL DEFAULT 'page_view',
  path TEXT NOT NULL DEFAULT '/',
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  screen TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at ON public.visitor_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_events_ip_created_at ON public.visitor_events (ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_events_event_type_created_at ON public.visitor_events (event_type, created_at DESC);

DROP TRIGGER IF EXISTS update_site_content_updated_at ON public.site_content;
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();