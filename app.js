// ---- 저장소 키
const STORAGE_KEY = "friends_v1";
const VERSION_KEY = "friends:version";     // ✨ 추가: 버전 저장 키

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

// ---- 저장/불러오기
function saveFriends(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function loadFriends() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED.slice();
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
    return SEED.slice();
  }
}

// 전역 데이터 (※ 부트스트랩에서 채움)
let friends = [];

// ---- 유틸
function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .map(p => p[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ---- 자동 초기화(버전 체크 + 강제 리셋 쿼리)
function resetToSeed() {
  localStorage.setItem(VERSION_KEY, APP_VERSION);
  saveFriends(SEED);
  friends = SEED.slice();
}
function bootstrapVersion() {
  const params = new URLSearchParams(location.search);

  // 1) URL로 강제 초기화 (?reset=1)
  if (params.get("reset") === "1") {
    resetToSeed();
    return;
  }

  // 2) 버전 체크 - 다르면 SEED로 교체
  const currentVer = localStorage.getItem(VERSION_KEY);
  if (currentVer !== APP_VERSION) {
    resetToSeed();
  } else {
    // 3) 버전 동일: 저장소가 비어있으면 채우기, 아니면 그대로
    if (!localStorage.getItem(STORAGE_KEY)) {
      saveFriends(SEED);
    }
    friends = loadFriends();
  }
}

// ---- 목록 렌더(행 전체 클릭 → view.html?id=...)
function renderTable() {
  const tbody = document.getElementById("list-body");
  if (!tbody) return;

  tbody.innerHTML = friends
    .map(f => {
      const avatar = f.avatar
        ? `<img src="${esc(f.avatar)}" alt="" class="avatar">`
        : `<span class="avatar avatar-initials">${esc(initials(f.name))}</span>`;
      return `
        <tr class="friend-row" data-id="${esc(f.id)}" tabindex="0">
          <td class="cell-avatar">${avatar}</td>
          <td class="cell-name"   data-label="Name">${esc(f.name)}</td>
          <td class="cell-phone"  data-label="Phone">${esc(f.phone || "")}</td>
          <td class="cell-email"  data-label="Email">${esc(f.email || "")}</td>
          <td class="cell-bday"   data-label="Birthday">${esc(f.birthday || "")}</td>
        </tr>
      `;
    })
    .join("");

  document.querySelectorAll(".friend-row").forEach(row => {
    row.addEventListener("click", () => {
      const id = row.dataset.id;
      window.location.href = `view.html?id=${encodeURIComponent(id)}`;
    });
    row.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        row.click();
      }
    });
  });
}

// ---- 상세 보기(3열 카드, 버튼 중앙 + 너비 통일)
function renderView() {
  const wrap = document.getElementById("view-wrap");
  if (!wrap) return;

  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    wrap.innerHTML = `<p>No data selected <a href="index.html">List</a></p>`;
    return;
  }

  const f = friends.find(x => x.id === id);
  if (!f) {
    wrap.innerHTML = `<p>ID <code>${esc(id)}</code> No data <a href="index.html">List</a></p>`;
    return;
  }

  wrap.innerHTML = `
    <div class="kv-grid">
      <div class="kv"><div class="k">Name</div><div class="v">${esc(f.name || "")}</div></div>
      <div class="kv"><div class="k">Phone</div><div class="v">${esc(f.phone || "")}</div></div>
      <div class="kv"><div class="k">Email</div><div class="v">${esc(f.email || "")}</div></div>
      <div class="kv"><div class="k">Birthday</div><div class="v">${esc(f.birthday || "")}</div></div>
      <div class="kv"><div class="k">Address</div><div class="v">${esc(f.address || "")}</div></div>
      <div class="kv"><div class="k">Relation</div><div class="v">${esc(f.relation || "")}</div></div>
    </div>

    <div class="uk-margin-top action-bar">
      <a class="uk-button uk-button-primary btn-eq" href="edit.html?id=${encodeURIComponent(f.id)}">Edit</a>
      <button id="delBtn" class="uk-button uk-button-danger btn-eq">Delete</button>
    </div>
  `;

  const del = document.getElementById("delBtn");
  if (del) {
    del.onclick = () => {
      if (confirm("Delete?")) {
        friends = friends.filter(x => x.id !== id);
        saveFriends(friends);
        alert("Deleted");
        location.href = "index.html";
      }
    };
  }
}

// ---- 추가
function bindAdd() {
  const form = document.getElementById("add-form");
  if (!form) return;

  form.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.relation || !data.phone || !data.email) {
      alert("Fill out the requirements");
      return;
    }
    data.id = "F" + Date.now();
    friends.push(data);
    saveFriends(friends);
    alert("Added");
    location.href = "index.html";
  };
}

// ---- 수정
function bindEdit() {
  const form = document.getElementById("edit-form");
  if (!form) return;

  const id = new URLSearchParams(location.search).get("id");
  const f = friends.find(x => x.id === id);
  if (!f) {
    form.innerHTML = "<p>No data</p>";
    return;
  }

  form.name.value      = f.name || "";
  form.phone.value     = f.phone || "";
  form.email.value     = f.email || "";
  form.birthday.value  = f.birthday || "";
  form.address.value   = f.address || "";
  form.relation.value  = f.relation || "";

  form.onsubmit = e => {
    e.preventDefault();
    if (confirm("Edit?")) {
      f.name      = form.name.value;
      f.phone     = form.phone.value;
      f.email     = form.email.value;
      f.birthday  = form.birthday.value;
      f.address   = form.address.value;
      f.relation  = form.relation.value;

      saveFriends(friends);
      alert("Edited");
      location.href = "view.html?id=" + encodeURIComponent(id);
    }
  };
}

// ---- 초기화(렌더 전에 버전 부트스트랩!)
document.addEventListener("DOMContentLoaded", () => {
  bootstrapVersion();   // ✨ 여기서 friends 세팅/초기화 끝냄

  renderTable();  // index에만 적용됨(없으면 패스)
  renderView();   // view에만 적용됨(없으면 패스)
  bindAdd();      // add에만 적용
  bindEdit();     // edit에만 적용
});
