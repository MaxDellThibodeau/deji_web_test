// Quick database check script
const { createClient } = require('@supabase/supabase-js');

async function checkDatabases() {
  console.log('🔍 Checking your database setup...\n');

  // Your Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔧 Configuration:');
  console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');
  console.log('Neon URL:', process.env.NEON_DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log();

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials missing');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test tables that should exist
  const tablesToCheck = [
    'profiles',
    'user_tokens', 
    'token_transactions',
    'events',
    'tickets',
    'song_requests',
    'song_bids',
    'dj_profiles',
    'login_logs',
    'event_codes',
    'user_preferences',
    'subscription_plans'
  ];

  console.log('📊 Testing Supabase table access:\n');

  let existingTables = [];
  let missingTables = [];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        missingTables.push(table);
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
        existingTables.push(table);
      }
    } catch (err) {
      console.log(`❌ ${table}: Connection error - ${err.message}`);
      missingTables.push(table);
    }
  }

  // Test auth
  console.log('\n🔐 Testing Supabase Auth:');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('✅ Auth service accessible');
    console.log('Current session:', session ? 'Active' : 'None');
  } catch (error) {
    console.log('❌ Auth service error:', error.message);
  }

  // Summary
  console.log('\n📋 Summary:');
  console.log(`✅ Working tables: ${existingTables.length}`);
  console.log(`❌ Missing tables: ${missingTables.length}`);
  
  if (missingTables.length > 0) {
    console.log('\n🔧 Missing tables that need to be created:');
    missingTables.forEach(table => console.log(`   - ${table}`));
    console.log('\n💡 You need to run your migration scripts in Supabase dashboard');
  }

  console.log('\n🌐 Access your databases:');
  console.log(`📊 Supabase Dashboard: https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}`);
  console.log('💾 Neon Dashboard: https://console.neon.tech/');
}

checkDatabases().catch(console.error); 