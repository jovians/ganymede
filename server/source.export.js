const fs = require('fs');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const fg = require('fast-glob');

(async () => {
  execSync(`mkdir -p dist-server/app`);
  const currentBuildUuid = fs.readFileSync('.build.uuid', 'utf8');
  const extBuilds = await fg([
      'src/**/server/**/.extension.build.uuid',
    ], {
      dot: true,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/ganymede/template/**'
      ]
    }
  );
  const ignoredExtensions = [];
  extBuilds.forEach(file => {
    const extBuildUuid = fs.readFileSync(file, 'utf8');
    const pkgName = file.replace('src/app/ganymede/', '').replace('/.extension.build.uuid', '').replace(/\//g, '.');
    if (extBuildUuid !== currentBuildUuid) {
      const extServerPath = file.replace('/.extension.build.uuid', '');
      ignoredExtensions.push(`**/${extServerPath}/**`);
      console.log(`[ SKIPPED ] '${pkgName}' ignored from server bundle.`);
    } else {
      console.log(`[ INCLUDE ] '${pkgName}' exported.`);
    }
  });
  const entries = await fg([
      'src/**/server/**/package.json',
      'src/**/server/**/package-lock.json',
      'src/**/server/**/*.js',
      'src/**/ganymede.app.interface.js',
      'src/**/ganymede/components/util/shared/*.js'
    ], {
      dot: true,
      ignore: ignoredExtensions.concat([
        '**/node_modules/**',
        '**/dist/**',
        '**/ganymede/template/**'
      ])
    }
  );
  const packageJsonFiles = [];
  entries.forEach(file => {
    const paths = file.split('/');
    const filename = paths.pop();
    let destDir = paths.join('/');
    destDir = 'dist-server/app/' + destDir.replace('src/app/', '');
    exec(`mkdir -p ${destDir}; cp ${file} ${destDir}/${filename}`, () => {});
    if (file.endsWith('/package.json')) {
      packageJsonFiles.push(file);
      const depsDir = destDir.replace('dist-server/app/', 'dist-server-deps/app/');
      const lockfilesrc = file.replace('package.json', 'package-lock.json');
      const lockfilename = filename.replace('package.json', 'package-lock.json');
      exec(`mkdir -p ${depsDir}; cp ${file} ${depsDir}/${filename}; cp ${lockfilesrc} ${depsDir}/${lockfilename}`, () => {});
    }
  });
  fs.writeFileSync('dist-server/dependencies.json', JSON.stringify(packageJsonFiles, null, 4), 'utf8');
  execSync(`cp src/app/ganymede/docker/ganymede.docker.server.nginx.conf dist-server/server.nginx.conf`);
  console.log(`The compiled server bundle has been exported to 'dist-server'`);
})();
