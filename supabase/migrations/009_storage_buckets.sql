-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('cnh-documents', 'cnh-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('implement-photos', 'implement-photos', true);

-- CNH documents: carriers upload own, admins read all
CREATE POLICY "Carriers upload own CNH" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cnh-documents'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Carriers read own CNH" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cnh-documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Implement photos: carriers upload, public read
CREATE POLICY "Carriers upload implement photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'implement-photos'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Public read implement photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'implement-photos');
