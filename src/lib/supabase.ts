import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://hbnjcbmqfoapaerpklfe.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImNiYWJjMDA3LTllMzgtNDY1MS04MjQ0LTVkYzcxNDUxYjM1NSJ9.eyJwcm9qZWN0SWQiOiJoYm5qY2JtcWZvYXBhZXJwa2xmZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5MDM0MjY5LCJleHAiOjIwODQzOTQyNjksImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.Fqf7LPSD1z2HIGTPK3gCQJciywnkdt6484OcfmetuKc';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };