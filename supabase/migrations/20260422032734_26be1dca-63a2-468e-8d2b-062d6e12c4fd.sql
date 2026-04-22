CREATE POLICY "No public read visitor analytics"
ON public.visitor_events
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "No public create visitor analytics"
ON public.visitor_events
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No public update visitor analytics"
ON public.visitor_events
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No public delete visitor analytics"
ON public.visitor_events
FOR DELETE
TO anon, authenticated
USING (false);