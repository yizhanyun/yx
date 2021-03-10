$_mod.def("/marko$5.3.0/src/runtime/vdom/parse-html", function(require, exports, module, __filename, __dirname) { var parseHTML = function(html) {
  var container = document.createElement("template");
  parseHTML = container.content
    ? function(html) {
        container.innerHTML = html;
        return container.content;
      }
    : function(html) {
        container.innerHTML = html;
        return container;
      };

  return parseHTML(html);
};

module.exports = function(html) {
  return parseHTML(html).firstChild;
};

});