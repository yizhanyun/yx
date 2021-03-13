$_mod.def("/marko$5.3.0/src/runtime/vdom/VFragment", function(require, exports, module, __filename, __dirname) { var domData = require('/marko$5.3.0/src/runtime/components/dom-data'/*"../components/dom-data"*/);
var keysByDOMNode = domData.___keyByDOMNode;
var vElementByDOMNode = domData.___vElementByDOMNode;
var VNode = require('/marko$5.3.0/src/runtime/vdom/VNode'/*"./VNode"*/);
var inherit = require('/raptor-util$3.2.0/inherit'/*"raptor-util/inherit"*/);
var createFragmentNode = require('/marko$5.3.0/src/runtime/vdom/morphdom/fragment'/*"./morphdom/fragment"*/).___createFragmentNode;

function VFragment(key, ownerComponent, preserve) {
  this.___VNode(null /* childCount */, ownerComponent);
  this.___key = key;
  this.___preserve = preserve;
}

VFragment.prototype = {
  ___nodeType: 12,
  ___actualize: function() {
    var fragment = createFragmentNode();
    keysByDOMNode.set(fragment, this.___key);
    vElementByDOMNode.set(fragment, this);
    return fragment;
  }
};

inherit(VFragment, VNode);

module.exports = VFragment;

});