import gitInfo from '../src/index.js';

// Basic test
console.log('Testing rollup-plugin-git-info...');

const plugin = gitInfo();
console.log('✅ Plugin created successfully');
console.log('Plugin name:', plugin.name);

// Test with options
const pluginWithOptions = gitInfo({
  moduleName: 'virtual:test-git',
  silent: true,
  packagePath: './package.json',
  fallback: {
    commit: 'test-commit',
    branch: 'test-branch',
    shortCommit: 'test',
    version: 'test-version'
  }
});

console.log('✅ Plugin with options created successfully');

// Test resolveId
const resolved = plugin.resolveId('virtual:git-info');
console.log('✅ resolveId test:', resolved === 'virtual:git-info' ? 'PASS' : 'FAIL');

// Test buildStart (this will actually try to read git info)
try {
  plugin.buildStart();
  console.log('✅ buildStart executed successfully');
} catch (error) {
  console.log('❌ buildStart failed:', error.message);
}

// Test load
const loaded = plugin.load('virtual:git-info');
if (loaded && loaded.startsWith('export default')) {
  console.log('✅ load test: PASS');
  
  // Parse and validate the generated module content
  try {
    // Remove 'export default ' and the trailing semicolon to get valid JSON
    const moduleContent = loaded.replace('export default ', '').replace(/;$/, '');
    const gitInfoData = JSON.parse(moduleContent);
    
    console.log('Generated git info data:');
    console.log('- commit:', gitInfoData.commit);
    console.log('- shortCommit:', gitInfoData.shortCommit);
    console.log('- branch:', gitInfoData.branch);
    console.log('- isDirty:', gitInfoData.isDirty);
    console.log('- version:', gitInfoData.version);
    console.log('- buildHostname:', gitInfoData.buildHostname);
    console.log('- buildTime:', gitInfoData.buildTime);
    
    // Validate required fields exist
    const requiredFields = ['commit', 'shortCommit', 'branch', 'isDirty', 'version', 'buildHostname', 'buildTime'];
    const missingFields = requiredFields.filter(field => !(field in gitInfoData));
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields present');
    } else {
      console.log('❌ Missing fields:', missingFields);
    }
    
    // Test hostname is valid
    if (gitInfoData.buildHostname && gitInfoData.buildHostname !== 'unknown') {
      console.log('✅ Build hostname captured successfully');
    } else {
      console.log('⚠️ Build hostname not captured or is fallback value');
    }
    
    // Test version
    if (gitInfoData.version && gitInfoData.version !== 'unknown') {
      console.log('✅ Version from package.json captured successfully');
    } else {
      console.log('⚠️ Version not captured or is fallback value');
    }
    
  } catch (parseError) {
    console.log('❌ Failed to parse generated module:', parseError.message);
  }
  
} else {
  console.log('❌ load test: FAIL');
}

// Test custom package.json path
console.log('\n--- Testing custom package.json path ---');
const pluginCustomPath = gitInfo({
  packagePath: './non-existent-package.json',
  silent: true,
  fallback: { version: 'fallback-version' }
});

try {
  pluginCustomPath.buildStart();
  const customLoaded = pluginCustomPath.load('virtual:git-info');
  const customData = JSON.parse(customLoaded.replace('export default ', '').replace(/;$/, ''));
  
  if (customData.version === 'fallback-version') {
    console.log('✅ Custom package.json path fallback works');
  } else {
    console.log('❌ Custom package.json path fallback failed');
  }
} catch (error) {
  console.log('❌ Custom package.json path test failed:', error.message);
}

// Test different module name
console.log('\n--- Testing custom module name ---');
const customModulePlugin = gitInfo({ moduleName: 'virtual:custom-git', silent: true });
const customResolved = customModulePlugin.resolveId('virtual:custom-git');
if (customResolved === 'virtual:custom-git') {
  console.log('✅ Custom module name works');
} else {
  console.log('❌ Custom module name failed');
}

console.log('\nAll tests completed!');