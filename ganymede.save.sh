#!/bin/bash

if [ ! -f ganymede.conf.json ]; then
    echo "ERROR: Cannot execute scripts on working directory that doesn't have ganymede.conf.json file."
    exit 1
fi

PRODUCT_NAME=$(npm run --silent product-name)

echo "Saving product profile '$PRODUCT_NAME'..."

mkdir -p "profiles/$PRODUCT_NAME"

mkdir -p "profiles/$PRODUCT_NAME/src/assets-root"
mkdir -p "profiles/$PRODUCT_NAME/src/assets/i18n"
mkdir -p "profiles/$PRODUCT_NAME/src/assets/img"
mkdir -p "profiles/$PRODUCT_NAME/src/assets/ico"
mkdir -p "profiles/$PRODUCT_NAME/src/assets/user-contents"
mkdir -p "profiles/$PRODUCT_NAME/src/assets/vid"
mkdir -p "profiles/$PRODUCT_NAME/src/assets/other"

mkdir -p "profiles/$PRODUCT_NAME/src/app/routes"
mkdir -p "profiles/$PRODUCT_NAME/src/app/user-custom"

cp "ganymede.app.ts" "profiles/$PRODUCT_NAME/ganymede.app.ts"
cp "ganymede.app.ui.ts" "profiles/$PRODUCT_NAME/ganymede.app.ui.ts"
cp "ganymede.app.server.ts" "profiles/$PRODUCT_NAME/ganymede.app.server.ts"
cp "ganymede.conf.json" "profiles/$PRODUCT_NAME/ganymede.conf.json"
cp "ganymede.secrets.json" "profiles/$PRODUCT_NAME/ganymede.secrets.json"

cp "README.md" "profiles/$PRODUCT_NAME/README.md"
cp ".gitignore" "profiles/$PRODUCT_NAME/.gitignore"
cp "angular.json" "profiles/$PRODUCT_NAME/angular.json"
cp "karma.conf.js" "profiles/$PRODUCT_NAME/karma.conf.js"
cp "package.json" "profiles/$PRODUCT_NAME/package.json"
cp "package-lock.json" "profiles/$PRODUCT_NAME/package-lock.json"

cp "src/index.html" "profiles/$PRODUCT_NAME/src/index.html"
cp "src/global.scss" "profiles/$PRODUCT_NAME/src/global.scss"
cp "src/variables.scss" "profiles/$PRODUCT_NAME/src/variables.scss"
cp "src/app/app.module.ts" "profiles/$PRODUCT_NAME/src/app/app.module.ts"

cp -R src/assets-root/* "profiles/$PRODUCT_NAME/src/assets-root"
cp -R src/assets/i18n/* "profiles/$PRODUCT_NAME/src/assets/i18n"
cp -R src/assets/img/* "profiles/$PRODUCT_NAME/src/assets/img"
cp -R src/assets/ico/* "profiles/$PRODUCT_NAME/src/assets/ico"
cp -R src/assets/user-contents/* "profiles/$PRODUCT_NAME/src/assets/user-contents"
cp -R src/assets/vid/* "profiles/$PRODUCT_NAME/src/assets/vid"
cp -R src/assets/other/* "profiles/$PRODUCT_NAME/src/assets/other"

cp -R src/app/routes/* "profiles/$PRODUCT_NAME/src/app/routes"
cp -R src/app/user-custom/* "profiles/$PRODUCT_NAME/src/app/user-custom"

echo "Saved to '$PRODUCT_NAME'"
