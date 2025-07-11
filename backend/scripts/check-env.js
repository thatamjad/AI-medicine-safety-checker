// Production Environment Check Script
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'PERPLEXITY_API_KEY', 
  'HF_TOKEN',
  'CORS_ORIGIN'
];

function checkEnvironment() {
  console.log('🔍 Checking production environment...\n');
  
  let allGood = true;
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ Missing: ${varName}`);
      allGood = false;
    } else {
      console.log(`✅ Found: ${varName}`);
    }
  });
  
  console.log('\n📊 Optional variables:');
  const optionalVars = ['PORT', 'NODE_ENV', 'RATE_LIMIT_MAX', 'API_TIMEOUT_MS'];
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${value ? '✅' : '⚠️ '} ${varName}: ${value || 'using default'}`);
  });
  
  if (allGood) {
    console.log('\n🎉 Environment check passed! Ready for production.');
  } else {
    console.log('\n🚨 Environment check failed! Please set missing variables.');
    process.exit(1);
  }
}

if (require.main === module) {
  require('dotenv').config();
  checkEnvironment();
}

module.exports = checkEnvironment;
