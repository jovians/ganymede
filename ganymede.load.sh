#! /bin/sh

PRODUCT_NAME=$(npm run --silent product-name)

cp -R profiles/$PRODUCT_NAME/* .
