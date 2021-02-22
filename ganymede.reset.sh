#! /bin/sh

mkdir -p profiles

rm -rf node_modules
mkdir -p node_modules

rm -rf src
mkdir -p src/app/ganymede

npm install @jovian/ganymede-clr@latest --save-dev

cp -R node_modules/@jovian/ganymede-clr/* src/app/ganymede

LANGSTER_INSTALLED=$(node -p "try{typeof require('@jovian/langster')==='object'}catch(e){''}")
if [[ $LANGSTER_INSTALLED != "true" ]]; then
  echo "Installing dependency... [ @jovian/langster ]"
  npm install @jovian/langster --save-dev
fi

cp src/app/ganymede/ganymede.js ganymede.js

cp package.json package.saved.json
rsync -r src/app/ganymede/template/* .
rsync -r src/app/ganymede/defaults/* .

cp node_modules/@jovian/ganymede-clr/template/.gitignore2 .gitignore

if [ ! -f "src/app/global.scss" ]; then
  touch src/app/global.scss
fi

node ganymede.js appset
node ganymede.js license-stamp
node ganymede.js template-load

find . -name '*.TEMPLATE.*' -delete;

npm install

npm i typescript@3.7.4
