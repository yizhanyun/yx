$_mod.def("/duosite$0.1.4/sites/template-marko/components/app-hello.marko", function(require, exports, module, __filename, __dirname) { // Compiled using marko@5.3.0 - DO NOT EDIT
"use strict";

exports.__esModule = true;
exports.default = void 0;

var _renderer = _interopRequireDefault(require('/marko$5.3.0/src/runtime/components/renderer'/*"marko/src/runtime/components/renderer"*/));

var _vdom = require('/marko$5.3.0/src/runtime/vdom/index'/*"marko/src/runtime/vdom"*/);

var _registryBrowser = require('/marko$5.3.0/src/runtime/components/registry-browser'/*"marko/src/runtime/components/registry-browser"*/);

var _defineComponent = _interopRequireDefault(require('/marko$5.3.0/src/runtime/components/defineComponent'/*"marko/src/runtime/components/defineComponent"*/));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _marko_template = (0, _vdom.t)();

var _default = _marko_template;
exports.default = _default;

const _marko_componentType = (0, _registryBrowser.r)("sites/template-marko/components/app-hello.marko", () => _marko_template),
      _marko_component = {
  onCreate() {
    this.state = {
      count: 0
    };
  },

  onMount() {
    console.log("Mounted in the browser!");
  },

  increment() {
    this.state.count++;
  }

};

_marko_template._ = (0, _renderer.default)(function (input, out, _component, component, state) {
  out.be("p", null, "0", component, null, 0);
  out.t("Hello ", component);
  out.t(input.name, component);
  out.ee();
  out.be("div", {
    "class": "count"
  }, "1", component, null, 1);
  out.t(state.count, component);
  out.ee();
  out.be("button", {
    "type": "button",
    "class": "example-button"
  }, "2", component, null, 0, {
    "onclick": _component.d("click", "increment", false)
  });
  out.t("Click me", component);
  out.ee();
}, {
  t: _marko_componentType,
  d: true
}, _marko_component);
_marko_template.Component = (0, _defineComponent.default)(_marko_component, _marko_template._);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2ZxeWUvcHJvamVjdHMvZHVvc2l0ZS1tb25vL2R1b3NpdGUvc2l0ZXMvdGVtcGxhdGUtbWFya28vY29tcG9uZW50cy9hcHAtaGVsbG8ubWFya28iXSwibmFtZXMiOlsib25DcmVhdGUiLCJzdGF0ZSIsImNvdW50Iiwib25Nb3VudCIsImNvbnNvbGUiLCJsb2ciLCJpbmNyZW1lbnQiLCJpbnB1dCIsIm5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0FBLEVBQUFBLFEsR0FBVztBQUNYLFNBQUtDLEtBQUwsR0FBYTtBQUNiQyxNQUFBQSxLQUFLLEVBQUU7QUFETSxLQUFiO0FBR0MsRzs7QUFDREMsRUFBQUEsTyxHQUFVO0FBQ1ZDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHlCQUFaO0FBQ0MsRzs7QUFDREMsRUFBQUEsUyxHQUFZO0FBQ1osU0FBS0wsS0FBTCxDQUFXQyxLQUFYO0FBQ0M7Ozs7O0FBY0E7QUFBRTtBQUFNLFFBQUVLLEtBQUssQ0FBQ0MsSUFBUjs7QUFFUjtBQUFBO0FBQUE7QUFDRyxRQUFFUCxLQUFLLENBQUNDLEtBQVI7O0FBR0g7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQ0FBNEMsV0FBNUM7QUFBQTtBQUNJIiwic291cmNlc0NvbnRlbnQiOlsiPCEtLSA8YXBwLWhlbGxvPiBpcyBvbmx5IHZpc2libGUgdG8gY29tcG9uZW50cyB3aXRoaW4gcGFnZXMvaG9tZSAtLT5cblxuY2xhc3Mge1xub25DcmVhdGUoKSB7XG50aGlzLnN0YXRlID0ge1xuY291bnQ6IDBcbn1cbn1cbm9uTW91bnQoKSB7XG5jb25zb2xlLmxvZyhcIk1vdW50ZWQgaW4gdGhlIGJyb3dzZXIhXCIpO1xufVxuaW5jcmVtZW50KCkge1xudGhpcy5zdGF0ZS5jb3VudCsrO1xufVxufVxuXG5zdHlsZSB7XG4uY291bnQge1xuY29sb3I6IzA5YztcbmZvbnQtc2l6ZTozZW07XG59XG4uZXhhbXBsZS1idXR0b24ge1xuZm9udC1zaXplOjFlbTtcbnBhZGRpbmc6MC41ZW07XG59XG59XG5cbjxwPkhlbGxvICR7aW5wdXQubmFtZX08L3A+XG5cbjxkaXYuY291bnQ+XG4gICAgJHtzdGF0ZS5jb3VudH1cbjwvZGl2PlxuXG48YnV0dG9uLmV4YW1wbGUtYnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbi1jbGljayhcImluY3JlbWVudFwiKT5cbiAgICBDbGljayBtZVxuPC9idXR0b24+XG5cbiJdfQ==
});