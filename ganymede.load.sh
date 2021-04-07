#!/bin/bash

PRODUCT_NAME="$1"

if [ ! -f ganymede.conf.json ]; then
    echo "ERROR: Cannot execute scripts on working directory that doesn't have ganymede.conf.json file."
    exit 1
fi

if [[ $PRODUCT_NAME == "" ]]; then
  echo "ERROR: gany load requires product name."
  exit 1
fi

if [[ ! -d "profiles/$PRODUCT_NAME" ]]; then
  echo "ERROR: cannot find saved profile called '$PRODUCT_NAME'"
  exit 2
fi

echo "Cleaning product content folders... (assets, assets-root, routes, user-custom)"
rm -rf "src/assets/*"
rm -rf "src/assets-root/*"
rm -rf "src/app/routes/*"
rm -rf "src/app/user-custom/*"

echo "Loading product profile '$PRODUCT_NAME'..."

cp -R profiles/$PRODUCT_NAME/* .

echo "Loaded '$PRODUCT_NAME'"
