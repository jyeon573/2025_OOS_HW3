// ---- 저장소 키
const STORAGE_KEY = "friends_v1";    // localStorage에 저장할 이름  

// ---- 초기 샘플
const SEED = [
  { id: "F001", name: "Reynie Muldoon", relation: "Friend",
    phone: "010-1111-2222", email: "reynie@benedict.org",
    birthday: "2005-03-15", address: "Stonetown", avatar: "" },

  { id: "F002", name: "Sticky Washington", relation: "Friend",
    phone: "010-3333-4444", email: "sticky@benedict.org",
    birthday: "2005-07-21", address: "Stonetown", avatar: "" },

  { id: "F003", name: "Kate Wetherall", relation: "Friend",
    phone: "010-5555-6666", email: "kate@benedict.org",
    birthday: "2004-11-05", address: "Stonetown", avatar: "" },

  { id: "F004", name: "Constance Contraire", relation: "Friend",
    phone: "010-7777-8888", email: "constance@benedict.org",
    birthday: "2016-01-30", address: "Stonetown", avatar: "" },

  { id: "F005", name: "Mr. Benedict", relation: "Mentor",
    phone: "010-9999-0000", email: "benedict@benedict.org",
    birthday: "1969-06-09", address: "Stonetown", avatar: "" },

  { id: "F006", name: "Number Two", relation: "Colleague",
    phone: "010-1212-3434", email: "numbertwo@benedict.org",
    birthday: "1970-04-18", address: "Stonetown", avatar: "" },

  { id: "F007", name: "Rhonda Kazembe", relation: "Colleague",
    phone: "010-5656-7878", email: "rhonda@benedict.org",
    birthday: "1988-09-12", address: "Stonetown", avatar: "" },

  { id: "F008", name: "Milligan", relation: "Guardian",
    phone: "010-9090-1010", email: "milligan@benedict.org",
    birthday: "1988-12-25", address: "Stonetown", avatar: "" }
];


// ---- 앱 버전 (데이터 바꾸면 숫자 올리기)
const APP_VERSION = "4";

// ---- 저장/불러오기 함수
function saveFriends(list) {
  // 배열을 JSON 문자열로 변환해서 localStorage에 저장
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadFriends() {
  // 저장된 데이터 꺼내오기
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // 없으면 기본 데이터(SEED) 저장 후 반환
    saveFriends(SEED);
    return SEED.slice();
  }
  // 있으면 문자열 → 객체로 변환해서 반환
  return JSON.parse(raw);
}

// 전역 데이터 (화면에서 사용할 친구 목록)
let friends = loadFriends();

// ---- 유틸 함수
function esc(s) {
  // HTML 특수문자 막기용 (간단하게만 사용)
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function initials(name) {
  // 이름에서 앞 두 글자만 추출해서 대문자로
  const parts = name.trim().split(" ");
  let result = "";
  for (let p of parts) {
    result += p[0];
  }
  return result.substring(0, 2).toUpperCase();
}

// ---- 목록 화면 그리기 (index.html)
function renderTable() {
  const tbody = document.getElementById("list-body");
  if (!tbody) return;

  tbody.innerHTML = friends.map(f => {
    const avatar = f.avatar
      ? `<img src="${esc(f.avatar)}" alt="" class="avatar">`
      : `<span class="avatar avatar-initials">${esc(initials(f.name))}</span>`;
    return `
      <tr class="friend-row" data-id="${esc(f.id)}">
        <td>${avatar}</td>
        <td>${esc(f.name)}</td>
        <td>${esc(f.phone || "")}</td>
        <td>${esc(f.email || "")}</td>
        <td>${esc(f.birthday || "")}</td>
      </tr>
    `;
  }).join("");

  // 각 행을 클릭하면 상세보기 페이지로 이동
  document.querySelectorAll(".friend-row").forEach(row => {
    row.addEventListener("click", () => {
      const id = row.dataset.id;
      window.location.href = "view.html?id=" + encodeURIComponent(id);
    });
  });
}

// ---- 상세 보기 (view.html)
function renderView() {
  const wrap = document.getElementById("view-wrap");
  if (!wrap) return;

  const id = new URLSearchParams(location.search).get("id");
  const f = friends.find(x => x.id === id);

  if (!f) {
    wrap.innerHTML = "<p>No data</p>";
    return;
  }

  wrap.innerHTML = `
    <div class="kv-grid">
      <div>Name: ${esc(f.name)}</div>
      <div>Phone: ${esc(f.phone)}</div>
      <div>Email: ${esc(f.email)}</div>
      <div>Birthday: ${esc(f.birthday)}</div>
      <div>Address: ${esc(f.address)}</div>
      <div>Relation: ${esc(f.relation)}</div>
    </div>
    <div class="action-bar">
      <a href="edit.html?id=${encodeURIComponent(f.id)}">Edit</a>
      <button id="delBtn">Delete</button>
    </div>
  `;

  // 삭제 버튼 처리
  const del = document.getElementById("delBtn");
  if (del) {
    del.onclick = () => {
      if (confirm("Delete?")) {
        friends = friends.filter(x => x.id !== id);
        saveFriends(friends);
        location.href = "index.html";
      }
    };
  }
}

// ---- 추가 (add.html)
function bindAdd() {
  const form = document.getElementById("add-form");
  if (!form) return;

  form.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    // 필수 입력 확인
    if (!data.name || !data.relation || !data.phone || !data.email) {
      alert("Fill out the requirements");
      return;
    }

    data.id = "F" + Date.now();  // 고유 ID 생성
    friends.push(data);
    saveFriends(friends);
    location.href = "index.html";
  };
}

// ---- 수정 (edit.html)
function bindEdit() {
  const form = document.getElementById("edit-form");
  if (!form) return;

  const id = new URLSearchParams(location.search).get("id");
  const f = friends.find(x => x.id === id);
  if (!f) {
    form.innerHTML = "<p>No data</p>";
    return;
  }

  // 기존 값 채워넣기
  form.name.value = f.name;
  form.phone.value = f.phone;
  form.email.value = f.email;
  form.birthday.value = f.birthday;
  form.address.value = f.address;
  form.relation.value = f.relation;

  // 저장 버튼 처리
  form.onsubmit = e => {
    e.preventDefault();
    f.name = form.name.value;
    f.phone = form.phone.value;
    f.email = form.email.value;
    f.birthday = form.birthday.value;
    f.address = form.address.value;
    f.relation = form.relation.value;

    saveFriends(friends);
    location.href = "view.html?id=" + encodeURIComponent(id);
  };
}

// ---- 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
  renderTable();  // index 페이지
  renderView();   // view 페이지
  bindAdd();      // add 페이지
  bindEdit();     // edit 페이지
});