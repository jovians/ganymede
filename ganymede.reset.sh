#!/bin/bash

NEW_NAME="$1"

if [ ! -f ganymede.conf.json ]; then
    echo "ERROR: Cannot execute scripts on working directory that doesn't have ganymede.conf.json file."
    exit 1
fi

if [ -f src/app/ganymede/.ganysource ]; then
    echo "Real Ganymede source; will only reset softly"
    SOFT_RESET="soft" # if this is master genymede, no need to wipe out
fi

if [[ $SOFT_RESET != "soft" ]]; then
  echo "Deleting all ganymede workspace files..."
  mkdir -p profiles

  rm -rf node_modules
  mkdir -p node_modules

  rm -rf src
  mkdir -p src/app/ganymede

  npm install @jovian/ganymede-clr@latest --save-dev
  cp -R node_modules/@jovian/ganymede-clr/* src/app/ganymede
fi

LANGSTER_INSTALLED=$(node -p "try{typeof require('@jovian/langster')==='object'}catch(e){''}")
if [[ $LANGSTER_INSTALLED != "true" ]]; then
  echo "Installing dependency... [ @jovian/langster ]"
  npm install @jovian/langster --save-dev
fi

echo "Syncing all ganymede workspace files..."
rsync -r src/app/ganymede/template/* .
rsync -r src/app/ganymede/defaults/* .

cp node_modules/@jovian/ganymede-clr/template/.gitignore2 .gitignore

if [[ $NEW_NAME != "" ]]; then
  gany cli product-name-set "$NEW_NAME"
fi

echo "Setting app-specific parameters..."
gany cli appset
gany cli template-load

find . -name '*.TEMPLATE.*' -delete;

npm install

npm i typescript@3.7.4

if [ ! -f src/global.scss ]; then
  touch src/global.scss
fi
