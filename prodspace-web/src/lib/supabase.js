import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xdrmeicojrslqvbytsjv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkcm1laWNvanJzbHF2Ynl0c2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDIxMDksImV4cCI6MjA2NjkxODEwOX0.9wK2Ol-fkzcgNJBcS7DilpyfE6yldQ50xwgKuektDDk'
export const supabase = createClient(supabaseUrl, supabaseKey)