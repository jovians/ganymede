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
  sh "$GANY_CLI_DIR/ganymede.load.sh" "$2"
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

if [[ $ACTION_NAME == "cli" ]]; then
  if [ ! -f ganymede.conf.json ]; then
      echo "ERROR: Cannot execute scripts on working directory that doesn't have ganymede.conf.json file."
      exit 1
  fi
  node "$GANY_CLI_DIR/ganymede.js" "$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9"
fi
