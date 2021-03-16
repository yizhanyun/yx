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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2ZxeWUvcHJvamVjdHMvZHVvc2l0ZS1tb25vL25vZGVfbW9kdWxlcy9tYXJrby9jb21wb25lbnRzLWJyb3dzZXIubWFya28iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIjxtb2R1bGUtY29kZShmdW5jdGlvbihyZXF1aXJlLCBvcHRzKSB7XG4gICAgdmFyIGZpbGUgPSBgXCIuLyR7b3B0cy5vcHRpbWl6ZSA/IFwiZGlzdFwiIDogXCJzcmNcIn0vcnVudGltZS9jb21wb25lbnRzXCJgO1xuXG4gICAgaWYgKG9wdHMubW9kdWxlID09PSBcImNqc1wiKSB7XG4gICAgICAgIHJldHVybiBgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCR7ZmlsZX0pO1xcbmA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGBleHBvcnQgeyBkZWZhdWx0IH0gZnJvbSAke2ZpbGV9O1xcbmV4cG9ydCAqIGZyb20gJHtmaWxlfTtcXG5gO1xuICAgIH1cbn0pLz5cblxuLy8gV2hhdCdzIGdvaW5nIG9uIGhlcmU/IFdlIGFyZSB1c2luZyBNYXJrbyB0byBkbyBKYXZhU2NyaXB0IGNvZGUgZ2VuZXJhdGlvblxuLy8gZHVyaW5nIHRoZSBtb2R1bGUgYnVuZGxpbmcgcGhhc2UgdG8gY29uZGl0aW9uYWxseSBleHBvcnQgZWl0aGVyIHRoZVxuLy8gXCJzcmNcIiBvciB0aGUgXCJkaXN0XCIgZm9sZGVyIGJhc2VkIG9uIHdoZXRoZXIgb3Igbm90IHdlIGFyZSBkb2luZyBhXG4vLyBkZWJ1ZyBvciBub24tZGVidWcgYnVpbGQuIFdlIGFyZSB1c2luZyBNYXJrbyBzaW5jZSB3ZSBrbm93IHRoZSBNYXJrbyBjb21waWxlclxuLy8gaXMgZW5hYmxlZCBhbHJlYWR5IChubyBleHRyYSBiYWJlbCB0cmFuc2Zvcm0gcmVxdWlyZWQpLlxuIl19
});