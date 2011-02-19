var Minecraft = require("./.");
var iniconf = require("./deps/iniconf");
var path = require("path");
var sys = require("sys");
var conf = iniconf.readFileSync(path.join(__dirname, "config", "config.ini"));
iniconf.validate(conf, {
    MinecraftAdmin: {
        port: "number:80"
    },
    Minecraft: {
        path: "string",
        start_memory: "string:1024M",
        max_memory: "string:1024M"
    },
    MinecraftOverviewer: {
        path: "string",
        PYTHONPATH: "string",
        map_path: "string",
        cache_path: "string",
        run_every_seconds: "number:60"
    }
});
new Minecraft.AdminServer(conf);
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
