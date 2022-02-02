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

if [[ $ACTION_NAME == "h" ]] || [[ $ACTION_NAME == "help" ]]; then
  echo "set load save reset new update pwd cli cli-update"

elif [[ $ACTION_NAME == "load" ]]; then
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

elif [[ $ACTION_NAME == "set" ]]; then
  bash "$GANY_CLI_DIR/ganymede.set.sh" "$2"

elif [[ $ACTION_NAME == "reset" ]]; then
  bash "$GANY_CLI_DIR/ganymede.reset.sh" "$2"

elif [[ $ACTION_NAME == "new" ]]; then
  if [[ "$2" == "" ]]; then
    echo "ERROR: gany new requires project slug"
    exit 1
  fi
  PROJECT_SLUG="$2"
  if [ -d "$PROJECT_SLUG" ]; then
    echo "ERROR: project directory '$PROJECT_SLUG' already exists."
    exit 1
  fi
  echo "Creating new project '$PROJECT_SLUG'..."
  mkdir -p "$PROJECT_SLUG"
  cd "$PROJECT_SLUG"
  cp "$GANY_CLI_DIR/defaults/ganymede.conf.default.json" "ganymede.conf.json"
  sed -i '' "s/<DEFAULT_GANY_CONF_APP_SLUG>/$PROJECT_SLUG/g" "ganymede.conf.json"
  bash "$GANY_CLI_DIR/ganymede.reset.sh" "$2"
  echo "New ganymede project created on $PROJECT_SLUG"

elif [[ $ACTION_NAME == "update" ]]; then
  echo "Updating ganymede modules..."
  PRODUCT_NAME=$(npm run --silent product-name)
  bash "$GANY_CLI_DIR/ganymede.save.sh"
  bash "$GANY_CLI_DIR/ganymede.reset.sh"
  bash "$GANY_CLI_DIR/ganymede.load.sh" "$PRODUCT_NAME"

elif [[ $ACTION_NAME == "pwd" ]]; then
  pwd

elif [[ $ACTION_NAME == "cli" ]]; then
  node "$GANY_CLI_DIR/ganymede.js" "$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9" "${10}" "${11}" "${12}" "${13}" "${14}" "${15}" "${16}" "${17}" "${18}" "${19}" "${20}"

elif [[ $ACTION_NAME == "cli-update" ]]; then
  echo "Updating ganymede cli package..."
  npm i -g @jovian/ganymede-clr  

else
  echo "ERROR unknown gany command '$ACTION_NAME'"

fi
