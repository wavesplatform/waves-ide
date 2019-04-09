#!/usr/bin/env bash

if [ -z "$1" ];
then
    echo 'Using current IDE branch'

else
    echo "Using IDE branch/commit: $1"
    git checkout $1
fi

if [ -z "$2" ];
    then echo "Using compiler from package.json"
    npm unlink --no-save @waves/ride-js
else
    echo "Using compiler from NODE branch/commit: $2"
    mkdir temp
    cd temp
    git clone 'http://github.com/wavesplatform/waves'
    cd waves
    git checkout $2
    sbt langJS/fullOptJS
    cd ..
    git clone 'https://github.com/wavesplatform/ride-js'
    cp waves/lang/js/target/lang-opt.js ride-js/src
    cd ride-js
    npm i
    npm run build
    npm link
    cd ../../
    npm link @waves/ride-js
fi

npm run buildMonaco
npm run dist prod