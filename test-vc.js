const vc = require('./main/version-control');
const path = require('path');

const cwd = path.resolve(__dirname); // Test in the current project root

async function test() {
  console.log('Testing Version Control Module...');
  console.log('CWD:', cwd);

  try {
    const branch = await vc.getCurrentBranch(cwd);
    console.log('Current Branch:', branch);

    const branches = await vc.getBranches(cwd);
    console.log('Branches:', branches);

    const status = await vc.getStatus(cwd);
    console.log('Status:', status ? '\n' + status : 'Clean');

  } catch (error) {
    console.error('Test Failed:', error);
  }
}

test();
