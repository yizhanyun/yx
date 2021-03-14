$_mod.def("/marko$5.3.0/components-browser.marko", function(require, exports, module, __filename, __dirname) { "use strict";

exports.__esModule = true;
var _exportNames = {};
exports.default = void 0;

var _components = _interopRequireWildcard(require('/marko$5.3.0/src/runtime/components/index-browser'/*"./src/runtime/components"*/));

exports.default = _components.default;
Object.keys(_components).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _components[key]) return;
  exports[key] = _components[key];
});

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2ZxeWUvcHJvamVjdHMvZHVvc2l0ZS1tb25vL2R1b3NpdGUvc2l0ZXMvdGVtcGxhdGUtbWFya28tdGFpbHdpbmQvbm9kZV9tb2R1bGVzL21hcmtvL2NvbXBvbmVudHMtYnJvd3Nlci5tYXJrbyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiPG1vZHVsZS1jb2RlKGZ1bmN0aW9uKHJlcXVpcmUsIG9wdHMpIHtcbiAgICB2YXIgZmlsZSA9IGBcIi4vJHtvcHRzLm9wdGltaXplID8gXCJkaXN0XCIgOiBcInNyY1wifS9ydW50aW1lL2NvbXBvbmVudHNcImA7XG5cbiAgICBpZiAob3B0cy5tb2R1bGUgPT09IFwiY2pzXCIpIHtcbiAgICAgICAgcmV0dXJuIGBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJHtmaWxlfSk7XFxuYDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYGV4cG9ydCB7IGRlZmF1bHQgfSBmcm9tICR7ZmlsZX07XFxuZXhwb3J0ICogZnJvbSAke2ZpbGV9O1xcbmA7XG4gICAgfVxufSkvPlxuXG4vLyBXaGF0J3MgZ29pbmcgb24gaGVyZT8gV2UgYXJlIHVzaW5nIE1hcmtvIHRvIGRvIEphdmFTY3JpcHQgY29kZSBnZW5lcmF0aW9uXG4vLyBkdXJpbmcgdGhlIG1vZHVsZSBidW5kbGluZyBwaGFzZSB0byBjb25kaXRpb25hbGx5IGV4cG9ydCBlaXRoZXIgdGhlXG4vLyBcInNyY1wiIG9yIHRoZSBcImRpc3RcIiBmb2xkZXIgYmFzZWQgb24gd2hldGhlciBvciBub3Qgd2UgYXJlIGRvaW5nIGFcbi8vIGRlYnVnIG9yIG5vbi1kZWJ1ZyBidWlsZC4gV2UgYXJlIHVzaW5nIE1hcmtvIHNpbmNlIHdlIGtub3cgdGhlIE1hcmtvIGNvbXBpbGVyXG4vLyBpcyBlbmFibGVkIGFscmVhZHkgKG5vIGV4dHJhIGJhYmVsIHRyYW5zZm9ybSByZXF1aXJlZCkuXG4iXX0=
});