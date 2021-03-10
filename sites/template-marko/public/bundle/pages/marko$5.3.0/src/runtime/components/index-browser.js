$_mod.def("/marko$5.3.0/src/runtime/components/index-browser", function(require, exports, module, __filename, __dirname) { var componentsUtil = require('/marko$5.3.0/src/runtime/components/util-browser'/*"./util"*/);
var initComponents = require('/marko$5.3.0/src/runtime/components/init-components-browser'/*"./init-components"*/);
var registry = require('/marko$5.3.0/src/runtime/components/registry-browser'/*"./registry"*/);

require('/marko$5.3.0/src/runtime/components/ComponentsContext'/*"./ComponentsContext"*/).___initClientRendered =
  initComponents.___initClientRendered;

exports.getComponentForEl = componentsUtil.___getComponentForEl;
exports.init = window.$initComponents = initComponents.___initServerRendered;

exports.register = function(id, component) {
  registry.r(id, function() {
    return component;
  });
};

});