const fs = require('fs');
const spawn = require('child_process').spawn;
const execSync = require('child_process').execSync;

execSync('mkdir -p install_logs');

const allPackageJsons = JSON.parse(fs.readFileSync('src/app/dependencies.json', 'utf8'));

allPackageJsons.forEach(packageJsonPath => {
  try {
    const pkgOnly = packageJsonPath.replace('src/app/ganymede/', '').replace('/package.json', '').replace(/\//g, '.');
    const dirOnly = packageJsonPath.replace('/package.json', '');
    const logStream = fs.createWriteStream(`install_logs/${pkgOnly}.log`, {flags: 'a'});
    logStream.on('open', () => {
      spawn(`npm`, [`install`],{
        cwd: `${__dirname}/${dirOnly}`,
        stdio: ['ignore', logStream, logStream]
      }).on('exit', code => {
        if (code !== 0) {
          console.log(`npm install during '${pkgOnly}' ended with non-zero exit (${code}).`);
          process.exit(1);
        }
      });
    });
  } catch(e) {
    console.log(e);
    throw e;
  }
});
