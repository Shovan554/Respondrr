-- Create automation_calls table for emergency call automation
CREATE TABLE IF NOT EXISTS automation_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID NOT NULL REFERENCES emergencies(id),
    patient_id UUID NOT NULL REFERENCES profiles(id),
    patient_name TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    twilio_call_sid TEXT,
    status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'connecting', 'in_progress', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS automation_calls_emergency_idx ON automation_calls(emergency_id);
CREATE INDEX IF NOT EXISTS automation_calls_patient_idx ON automation_calls(patient_id);
CREATE INDEX IF NOT EXISTS automation_calls_status_idx ON automation_calls(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_automation_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS automation_calls_updated_at_trigger ON automation_calls;
CREATE TRIGGER automation_calls_updated_at_trigger
BEFORE UPDATE ON automation_calls
FOR EACH ROW
EXECUTE FUNCTION update_automation_calls_updated_at();
