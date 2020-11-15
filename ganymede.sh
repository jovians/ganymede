if [ ! -d "ganymede" ]; then
  git clone git@github.com:jovians/ganymede.git
fi

cd ganymede;
echo "Pulling latest Ganymede source..."
git pull;
cd ../;

cp ganymede/ganymede.js ganymede.js
LICENSE_MSG=$(node ganymede.js license-verify)
if [ $LICENSE_MSG == "GANYMEDE_LICENSE_NOT_VALID" ]; then
  echo "Ganymede license is not valid; aborting."
  exit
fi

cp package.json package.saved.json
rsync -r ganymede/template/* .
rm -rf ganymede

cd src/app;
if [ ! -d "ganymede" ]; then
  git clone git@github.com:jovians/ganymede.git
fi
git pull;
# rm -rf ganymede/template/*;
# rm -rf ganymede/app/*;
cd ../../;

node ganymede.js appset
node ganymede.js packages-update
node ganymede.js template-load

# find . -name '*.TEMPLATE.*' -delete;
rm -rf package.saved.json

npm install
