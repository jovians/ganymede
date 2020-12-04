mkdir -p src/app/ganymede;

cd src/app/ganymede;
if [ ! -d "components" ]; then
  git clone git@github.com:jovians/ganymede.git
fi
echo "Pulling latest Ganymede source..."
git pull;
cd ../../../;

LANGSTER_INSTALLED=$(node -p "try{typeof require('@jovian/langster')==='object'}catch(e){''}")
if [[ $LANGSTER_INSTALLED != "true" ]]; then
  echo "Installing dependency... [ glob ]"
  npm install glob --save-dev > /dev/null 2>&1;
fi

FOURQ_INSTALLED=$(node -p "try{typeof require('@jovian/fourq')==='object'}catch(e){''}")
if [[ $FOURQ_INSTALLED != "true" ]]; then
  echo "Installing dependency... [ @jovian/fourq ]"
  npm install @jovian/fourq > /dev/null 2>&1;
fi

cp src/app/ganymede/ganymede.js ganymede.js
LICENSE_MSG=$(node ganymede.js license-verify)
if [[ $LICENSE_MSG == "GANYMEDE_LICENSE_NOT_VALID" ]]; then
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
node ganymede.js param-file-init

find . -name '*.TEMPLATE.*' -delete;
rm -rf package.saved.json

npm install
