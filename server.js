require('./ext/streamlinejs/lib/node-init.js')

var MinecraftAdmin = require('./.')
var iniconf = require('./ext/iniconf')
var path = require('path')
var sys = require('sys')

var conf = iniconf.parse_file(path.join(__dirname, 'config', 'config.ini'))
conf.MinecraftAdmin.port = conf.MinecraftAdmin.port || 80
conf.Minecraft.start_memory = conf.Minecraft.start_memory || '1024M'
conf.Minecraft.max_memory = conf.Minecraft.max_memory || '1024M'
conf.MinecraftOverviewer.map_path  = conf.MinecraftOverviewer.map_path || path.join(conf.Minecraft.path, 'map')
conf.MinecraftOverviewer.cache_path  = conf.MinecraftOverviewer.cache_path || path.join(conf.Minecraft.path, 'mapcache')
conf.MinecraftOverviewer.every_seconds  = conf.MinecraftOverviewer.every_seconds || 60

new MinecraftAdmin.Server(conf)
