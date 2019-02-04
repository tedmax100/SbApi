import * as http from "http";
import App from "./app";
require('events').EventEmitter.prototype._maxListeners = 0;
process.setMaxListeners(0);
const _moduleTag = "index";
// -->Set: port
// var port = normalizePort(process.argv[3] || '443');
// const port = normalizePort(8999);
const port = normalizePort(process.argv[3] || "8999");
App.set("port", port);

// -->Set: headers
App.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next();
});
http.globalAgent.maxSockets = Infinity;
const server = http.createServer(App);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val: number|string): number|string|boolean {
    // tslint:disable-next-line:no-shadowed-variable
    let port: number = (typeof val === "string") ? parseInt(val, 10) : val;
    if (isNaN(port)) { return val; } else if (port >= 0) { return port; } else { return false; }
}

function onError(error: NodeJS.ErrnoException): void {
    const _funTag = _moduleTag + "_Push";
    if (error.syscall !== "listen") { throw error; }
    let bind = (typeof port === "string") ? "Pipe " + port : "Port " + port;
    switch (error.code) {
        case "EACCES":
            process.exit(1);
            break;
        case "EADDRINUSE":
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    let addr = server.address();
    let bind = (typeof addr === "string") ? `pipe ${addr}` : `port ${addr.port}`;
}
