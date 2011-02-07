#!/bin/bash
cd `dirname $0`
cd ../deps
rm -rf *
git clone git@github.com:pguillory/node-iniconf.git iniconf
git clone https://github.com/mozilla/narcissus.git
git clone https://github.com/Sage/streamlinejs.git
git clone git@github.com:pguillory/node-web.git web
find . -name .git | xargs rm -rf
git add .
git ls-files -d -z | xargs -0 git update-index --remove
