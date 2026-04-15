-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipper_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE implements ENABLE ROW LEVEL SECURITY;
ALTER TABLE implement_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE freights ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own, admins read all
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role manages profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Shipper profiles
CREATE POLICY "Shippers read own" ON shipper_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins read all shipper profiles" ON shipper_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role manages shipper profiles" ON shipper_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Carrier profiles
CREATE POLICY "Carriers read own" ON carrier_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins read all carrier profiles" ON carrier_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role manages carrier profiles" ON carrier_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Vehicles: carriers manage own, approved users can see metadata
CREATE POLICY "Carriers manage own vehicles" ON vehicles
  FOR ALL USING (auth.uid() = carrier_id);

CREATE POLICY "Approved users read vehicle metadata" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Service role manages vehicles" ON vehicles
  FOR ALL USING (auth.role() = 'service_role');

-- Implements
CREATE POLICY "Read implements via vehicle" ON implements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = implements.vehicle_id
      AND (v.carrier_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved'
      ))
    )
  );

CREATE POLICY "Carriers manage own implements" ON implements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vehicles WHERE id = implements.vehicle_id AND carrier_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages implements" ON implements
  FOR ALL USING (auth.role() = 'service_role');

-- Implement photos
CREATE POLICY "Read implement photos" ON implement_photos
  FOR SELECT USING (true); -- Public photos

CREATE POLICY "Service role manages implement photos" ON implement_photos
  FOR ALL USING (auth.role() = 'service_role');

-- Freights: approved users read published, shippers manage own
CREATE POLICY "Approved users read published freights" ON freights
  FOR SELECT USING (
    shipper_id = auth.uid()
    OR selected_carrier_id = auth.uid()
    OR (status = 'published' AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved'
    ))
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Shippers create own freights" ON freights
  FOR INSERT WITH CHECK (
    shipper_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved' AND role = 'shipper'
    )
  );

CREATE POLICY "Service role manages freights" ON freights
  FOR ALL USING (auth.role() = 'service_role');

-- Freight applications
CREATE POLICY "Carriers create applications" ON freight_applications
  FOR INSERT WITH CHECK (
    carrier_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved' AND role = 'carrier'
    )
  );

CREATE POLICY "Read own applications" ON freight_applications
  FOR SELECT USING (
    carrier_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM freights WHERE id = freight_applications.freight_id AND shipper_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role manages applications" ON freight_applications
  FOR ALL USING (auth.role() = 'service_role');

-- Payments: only involved parties and admins
CREATE POLICY "Read own payments" ON payments
  FOR SELECT USING (
    shipper_id = auth.uid()
    OR carrier_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role manages payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

-- Audit log: admin only
CREATE POLICY "Admins read audit log" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role manages audit log" ON audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- Notifications: users see own
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role manages notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');
