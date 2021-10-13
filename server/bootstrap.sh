#!/bin/bash
nginx
node --max-old-space-size=262144 ganymede.app.server.js
