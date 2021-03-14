$_mod.def("/marko$5.3.0/src/runtime/setImmediate", function(require, exports, module, __filename, __dirname) { module.exports =
  global.setImmediate ||
  (function() {
    var queue = [];
    var win = window;
    var msg = "" + Math.random();
    win.addEventListener("message", function(ev) {
      if (ev.data === msg) {
        var callbacks = queue;
        queue = [];
        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i]();
        }
      }
    });
    return function(callback) {
      if (queue.push(callback) === 1) {
        win.postMessage(msg, "*");
      }
    };
  })();

});