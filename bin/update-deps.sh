#!/bin/bash
set -e
cd `dirname $0`
cd ..
rm -rf deps-temp
mkdir deps-temp
pushd deps-temp
git clone git@github.com:pguillory/node-iniconf.git  iniconf
git clone https://github.com/mozilla/narcissus.git   narcissus
git clone https://github.com/Sage/streamlinejs.git   streamlinejs
git clone git@github.com:pguillory/node-web.git      web
find . -name .git | xargs rm -rf
popd
rm -rf deps
mv deps-temp deps
git add .
git ls-files -d -z | xargs -0 git update-index --remove
