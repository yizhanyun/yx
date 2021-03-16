$_mod.def("/marko$5.3.0/src/runtime/helpers/class-value", function(require, exports, module, __filename, __dirname) { "use strict";

module.exports = function classHelper(arg) {
  switch (typeof arg) {
    case "string":
      return arg || null;
    case "object":
      var result = "";
      var sep = "";

      if (Array.isArray(arg)) {
        for (var i = 0, len = arg.length; i < len; i++) {
          var value = classHelper(arg[i]);
          if (value) {
            result += sep + value;
            sep = " ";
          }
        }
      } else {
        for (var key in arg) {
          if (arg[key]) {
            result += sep + key;
            sep = " ";
          }
        }
      }

      return result || null;

    default:
      return null;
  }
};

});