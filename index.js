getData();

function getData() {
  fetch('https://frontend.tabling.co.kr/v1/store/9533/reservations')
  .then(response => response.json())
  .then(data => {
    states.reservations = data.reservations;
    renderers.listItem();
    renderers.detail();
  })
  .catch(error => {
    console.error(error);
  });
}

const states = {
  reservations: [],
  detailId: -1,
};

const functions = {
  itemBtnClick(event, id) {
    event.stopPropagation();
    let item = states.reservations.find(r => r.id == id);
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
  itemClick(id) {
    states.detailId = id;
    if (window.innerWidth >= 1024) {
      renderers.detail();
    } else {
      renderers.detailMobile();
    }
  }
}

const renderers = {
  listItem() { /** 예약 목록 */
    const list = states.reservations;
    let elements = list.filter(l => l.status !== 'done').map(l => components.ListItem(l));
    elements = elements.length ? elements : [components.NoData()];
    renderContainer('#ReservationList', ...elements);
  },
  detail() { /** 예약 정보 */
    const list = states.reservations.filter(r => r.status !== 'done');
    const data = list.find(r => r.id === states.detailId) ?? list[0];
    const element = data ? components.Detail(data) : components.NoData();
    renderContainer('#ReservationDetail', element);
  },
  detailMobile() { /** 예약 정보(모바일)*/
    const data = states.reservations.find(r => r.id === states.detailId) ?? states.reservations[0];

    const element = components.Detail(data);
    const rootContainer = document.querySelector('#Tabling');

    const overlay = components.Overlay();

    const close = () => {
      overlay.remove();
      container.classList.remove('active');
    }

    const detailHeader = components.DetailHeader({ close });
    overlay.onclick = () => close();

    const container = renderContainer('#ReservationDetailMobile', detailHeader, element);
    container.classList.add('active');
  
    rootContainer.prepend(overlay);
  }
}

const components = {
  NoData() { /** 데이터 없음 */
    return createElement('<p>정보가 없습니다.</p>');
  },
  Overlay() { /** Dim 영역 */
    return createElement(null, { className: 'overlay' });
  },
  DetailHeader({close}) { /** 예약 정보 모바일 헤더 */
    const button = createElement('닫기', { elementType: 'button' })
    button.onclick = () => close();
    return createElement(null, { className: 'header', children: button });
  },
  ListItem(data) { /** 예약 목록 아이템 */
    const { id, tables, menus, customer: {adult, child, name}} = data;
    const tableName = tables.map(t => t.name).join(', ');
    const menuesName = menus.map(m => `${m.name}(${m.qty})`).join(', ');
    let statusName = '';
    switch (data.status) {
      case 'reserved':
        statusName = '착석';
        break;
      case 'seated':
        statusName = '퇴석';
        break;
    }
    const template = `
    <label>시간<br/>상태</label>
    <div class="content">
      <p class="ellipsis">${name} - ${tableName}</p>
      <p>성인 ${formatNumber(adult)} 아이 ${formatNumber(child)}</p>
      <p class="ellipsis">${menuesName}</p>
    </div>
    <div class="btn-wrapper">
      <button class="btn ${data.status === 'reserved' && 'btn-lined'}" onclick="functions.itemBtnClick(event, ${id})">
        ${statusName}
      </button>
    </div>
    `;
    const element = createElement(template, { className: 'list-item card' });
    element.onclick = () => functions.itemClick(id);
    return element;
  },
  Detail(data) { /** 예약 정보 컨텐츠 */
    const { customer: {name, level, memo, request}, timeRegistered, timeReserved } = data;
    let statusName = '';
    switch (data.status) {
      case 'reserved':
        statusName = '예약';
        break;
      case 'seated':
        statusName = '착석 중';
        break;
      case 'done':
        statusName = '끝'
        break;
    }
    const template = `
                <h3>예약 정보</h3>
                  <div class="table-item">
                    <label for="">예약 상태</label>
                    <p>${statusName}</p>
                  </div>
                  <div class="table-item">
                    <label for="">예약 시간</label>
                    <p>${formatDate(timeReserved)}</p>
                  </div>
                  <div class="table-item">
                    <label for="">접수 시간</label>
                    <p>${formatDate(timeRegistered)}</p>
                  </div>
                </div>
                <h3>고객 정보</h3>
                <div class="table">
                  <div class="table-item">
                    <label for="">고객 성명</label>
                    <p>${name}</p>
                  </div>
                  <div class="table-item">
                    <label for="">고객 등급</label>
                    <p>${level}</p>
                  </div>
                  <div class="table-item">
                    <label for="">고객 메모</label>
                    <p class="ellipsis-3">${memo}</p>
                  </div>
                  <div class="table-item">
                  <label for="">요청사항</label>
                  <p>${request}</p>
                </div>
    `;
    return createElement(template, { className: 'card' });
  }
}

function renderContainer(selector, ...elements) {
  const container = document.querySelector(selector);
  container.innerHTML = '';
  container.append(...elements);
  return container;
}

function createElement(template, {elementType = 'div', className, children} = {}) {
  const item = document.createElement(elementType);
  item.className = className;
  if (template) {
    item.innerHTML = template;
  }
  if (children) {
    item.appendChild(children)
  }
  return item;
}

function formatNumber(number) {
  return String(number).padStart(2, '0')
}

function formatDate(date) {
  return date.slice(0, -3);
}