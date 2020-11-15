git clone git@github.com:jovians/ganymede.git
cd ganymede; git pull;
cd ../;

cp package.json package.saved.json
rm -rf src/app/ganymede/*;
rsync -r ganymede/template/* .

cp ganymede/ganymede.js ganymede.js

node ganymede.js appset
node ganymede.js packages-update

find . -name '*.TEMPLATE.*' -delete;
rm -rf package.saved.json

npm install
