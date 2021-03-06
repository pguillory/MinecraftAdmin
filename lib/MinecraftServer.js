var sys = require("sys");
var web = require("../deps/web");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
exports.server = function(conf) {
    var self = this;
    var minecraft_server_process = spawn("java", [("-Xms" + conf.start_memory),("-Xmx" + conf.max_memory),"-jar","minecraft_server.jar","nogui",], {
        cwd: conf.path
    });
    minecraft_server_process.stdout.on("data", function(data) {
        data.toString().split("\n").forEach(function(line) {
            if (line.length) {
                self.emit("info", line);
            };
        });
    });
    minecraft_server_process.stderr.on("data", function(data) {
        data.toString().split("\n").forEach(function(line) {
            if (line.length) {
                self.emit("info", line);
            };
        });
    });
    minecraft_server_process.on("error", function(err) {
        self.emit("error", err);
    });
    minecraft_server_process.on("exit", function() {
        self.emit("exit");
    });
    self.on("info", function(line) {
        var match, s;
        if (match = line.match(/^[0-9-]+ [0-9:]+ \[INFO\] (.+)\s*$/)) {
            info = match[1];
            if (match = info.match(/^(\w+) \[\/(\d+\.\d+\.\d+\.\d+)\:(\d+)\] logged in with entity id (\d+)$/)) {
                var name = match[1];
                var ip = match[2];
                var port = match[3];
                var entity_id = match[4];
                return self.emit("connected", name, ip, port, entity_id);
            }
        ;
            if (match = info.match(/^(\w+) lost connection: (.*)$/)) {
                var name = match[1];
                var reason = match[2];
                return self.emit("disconnected", name, reason);
            }
        ;
            if (match = info.match(/^Connected players: (.*)$/)) {
                var list = match[1];
                return self.emit("list", list);
            }
        ;
            if ((info === "Done! For help, type \"help\" or \"?\"")) {
                return self.emit("ready");
            }
        ;
        }
    ;
    });
    self.kill = function() {
        minecraft_server_process.kill();
    };
    self.exec = function(cmd) {
        minecraft_server_process.stdin.write((cmd + "\n"));
    };
    self.kick = function(player) {
        self.exec(("kick " + player.name));
    };
    self.ban = function(player) {
        self.exec(("ban " + player.name));
    };
    self.pardon = function(player) {
        self.exec(("pardon " + player.name));
    };
    self.ban_ip = function(ip) {
        self.exec(("ban-ip " + ip));
    };
    self.pardon_ip = function(ip) {
        self.exec(("pardon-ip " + ip));
    };
    self.op = function(player) {
        self.exec(("op " + player.name));
    };
    self.deop = function(player) {
        self.exec(("deop " + player.name));
    };
    self.teleport = function(player1, player2) {
        self.exec(((("tp " + player1.name) + " ") + player2.name));
    };
    self.give = function(player, item, quantity) {
        self.exec(((((("give " + player.name) + " ") + item.id) + " ") + quantity));
    };
    self.tell = function(player, message) {
        self.exec(((("tell " + player.name) + " ") + message));
    };
    self.stop = function() {
        self.exec("stop");
    };
    self.save_all = function() {
        self.exec("save-all");
    };
    self.save_off = function() {
        self.exec("save-off");
    };
    self.save_on = function() {
        self.exec("save-on");
    };
    self.list = function() {
        self.exec("list");
    };
    self.say = function(message) {
        self.exec(("say " + message));
    };
};
sys.inherits(exports.server, require("events").EventEmitter);
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
