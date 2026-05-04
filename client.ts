import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info.tsx';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// API base URL
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-214c0005`;
