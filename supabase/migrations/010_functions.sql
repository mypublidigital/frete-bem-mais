-- Auto-log freight status changes
CREATE OR REPLACE FUNCTION log_freight_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_log (entity_type, entity_id, action, old_status, new_status)
    VALUES ('freight', NEW.id, 'status_change', OLD.status::text, NEW.status::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER freight_status_audit
  AFTER UPDATE ON freights
  FOR EACH ROW
  EXECUTE FUNCTION log_freight_status_change();

-- Auto-log profile status changes
CREATE OR REPLACE FUNCTION log_profile_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_log (entity_type, entity_id, action, old_status, new_status)
    VALUES ('profile', NEW.id, 'status_change', OLD.status::text, NEW.status::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profile_status_audit
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_status_change();
