mkdir -p src/app/ganymede;

cd src/app/ganymede;
if [ ! -d "components" ]; then
  git clone git@github.com:jovians/ganymede.git
fi
echo "Pulling latest Ganymede source..."
git pull;
cd ../../../;

cp src/app/ganymede/ganymede.js ganymede.js
LICENSE_MSG=$(node ganymede.js license-verify)
if [ $LICENSE_MSG == "GANYMEDE_LICENSE_NOT_VALID" ]; then
  echo "Ganymede license is not valid; aborting."
  exit
fi

cp package.json package.saved.json
rsync -r src/app/ganymede/template/* .

if [ ! -f "src/app/global.scss" ]; then
  touch src/app/global.scss
fi

node ganymede.js appset
node ganymede.js license-stamp
node ganymede.js packages-update
node ganymede.js template-load

find . -name '*.TEMPLATE.*' -delete;
rm -rf package.saved.json

npm install
