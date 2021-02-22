ACTION_NAME="$1"

NPM_BIN_DIR=$(which npm)
NPM_DIR=${NPM_BIN_DIR::${#NPM_BIN_DIR}-8}
NODE_MOULES_DIR="$NPM_DIR/lib/node_modules"
GANY_CLI_DIR="$NODE_MOULES_DIR/@jovian/ganymede-clr"

if [[ $ACTION_NAME == "" ]]; then
  echo "ERROR: ganymede cli requires at least one command line argument."
  exit 1
fi

if [[ $ACTION_NAME == "load" ]]; then
  sh "$GANY_CLI_DIR/ganymede.load.sh"
fi

if [[ $ACTION_NAME == "save" ]]; then
  sh "$GANY_CLI_DIR/ganymede.save.sh"
fi

if [[ $ACTION_NAME == "reset" ]]; then
  sh "$GANY_CLI_DIR/ganymede.reset.sh" "$2"
fi

if [[ $ACTION_NAME == "pwd" ]]; then
  pwd
fi
