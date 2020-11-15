git clone git@github.com:jovians/ganymede.git
cd ganymede; git pull;
cd ../;

cp package.json package.saved.json
rsync -r ganymede/template/* .

cp ganymede/ganymede.js ganymede.js

node ganymede.js appset
node ganymede.js packages-update

npm install
