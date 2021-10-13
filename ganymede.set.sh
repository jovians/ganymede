#!/bin/bash

VERSION="$1"

if [ -z "$VERSION" ]; then
    VERSION="latest"
fi

if [ ! -f ganymede.conf.json ]; then
    echo "ERROR: Cannot execute scripts on working directory that doesn't have ganymede.conf.json file."
    exit 1
fi

npm install "@jovian/ganymede-clr@$VERSION" --save-dev
rm -rf src/app/ganymede
rsync -r node_modules/@jovian/ganymede-clr/* src/app/ganymede
rm -rf src/app/ganymede/node_modules
npm uninstall @jovian/ganymede-clr
