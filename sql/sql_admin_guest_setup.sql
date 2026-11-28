-- 1. Function: Get Guest Downloads
CREATE OR REPLACE FUNCTION get_guest_downloads()
RETURNS TABLE (
    ip_address text,
    total_downloads bigint,
    last_download timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only admins can perform this action.';
  END IF;

  RETURN QUERY
  SELECT 
    d.ip_address, 
    SUM(d.download_count)::bigint AS total_downloads,
    MAX(d.updated_at) AS last_download
  FROM download_logs d
  GROUP BY d.ip_address
  ORDER BY last_download DESC;
END;
$$;

-- 2. Function: Admin Reset Guest Download
CREATE OR REPLACE FUNCTION admin_reset_guest_download(p_ip_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Only admins can perform this action.';
    END IF;

    -- Menghapus semua log untuk IP tersebut sehingga mendapat kuota utuh kembali
    DELETE FROM download_logs WHERE ip_address = p_ip_address;
    
    RETURN true;
END;
$$;
