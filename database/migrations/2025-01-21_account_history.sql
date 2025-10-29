-- Account History Migration
-- This migration creates tables for tracking user login history and account activities

-- Create account_history table for login/activity tracking
CREATE TABLE IF NOT EXISTS account_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL DEFAULT 'login', -- login, logout, password_change, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'successful', -- successful, failed, suspicious
    
    -- Device and browser information
    device_type VARCHAR(100), -- Windows Chrome, iPhone Safari, etc.
    browser_name VARCHAR(100), -- Chrome 120.0, Safari 17.0, etc.
    operating_system VARCHAR(100), -- Windows 11, iOS 17.2, etc.
    user_agent TEXT,
    
    -- Location and network information
    ip_address INET,
    location VARCHAR(200), -- City, Country
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Additional metadata
    session_id VARCHAR(255),
    is_mobile BOOLEAN DEFAULT FALSE,
    is_tablet BOOLEAN DEFAULT FALSE,
    is_desktop BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_account_history_user_id ON account_history(user_id);
CREATE INDEX IF NOT EXISTS idx_account_history_created_at ON account_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_history_activity_type ON account_history(activity_type);
CREATE INDEX IF NOT EXISTS idx_account_history_status ON account_history(status);
CREATE INDEX IF NOT EXISTS idx_account_history_ip_address ON account_history(ip_address);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_account_history_updated_at 
    BEFORE UPDATE ON account_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE account_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own account history
CREATE POLICY "Users can view own account history" ON account_history
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own account history (for API use)
CREATE POLICY "Users can insert own account history" ON account_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users cannot update account history (it's read-only for users)
CREATE POLICY "Users cannot update account history" ON account_history
    FOR UPDATE USING (FALSE);

-- Users cannot delete account history (it's read-only for users)
CREATE POLICY "Users cannot delete account history" ON account_history
    FOR DELETE USING (FALSE);

-- Create a view for easier querying with formatted data
CREATE OR REPLACE VIEW account_history_view AS
SELECT 
    ah.id,
    ah.user_id,
    ah.activity_type,
    ah.status,
    ah.device_type,
    ah.browser_name,
    ah.operating_system,
    ah.ip_address,
    ah.location,
    ah.country,
    ah.city,
    ah.session_id,
    ah.is_mobile,
    ah.is_tablet,
    ah.is_desktop,
    ah.created_at,
    ah.updated_at,
    -- Format timestamps
    TO_CHAR(ah.created_at, 'YYYY-MM-DD') as date_formatted,
    TO_CHAR(ah.created_at, 'HH24:MI:SS') as time_formatted,
    -- Status color mapping
    CASE 
        WHEN ah.status = 'successful' THEN 'success'
        WHEN ah.status = 'failed' THEN 'error'
        WHEN ah.status = 'suspicious' THEN 'warning'
        ELSE 'default'
    END as status_color
FROM account_history ah;

-- Grant permissions on the view
GRANT SELECT ON account_history_view TO authenticated;

-- Create a function to log account activity (for use by API)
CREATE OR REPLACE FUNCTION log_account_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(50) DEFAULT 'login',
    p_status VARCHAR(20) DEFAULT 'successful',
    p_device_type VARCHAR(100) DEFAULT NULL,
    p_browser_name VARCHAR(100) DEFAULT NULL,
    p_operating_system VARCHAR(100) DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_location VARCHAR(200) DEFAULT NULL,
    p_country VARCHAR(100) DEFAULT NULL,
    p_city VARCHAR(100) DEFAULT NULL,
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_is_mobile BOOLEAN DEFAULT FALSE,
    p_is_tablet BOOLEAN DEFAULT FALSE,
    p_is_desktop BOOLEAN DEFAULT TRUE
)
RETURNS UUID AS $$
DECLARE
    new_history_id UUID;
BEGIN
    INSERT INTO account_history (
        user_id,
        activity_type,
        status,
        device_type,
        browser_name,
        operating_system,
        user_agent,
        ip_address,
        location,
        country,
        city,
        session_id,
        is_mobile,
        is_tablet,
        is_desktop
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_status,
        p_device_type,
        p_browser_name,
        p_operating_system,
        p_user_agent,
        p_ip_address,
        p_location,
        p_country,
        p_city,
        p_session_id,
        p_is_mobile,
        p_is_tablet,
        p_is_desktop
    ) RETURNING id INTO new_history_id;
    
    RETURN new_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (though this will be called via API)
GRANT EXECUTE ON FUNCTION log_account_activity TO authenticated;

-- Insert some sample data for testing (optional - remove in production)
INSERT INTO account_history (
    user_id,
    activity_type,
    status,
    device_type,
    browser_name,
    operating_system,
    ip_address,
    location,
    country,
    city,
    is_mobile,
    is_desktop
) VALUES 
-- Replace with actual user ID from your auth.users table
((SELECT id FROM auth.users LIMIT 1), 'login', 'successful', 'Windows Chrome', 'Chrome 120.0', 'Windows 11', '192.168.1.1', 'Quezon City, Philippines', 'Philippines', 'Quezon City', FALSE, TRUE),
((SELECT id FROM auth.users LIMIT 1), 'login', 'successful', 'iPhone Safari', 'Safari 17.0', 'iOS 17.2', '192.168.1.2', 'Manila, Philippines', 'Philippines', 'Manila', TRUE, FALSE),
((SELECT id FROM auth.users LIMIT 1), 'login', 'failed', 'Windows Chrome', 'Chrome 120.0', 'Windows 11', '192.168.1.1', 'Quezon City, Philippines', 'Philippines', 'Quezon City', FALSE, TRUE),
((SELECT id FROM auth.users LIMIT 1), 'login', 'successful', 'Android Chrome', 'Chrome Mobile 120.0', 'Android 14', '192.168.1.3', 'Makati, Philippines', 'Philippines', 'Makati', TRUE, FALSE),
((SELECT id FROM auth.users LIMIT 1), 'login', 'suspicious', 'Windows Chrome', 'Chrome 119.0', 'Windows 10', '203.177.89.15', 'Unknown Location', 'Unknown', 'Unknown', FALSE, TRUE);

-- Create a function to get user's recent login history
CREATE OR REPLACE FUNCTION get_user_login_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    activity_type VARCHAR(50),
    status VARCHAR(20),
    device_type VARCHAR(100),
    browser_name VARCHAR(100),
    operating_system VARCHAR(100),
    ip_address INET,
    location VARCHAR(200),
    country VARCHAR(100),
    city VARCHAR(100),
    is_mobile BOOLEAN,
    is_tablet BOOLEAN,
    is_desktop BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    date_formatted TEXT,
    time_formatted TEXT,
    status_color TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ah.id,
        ah.activity_type,
        ah.status,
        ah.device_type,
        ah.browser_name,
        ah.operating_system,
        ah.ip_address,
        ah.location,
        ah.country,
        ah.city,
        ah.is_mobile,
        ah.is_tablet,
        ah.is_desktop,
        ah.created_at,
        TO_CHAR(ah.created_at, 'YYYY-MM-DD') as date_formatted,
        TO_CHAR(ah.created_at, 'HH24:MI:SS') as time_formatted,
        CASE 
            WHEN ah.status = 'successful' THEN 'success'
            WHEN ah.status = 'failed' THEN 'error'
            WHEN ah.status = 'suspicious' THEN 'warning'
            ELSE 'default'
        END as status_color
    FROM account_history ah
    WHERE ah.user_id = p_user_id
    ORDER BY ah.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_login_history TO authenticated;
