var sys = require("sys");
var web = require("../deps/web");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var path = require("path");
var Minecraft = require("..");
exports.server = function(conf) {
    var connected_players = {
    };
    var connected_player_list = "";
    var minecraft_server = start_minecraft_server();
    var web_server = start_web_server();
    function start_web_server() {
        console.log("Starting web server");
        var server = web.createServer([web.log(),{
            "/": function(request, response) {
                response.writeHead(200, {
                    "content-type": "text/html"
                });
                response.end((((("<h1>Minecraft server</h1>" + "<ul>") + "<li><a href=\"/map/\">Map</a></li>") + "<li><a href=\"/api/\">API</a></li>") + "</ul>"));
            },
            "/api": {
                "/": function(request, response, __callback_2) {
                    __callback_2 = (__callback_2 || __throw_1);
                    return __callback_2(null, {
                        connected_players: connected_players,
                        connected_player_list: connected_player_list,
                        time: new Time().toString()
                    });
                },
                "/players": {
                    "/": function(request, response, __callback_3) {
                        __callback_3 = (__callback_3 || __throw_1);
                        return __callback_3(null, connected_players);
                    },
                    ":player": [function(request, response, __callback_4) {
                        __callback_4 = (__callback_4 || __throw_1);
                        request.player = get_player_by_name(request.query.player);
                        return __callback_4(null);
                    },{
                        "/items": {
                            POST: function(request, response, __callback_5) {
                                __callback_5 = (__callback_5 || __throw_1);
                                var item = get_item_by_name("apple");
                                minecraft_server.give(request.player, item, 1);
                                return __callback_5(null, ((("gave " + request.player.name) + " a ") + item.name));
                            }
                        }
                    },]
                }
            },
            "/map/": web.static(conf.MinecraftOverviewer.map_path)
        },]);
        server.listen(conf.MinecraftAdmin.port);
        console.log(("Listening to port " + conf.MinecraftAdmin.port));
        return server;
    };
    function get_item_by_name(name) {
        var item = Minecraft.items[name];
        if (!item) {
            throw new Error((("Item " + name) + " not found"))
        };
        return item;
    };
    function get_player_by_name(name) {
        var player = connected_players[name];
        if (!player) {
            throw new Error((("Player " + name) + " not found"))
        };
        return player;
    };
    function start_minecraft_server() {
        var server = new Minecraft.Server(conf.Minecraft);
        server.on("connected", function(name, ip, port, entity_id) {
            var player = {
                name: name,
                ip: ip,
                port: port,
                entity_id: entity_id
            };
            connected_players[name] = player;
            server.say(("Welcome, " + player.name));
            server.tell(player, "Here, have an apple");
            server.give(player, get_item_by_name("apple"), 1);
            server.list();
        });
        server.on("disconnected", function(name, reason) {
            delete connected_players[name];
            server.say(("Goodbye, " + name));
            server.list();
        });
        server.on("info", function(info) {
            console.log(info);
        });
        server.on("list", function(list) {
            connected_player_list = list;
        });
        server.on("ready", function() {
            console.log("Server ready!");
        });
        server.on("exit", function() {
            console.log("Minecraft exited");
            process.exit();
        });
        process.on("exit", function() {
            server.kill();
        });
        return server;
    };
    function generate_map() {
        console.log("Generating map...");
        var overviewer_process = spawn("python", [path.join(conf.MinecraftOverviewer.path, "gmap.py"),"--cachedir",conf.MinecraftOverviewer.cache_path,path.join(conf.Minecraft.path, "world"),conf.MinecraftOverviewer.map_path,], {
            cwd: path.join(__dirname, "../static"),
            env: {
                HOME: process.env.HOME,
                PYTHONPATH: conf.MinecraftOverviewer.PYTHONPATH
            }
        });
        overviewer_process.stderr.on("data", function(data) {
            data.toString().split("\n").forEach(function(line) {
                if (line.length) {
                    console.log(("Overviewer: " + line));
                }
            ;
            });
        });
        process.on("exit", kill);
        overviewer_process.on("exit", function() {
            process.removeListener("exit", kill);
            console.log("Finished generating map");
            setTimeout(generate_map, (conf.MinecraftOverviewer.run_every_seconds * 1000));
        });
        function kill() {
            overviewer_process.kill();
        };
    };
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
