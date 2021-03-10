$_mod.def("/marko$5.3.0/src/runtime/queueMicrotask", function(require, exports, module, __filename, __dirname) { var promise;
module.exports =
  typeof queueMicrotask === "function"
    ? queueMicrotask
    : typeof Promise === "function" && (promise = Promise.resolve())
    ? function(cb) {
        promise.then(cb).catch(rethrow);
      }
    : setTimeout;
function rethrow(err) {
  setTimeout(function() {
    throw err;
  });
}

});