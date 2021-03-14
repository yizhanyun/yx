$_mod.def("/marko$5.3.0/src/runtime/helpers/style-value", function(require, exports, module, __filename, __dirname) { "use strict";

var changeCase = require('/marko$5.3.0/src/runtime/helpers/_change-case'/*"./_change-case"*/);

/**
 * Helper for generating the string for a style attribute
 */
module.exports = function styleHelper(style) {
  if (!style) {
    return null;
  }

  var type = typeof style;

  if (type !== "string") {
    var styles = "";

    if (Array.isArray(style)) {
      for (var i = 0, len = style.length; i < len; i++) {
        var next = styleHelper(style[i]);
        if (next) styles += next + (next[next.length - 1] !== ";" ? ";" : "");
      }
    } else if (type === "object") {
      for (var name in style) {
        var value = style[name];
        if (value != null) {
          if (typeof value === "number" && value) {
            value += "px";
          }

          styles += changeCase.___camelToDashCase(name) + ":" + value + ";";
        }
      }
    }

    return styles || null;
  }

  return style;
};

});