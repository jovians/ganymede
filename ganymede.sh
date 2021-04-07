#!/bin/bash

ACTION_NAME="$1"

NPM_BIN_DIR=$(which npm) # both system node and nvm support
NPM_DIR=${NPM_BIN_DIR::${#NPM_BIN_DIR}-8} # remove /bin/npm
NODE_MOULES_DIR="$NPM_DIR/lib/node_modules"
GANY_CLI_DIR="$NODE_MOULES_DIR/@jovian/ganymede-clr"

if [[ $ACTION_NAME == "" ]]; then
  echo "ERROR: ganymede cli requires at least one command line argument."
  exit 1
fi

if [[ $ACTION_NAME == "load" ]]; then
  bash "$GANY_CLI_DIR/ganymede.load.sh" "$2"

elif [[ $ACTION_NAME == "save" ]]; then
  bash "$GANY_CLI_DIR/ganymede.save.sh"

elif [[ $ACTION_NAME == "checkout" ]]; then
  if [[ "$2" == "" ]]; then
    echo "ERROR: gany checkout requires product name"
    exit 1
  fi
  PRODUCT_NAME=$(npm run --silent product-name)
  if [[ "$2" == "$PRODUCT_NAME" ]]; then
    echo "INFO: already on '$PRODUCT_NAME'"
    exit 0
  fi 
  bash "$GANY_CLI_DIR/ganymede.save.sh"
  bash "$GANY_CLI_DIR/ganymede.load.sh" "$2"

elif [[ $ACTION_NAME == "reset" ]]; then
  bash "$GANY_CLI_DIR/ganymede.reset.sh" "$2"

elif [[ $ACTION_NAME == "new" ]]; then
  if [[ "$2" == "" ]]; then
    echo "ERROR: gany new requires product name"
    exit 1
  fi
  echo "Creating new project '$2'..."
  bash "$GANY_CLI_DIR/ganymede.save.sh"
  bash "$GANY_CLI_DIR/ganymede.reset.sh" "$2"

elif [[ $ACTION_NAME == "update" ]]; then
  echo "Updating ganymede modules..."
  PRODUCT_NAME=$(npm run --silent product-name)
  bash "$GANY_CLI_DIR/ganymede.save.sh"
  bash "$GANY_CLI_DIR/ganymede.reset.sh"
  bash "$GANY_CLI_DIR/ganymede.load.sh" "$PRODUCT_NAME"

elif [[ $ACTION_NAME == "pwd" ]]; then
  pwd

elif [[ $ACTION_NAME == "cli" ]]; then
  if [ ! -f ganymede.conf.json ]; then
      echo "ERROR: Cannot execute scripts on working directory that doesn't have ganymede.conf.json file."
      exit 1
  fi
  node "$GANY_CLI_DIR/ganymede.js" "$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9"

else
  echo "ERROR unknown gany command '$ACTION_NAME'"

fi
