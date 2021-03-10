$_mod.def("/marko$5.3.0/src/runtime/vdom/VComponent", function(require, exports, module, __filename, __dirname) { var VNode = require('/marko$5.3.0/src/runtime/vdom/VNode'/*"./VNode"*/);
var inherit = require('/raptor-util$3.2.0/inherit'/*"raptor-util/inherit"*/);

function VComponent(component, key, ownerComponent, preserve) {
  this.___VNode(null /* childCount */, ownerComponent);
  this.___key = key;
  this.___component = component;
  this.___preserve = preserve;
}

VComponent.prototype = {
  ___nodeType: 2
};

inherit(VComponent, VNode);

module.exports = VComponent;

});