/* streamlined */ var sys = require("sys");
/* streamlined */ var web = require("../deps/web");
/* streamlined */ var exec = require("child_process").exec;
/* streamlined */ var spawn = require("child_process").spawn;
/* streamlined */ module.exports = function(conf) {
/* streamlined */     var self = this;
/* streamlined */     var minecraft_server_process = spawn("java", [("-Xms" + conf.start_memory),("-Xmx" + conf.max_memory),"-jar","minecraft_server.jar","nogui",], {
/* streamlined */         cwd: conf.path
/* streamlined */     });
/* streamlined */     minecraft_server_process.stdout.on("data", function(data) {
/* streamlined */         data.toString().split("\n").forEach(function(line) {
/* streamlined */             if (line.length) {
/* streamlined */                 self.emit("info", line);
/* streamlined */             };
/* streamlined */         });
/* streamlined */     });
/* streamlined */     minecraft_server_process.stderr.on("data", function(data) {
/* streamlined */         data.toString().split("\n").forEach(function(line) {
/* streamlined */             if (line.length) {
/* streamlined */                 self.emit("info", line);
/* streamlined */             };
/* streamlined */         });
/* streamlined */     });
/* streamlined */     minecraft_server_process.on("error", function(err) {
/* streamlined */         self.emit("error", err);
/* streamlined */     });
/* streamlined */     minecraft_server_process.on("exit", function() {
/* streamlined */         self.emit("exit");
/* streamlined */     });
/* streamlined */     self.on("info", function(line) {
/* streamlined */         var match, s;
/* streamlined */         if (match = line.match(/^[0-9-]+ [0-9:]+ \[INFO\] (.+)\s*$/)) {
/* streamlined */             info = match[1];
/* streamlined */             if (match = info.match(/^(\w+) \[\/(\d+\.\d+\.\d+\.\d+)\:(\d+)\] logged in with entity id (\d+)$/)) {
/* streamlined */                 var name = match[1];
/* streamlined */                 var ip = match[2];
/* streamlined */                 var port = match[3];
/* streamlined */                 var entity_id = match[4];
/* streamlined */                 return self.emit("connected", name, ip, port, entity_id);
/* streamlined */             }
/* streamlined */         ;
/* streamlined */             if (match = info.match(/^(\w+) lost connection: (.*)$/)) {
/* streamlined */                 var name = match[1];
/* streamlined */                 var reason = match[2];
/* streamlined */                 return self.emit("disconnected", name, reason);
/* streamlined */             }
/* streamlined */         ;
/* streamlined */             if (match = info.match(/^Connected players: (.*)$/)) {
/* streamlined */                 var list = match[1];
/* streamlined */                 return self.emit("list", list);
/* streamlined */             }
/* streamlined */         ;
/* streamlined */             if ((info === "Done! For help, type \"help\" or \"?\"")) {
/* streamlined */                 return self.emit("ready");
/* streamlined */             }
/* streamlined */         ;
/* streamlined */         }
/* streamlined */     ;
/* streamlined */     });
/* streamlined */     self.kill = function() {
/* streamlined */         minecraft_server_process.kill();
/* streamlined */     };
/* streamlined */     self.exec = function(cmd) {
/* streamlined */         minecraft_server_process.stdin.write((cmd + "\n"));
/* streamlined */     };
/* streamlined */     self.kick = function(player) {
/* streamlined */         self.exec(("kick " + player.name));
/* streamlined */     };
/* streamlined */     self.ban = function(player) {
/* streamlined */         self.exec(("ban " + player.name));
/* streamlined */     };
/* streamlined */     self.pardon = function(player) {
/* streamlined */         self.exec(("pardon " + player.name));
/* streamlined */     };
/* streamlined */     self.ban_ip = function(ip) {
/* streamlined */         self.exec(("ban-ip " + ip));
/* streamlined */     };
/* streamlined */     self.pardon_ip = function(ip) {
/* streamlined */         self.exec(("pardon-ip " + ip));
/* streamlined */     };
/* streamlined */     self.op = function(player) {
/* streamlined */         self.exec(("op " + player.name));
/* streamlined */     };
/* streamlined */     self.deop = function(player) {
/* streamlined */         self.exec(("deop " + player.name));
/* streamlined */     };
/* streamlined */     self.teleport = function(player1, player2) {
/* streamlined */         self.exec(((("tp " + player1.name) + " ") + player2.name));
/* streamlined */     };
/* streamlined */     self.give = function(player, item, quantity) {
/* streamlined */         self.exec(((((("give " + player.name) + " ") + item.id) + " ") + quantity));
/* streamlined */     };
/* streamlined */     self.tell = function(player, message) {
/* streamlined */         self.exec(((("tell " + player.name) + " ") + message));
/* streamlined */     };
/* streamlined */     self.stop = function() {
/* streamlined */         self.exec("stop");
/* streamlined */     };
/* streamlined */     self.save_all = function() {
/* streamlined */         self.exec("save_all");
/* streamlined */     };
/* streamlined */     self.list = function() {
/* streamlined */         self.exec("list");
/* streamlined */     };
/* streamlined */     self.say = function(message) {
/* streamlined */         self.exec(("say " + message));
/* streamlined */     };
/* streamlined */ };
/* streamlined */ sys.inherits(module.exports, require("events").EventEmitter);function __cb(_, fn){
/* streamlined */ 		return function(err, result){
/* streamlined */ 			if (err) 
/* streamlined */ 				return _(err);
/* streamlined */ 			try {
/* streamlined */ 				return fn(result);
/* streamlined */ 			} 
/* streamlined */ 			catch (ex) {
/* streamlined */ 				return _(ex)
/* streamlined */ 			}
/* streamlined */ 		}
/* streamlined */ 	}