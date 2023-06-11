"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
getData();
function getData() {
  fetch('https://frontend.tabling.co.kr/v1/store/9533/reservations').then(function (response) {
    return response.json();
  }).then(function (data) {
    states.reservations = data.reservations;
    renderers.listItem();
    renderers.detail();
  }).catch(function (error) {
    console.error(error);
  });
}
var states = {
  reservations: [],
  detailId: -1
};
var functions = {
  itemBtnClick: function itemBtnClick(event, id) {
    event.stopPropagation();
    var item = states.reservations.find(function (r) {
      return r.id == id;
    });
    switch (item.status) {
      case 'reserved':
        item.status = 'seated';
        break;
      case 'seated':
        item.status = 'done';
        break;
    }
    renderers.listItem();
    renderers.detail();
  },
  itemClick: function itemClick(id) {
    states.detailId = id;
    if (window.innerWidth >= 1024) {
      renderers.detail();
    } else {
      renderers.detailMobile();
    }
  }
};
var renderers = {
  listItem: function listItem() {
    /** 예약 목록 */
    var list = states.reservations;
    var elements = list.filter(function (l) {
      return l.status !== 'done';
    }).map(function (l) {
      return components.ListItem(l);
    });
    elements = elements.length ? elements : [components.NoData()];
    renderContainer.apply(void 0, ['#ReservationList'].concat(_toConsumableArray(elements)));
  },
  detail: function detail() {
    var _list$find;
    /** 예약 정보 */
    var list = states.reservations.filter(function (r) {
      return r.status !== 'done';
    });
    var data = (_list$find = list.find(function (r) {
      return r.id === states.detailId;
    })) !== null && _list$find !== void 0 ? _list$find : list[0];
    var element = data ? components.Detail(data) : components.NoData();
    renderContainer('#ReservationDetail', element);
  },
  detailMobile: function detailMobile() {
    var _states$reservations$;
    /** 예약 정보(모바일)*/
    var data = (_states$reservations$ = states.reservations.find(function (r) {
      return r.id === states.detailId;
    })) !== null && _states$reservations$ !== void 0 ? _states$reservations$ : states.reservations[0];
    var element = components.Detail(data);
    var rootContainer = document.querySelector('#Tabling');
    var overlay = components.Overlay();
    var close = function close() {
      overlay.remove();
      container.classList.remove('active');
    };
    var detailHeader = components.DetailHeader({
      close: close
    });
    overlay.onclick = function () {
      return close();
    };
    var container = renderContainer('#ReservationDetailMobile', detailHeader, element);
    container.classList.add('active');
    rootContainer.prepend(overlay);
  }
};
var components = {
  NoData: function NoData() {
    /** 데이터 없음 */
    return createElement('<p>정보가 없습니다.</p>');
  },
  Overlay: function Overlay() {
    /** Dim 영역 */
    return createElement(null, {
      className: 'overlay'
    });
  },
  DetailHeader: function DetailHeader(_ref) {
    var close = _ref.close;
    /** 예약 정보 모바일 헤더 */
    var button = createElement('닫기', {
      elementType: 'button'
    });
    button.onclick = function () {
      return close();
    };
    return createElement(null, {
      className: 'header',
      children: button
    });
  },
  ListItem: function ListItem(data) {
    /** 예약 목록 아이템 */
    var id = data.id,
      tables = data.tables,
      menus = data.menus,
      _data$customer = data.customer,
      adult = _data$customer.adult,
      child = _data$customer.child,
      name = _data$customer.name;
    var tableName = tables.map(function (t) {
      return t.name;
    }).join(', ');
    var menuesName = menus.map(function (m) {
      return "".concat(m.name, "(").concat(m.qty, ")");
    }).join(', ');
    var statusName = '';
    switch (data.status) {
      case 'reserved':
        statusName = '착석';
        break;
      case 'seated':
        statusName = '퇴석';
        break;
    }
    var template = "\n    <label>\uC2DC\uAC04<br/>\uC0C1\uD0DC</label>\n    <div class=\"content\">\n      <p class=\"ellipsis\">".concat(name, " - ").concat(tableName, "</p>\n      <p>\uC131\uC778 ").concat(formatNumber(adult), " \uC544\uC774 ").concat(formatNumber(child), "</p>\n      <p class=\"ellipsis\">").concat(menuesName, "</p>\n    </div>\n    <div class=\"btn-wrapper\">\n      <button class=\"btn ").concat(data.status === 'reserved' && 'btn-lined', "\" onclick=\"functions.itemBtnClick(event, ").concat(id, ")\">\n        ").concat(statusName, "\n      </button>\n    </div>\n    ");
    var element = createElement(template, {
      className: 'list-item card'
    });
    element.onclick = function () {
      return functions.itemClick(id);
    };
    return element;
  },
  Detail: function Detail(data) {
    /** 예약 정보 컨텐츠 */
    var _data$customer2 = data.customer,
      name = _data$customer2.name,
      level = _data$customer2.level,
      memo = _data$customer2.memo,
      request = _data$customer2.request,
      timeRegistered = data.timeRegistered,
      timeReserved = data.timeReserved;
    var statusName = '';
    switch (data.status) {
      case 'reserved':
        statusName = '예약';
        break;
      case 'seated':
        statusName = '착석 중';
        break;
      case 'done':
        statusName = '끝';
        break;
    }
    var template = "\n                <h3>\uC608\uC57D \uC815\uBCF4</h3>\n                  <div class=\"table-item\">\n                    <label for=\"\">\uC608\uC57D \uC0C1\uD0DC</label>\n                    <p>".concat(statusName, "</p>\n                  </div>\n                  <div class=\"table-item\">\n                    <label for=\"\">\uC608\uC57D \uC2DC\uAC04</label>\n                    <p>").concat(formatDate(timeReserved), "</p>\n                  </div>\n                  <div class=\"table-item\">\n                    <label for=\"\">\uC811\uC218 \uC2DC\uAC04</label>\n                    <p>").concat(formatDate(timeRegistered), "</p>\n                  </div>\n                </div>\n                <h3>\uACE0\uAC1D \uC815\uBCF4</h3>\n                <div class=\"table\">\n                  <div class=\"table-item\">\n                    <label for=\"\">\uACE0\uAC1D \uC131\uBA85</label>\n                    <p>").concat(name, "</p>\n                  </div>\n                  <div class=\"table-item\">\n                    <label for=\"\">\uACE0\uAC1D \uB4F1\uAE09</label>\n                    <p>").concat(level, "</p>\n                  </div>\n                  <div class=\"table-item\">\n                    <label for=\"\">\uACE0\uAC1D \uBA54\uBAA8</label>\n                    <p class=\"ellipsis-3\">").concat(memo, "</p>\n                  </div>\n                  <div class=\"table-item\">\n                  <label for=\"\">\uC694\uCCAD\uC0AC\uD56D</label>\n                  <p>").concat(request, "</p>\n                </div>\n    ");
    return createElement(template, {
      className: 'card'
    });
  }
};
function renderContainer(selector) {
  var container = document.querySelector(selector);
  container.innerHTML = '';
  for (var _len = arguments.length, elements = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    elements[_key - 1] = arguments[_key];
  }
  container.append.apply(container, elements);
  return container;
}
function createElement(template) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref2$elementType = _ref2.elementType,
    elementType = _ref2$elementType === void 0 ? 'div' : _ref2$elementType,
    className = _ref2.className,
    children = _ref2.children;
  var item = document.createElement(elementType);
  item.className = className;
  if (template) {
    item.innerHTML = template;
  }
  if (children) {
    item.appendChild(children);
  }
  return item;
}
function formatNumber(number) {
  return String(number).padStart(2, '0');
}
function formatDate(date) {
  return date.slice(0, -3);
}
