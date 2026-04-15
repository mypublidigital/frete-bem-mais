-- Audit log (immutable, append-only)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  entity_type TEXT NOT NULL, -- 'profile', 'freight', 'payment'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'status_change', 'create', etc.
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
