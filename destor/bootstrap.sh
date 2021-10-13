#!/bin/bash
nginx
node --max-old-space-size=262144 destor.entrypoint.js
