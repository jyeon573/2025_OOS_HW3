/* =========================
   app.js — Friends CRUD (localStorage)
   요구사항:
   - index.html: Name → view.html?id=... 링크, 컬럼 순서 Name/Birthday/Phone/Email/Relation
   - view.html: 상세 보기(읽기 전용) + 우상단 Edit로 이동
   - add.html: 추가 후 index.html로
   - edit.html: 상단 Save, 하단 Delete
   ========================= */

// ---- Storage helpers ----
const KEY = 'friends';

function getFriends() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}
function setFriends(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---- URL helper ----
function q(name) {
  return new URLSearchParams(location.search).get(name);
}

// ---- Format helpers ----
function fmtDate(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return '';
  // 필요하면 여기서 2000-05-12 -> 2000.05.12로 바꿔도 됨
  return yyyy_mm_dd;
}

// ---- XSS 방지용 간단 escape ----
function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[s]
  ));
}

// ---- Seed (최초 실행 시 예시 1건) ----
(function ensureSeed() {
  const data = getFriends();
  if (data.length === 0) {
    setFriends([
      {
        id: genId(),
        name: '홍길동',
        birthday: '2000-05-12',
        phone: '010-1234-5678',
        email: 'hong@example.com',
        relation: 'Friend'
      }
    ]);
  }
})();

// ---- 라우팅: 페이지별 초기화 ----
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname;

  // index.html 또는 루트
  if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
    renderList();
    return;
  }

  if (path.endsWith('view.html')) {
    renderView();
    return;
  }

  if (path.endsWith('add.html')) {
    bindAddForm();
    return;
  }

  if (path.endsWith('edit.html')) {
    bindEditForm();
    return;
  }
});

// ======================
// index.html: 목록 렌더
// ======================
function renderList() {
  const tbody = document.getElementById('list-body');
  if (!tbody) return;

  let list = getFriends();

  // 이름 기준 오름차순 정렬 (한글 비교)
  list = list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));

  // 컬럼 순서: Name → Birthday → Phone → Email → Relation
  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-5">
          아직 친구가 없어요. 우측 상단 <strong>+ Add</strong>로 추가해보세요.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><a href="view.html?id=${f.id}" class="text-decoration-none">${escapeHTML(f.name)}</a></td>
      <td>${fmtDate(f.birthday)}</td>
      <td>${escapeHTML(f.phone)}</td>
      <td>${escapeHTML(f.email)}</td>
      <td>${escapeHTML(f.relation)}</td>
    </tr>
  `).join('');
}

// ======================
// view.html: 상세보기(읽기)
// ======================
function renderView() {
  const id = q('id');
  const data = getFriends();
  const target = data.find(x => x.id === id);
  const dl = document.getElementById('friend-detail');
  const editLink = document.getElementById('edit-link');

  if (!dl) return;

  if (!target) {
    dl.innerHTML = `<div class="alert alert-danger">존재하지 않는 항목입니다.</div>`;
    if (editLink) {
      editLink.classList.add('disabled');
      editLink.setAttribute('aria-disabled', 'true');
    }
    return;
  }

  dl.innerHTML = `
    <dt class="fw-semibold">Name</dt><dd>${escapeHTML(target.name)}</dd>
    <dt class="fw-semibold">Birthday</dt><dd>${fmtDate(target.birthday)}</dd>
    <dt class="fw-semibold">Phone</dt><dd>${escapeHTML(target.phone)}</dd>
    <dt class="fw-semibold">Email</dt><dd>${escapeHTML(target.email)}</dd>
    <dt class="fw-semibold">Relation</dt><dd>${escapeHTML(target.relation)}</dd>
  `;

  if (editLink) {
    editLink.href = `edit.html?id=${target.id}`;
  }
}

// ======================
// add.html: 추가 핸들링
// ======================
function bindAddForm() {
  const form = document.getElementById('add-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const item = {
      id: genId(),
      name: (fd.get('name') || '').toString().trim(),
      relation: (fd.get('relation') || '').toString().trim(),
      phone: (fd.get('phone') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      birthday: (fd.get('birthday') || '').toString()
    };

    if (!item.name) {
      alert('Name은 필수입니다.');
      return;
    }

    const list = getFriends();
    list.push(item);
    setFriends(list);

    // 추가 후 목록으로
    location.href = 'index.html';
  });
}

// ======================
// edit.html: 수정/삭제
// ======================
function bindEditForm() {
  const id = q('id');
  const form = document.getElementById('edit-form');
  const delBtn = document.getElementById('delete-btn');
  const saveBtn = document.getElementById('save-btn');

  const list = getFriends();
  const target = list.find(x => x.id === id);

  if (!form || !target) {
    alert('존재하지 않는 항목입니다.');
    location.href = 'index.html';
    return;
  }

  // 기존 값 세팅
  form.name.value = target.name || '';
  form.relation.value = target.relation || '';
  form.phone.value = target.phone || '';
  form.email.value = target.email || '';
  form.birthday.value = target.birthday || '';

  // 저장(폼 submit)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    target.name = (fd.get('name') || '').toString().trim();
    target.relation = (fd.get('relation') || '').toString().trim();
    target.phone = (fd.get('phone') || '').toString().trim();
    target.email = (fd.get('email') || '').toString().trim();
    target.birthday = (fd.get('birthday') || '').toString();

    if (!target.name) {
      alert('Name은 필수입니다.');
      return;
    }

    setFriends(list);
    // 저장 후 목록으로
    location.href = 'index.html';
  });

  // 상단 Save 버튼이 별도인 경우
  if (saveBtn) {
    saveBtn.addEventListener('click', () => form.requestSubmit());
  }

  // 삭제
  if (delBtn) {
    delBtn.addEventListener('click', () => {
      if (!confirm('정말 삭제할까요?')) return;
      const next = list.filter(x => x.id !== id);
      setFriends(next);
      location.href = 'index.html';
    });
  }
}
