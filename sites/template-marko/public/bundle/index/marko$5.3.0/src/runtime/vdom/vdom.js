$_mod.def("/marko$5.3.0/src/runtime/vdom/vdom", function(require, exports, module, __filename, __dirname) { var VNode = require('/marko$5.3.0/src/runtime/vdom/VNode'/*"./VNode"*/);
var VDocumentFragment = require('/marko$5.3.0/src/runtime/vdom/VDocumentFragment'/*"./VDocumentFragment"*/);
var VElement = require('/marko$5.3.0/src/runtime/vdom/VElement'/*"./VElement"*/);
var VText = require('/marko$5.3.0/src/runtime/vdom/VText'/*"./VText"*/);
var VComponent = require('/marko$5.3.0/src/runtime/vdom/VComponent'/*"./VComponent"*/);
var VFragment = require('/marko$5.3.0/src/runtime/vdom/VFragment'/*"./VFragment"*/);
var parseHTML = require('/marko$5.3.0/src/runtime/vdom/parse-html'/*"./parse-html"*/);

var defaultDocument = typeof document != "undefined" && document;
var specialHtmlRegexp = /[&<]/;

function virtualizeChildNodes(node, vdomParent, ownerComponent) {
  var curChild = node.firstChild;
  while (curChild) {
    vdomParent.___appendChild(virtualize(curChild, ownerComponent));
    curChild = curChild.nextSibling;
  }
}

function virtualize(node, ownerComponent) {
  switch (node.nodeType) {
    case 1:
      return VElement.___virtualize(node, virtualizeChildNodes, ownerComponent);
    case 3:
      return new VText(node.nodeValue, ownerComponent);
    case 11:
      var vdomDocFragment = new VDocumentFragment();
      virtualizeChildNodes(node, vdomDocFragment, ownerComponent);
      return vdomDocFragment;
  }
}

function virtualizeHTML(html, doc, ownerComponent) {
  if (!specialHtmlRegexp.test(html)) {
    return new VText(html, ownerComponent);
  }

  var vdomFragment = new VDocumentFragment();
  var curChild = parseHTML(html);

  while (curChild) {
    vdomFragment.___appendChild(virtualize(curChild, ownerComponent));
    curChild = curChild.nextSibling;
  }

  return vdomFragment;
}

var Node_prototype = VNode.prototype;

/**
 * Shorthand method for creating and appending a Text node with a given value
 * @param  {String} value The text value for the new Text node
 */
Node_prototype.t = function(value) {
  var type = typeof value;
  var vdomNode;

  if (type !== "string") {
    if (value == null) {
      value = "";
    } else if (type === "object") {
      if (value.toHTML) {
        vdomNode = virtualizeHTML(value.toHTML(), document);
      }
    }
  }

  this.___appendChild(vdomNode || new VText(value.toString()));
  return this.___finishChild();
};

Node_prototype.___appendDocumentFragment = function() {
  return this.___appendChild(new VDocumentFragment());
};

exports.___VDocumentFragment = VDocumentFragment;
exports.___VElement = VElement;
exports.___VText = VText;
exports.___VComponent = VComponent;
exports.___VFragment = VFragment;
exports.___virtualize = virtualize;
exports.___virtualizeHTML = virtualizeHTML;
exports.___defaultDocument = defaultDocument;

});