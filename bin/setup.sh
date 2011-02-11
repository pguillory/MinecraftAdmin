#!/bin/bash
set -e
apt-get update; apt-get upgrade -y
apt-get install -y git subversion

echo "*** Installing Node.js v0.3.8"
apt-get -y install build-essential libssl-dev
cd /usr/local/src
wget http://nodejs.org/dist/node-v0.3.8.tar.gz
tar zxvf node-v0.3.8.tar.gz
cd node-v0.3.8
./configure
make; make install

echo "*** Installing Minecraft"
apt-get install -y openjdk-6-jre-headless
mkdir /mnt/minecraft
cd /mnt/minecraft
curl "http://www.minecraft.net/download/minecraft_server.jar" > minecraft_server.jar

echo "*** Installing Minecraft-Overviewer"
apt-get install -y python-numpy python-imaging
cd /mnt
git clone https://github.com/brownan/Minecraft-Overviewer.git
mkdir map
mkdir mapcache

echo "*** Installing MinecraftAdmin"
cd /mnt
git clone https://github.com/pguillory/MinecraftAdmin.git
cd MinecraftAdmin
cp config/config.ini-production config/config.ini
