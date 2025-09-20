// ---- 저장소 키
const STORAGE_KEY = "friends_v1";

// ---- 초기 샘플 (처음 1번만 사용)
const SEED = [
    { id: "F001", name: "Hong Gil-dong", relation: "Friend", phone: "010-1234-5678", email: "hong@example.com", birthday: "2000-05-12", address: "Seoul", avatar: "" },
    { id: "F002", name: "Kim Hana", relation: "Sibling", phone: "010-2222-3333", email: "hana@example.com", birthday: "2001-08-30", address: "Busan", avatar: "" }
];

// ---- 저장/불러오기
function loadFriends() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED)); return SEED.slice(); }
        return JSON.parse(raw);
    } catch (e) { console.warn(e); return SEED.slice(); }
}
function saveFriends(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// 전역 데이터
let friends = loadFriends();

// ---- 유틸
function esc(s) { return String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function initials(name) {
    return String(name || "").trim().split(/\s+/).map(p => p[0] || "").join("").slice(0, 2).toUpperCase();
}

// ---- 목록 렌더 (너가 정한 컬럼 순서)
function renderTable() {
    const tbody = document.getElementById("list-body"); if (!tbody) return;
    tbody.innerHTML = friends.map(f => {
        const avatar = f.avatar ? `<img src="${esc(f.avatar)}" alt="" class="avatar">`
            : `<span class="avatar avatar-initials">${esc(initials(f.name))}</span>`;
        return `
      <tr>
        <td class="cell-avatar">${avatar}</td>
        <td class="cell-name"   data-label="Name"><a href="view.html?id=${encodeURIComponent(f.id)}">${esc(f.name)}</a></td>
        <td class="cell-phone"  data-label="Phone">${esc(f.phone || "")}</td>
        <td class="cell-email"  data-label="Email">${esc(f.email || "")}</td>
        <td class="cell-bday"   data-label="Birthday">${esc(f.birthday || "")}</td>
 </tr>
    `;
    }).join("");
}

// ---- 상세 보기
function renderView() {
    const wrap = document.getElementById("view-wrap"); if (!wrap) return;
    const id = new URLSearchParams(location.search).get("id");
    if (!id) { wrap.innerHTML = `<p>No data selected <a href="index.html">List</a></p>`; return; }
    const f = friends.find(x => x.id === id);
    if (!f) { wrap.innerHTML = `<p>ID <code>${esc(id)}</code> No data <a href="index.html">List</a></p>`; return; }

    wrap.innerHTML = `
    <dl class="uk-description-list">
      <dt>Name</dt><dd>${esc(f.name)}</dd>
      <dt>Phone</dt><dd>${esc(f.phone)}</dd>
      <dt>Email</dt><dd>${esc(f.email)}</dd>
      <dt>Birthday</dt><dd>${esc(f.birthday)}</dd>
      <dt>Address</dt><dd>${esc(f.address)}</dd>
      <dt>Relation</dt><dd>${esc(f.relation)}</dd>
    </dl>
    <div class="uk-margin-top">
      <a class="uk-button uk-button-primary" href="edit.html?id=${encodeURIComponent(f.id)}">Edit</a>
      <button id="delBtn" class="uk-button uk-button-danger">Delete</button>
      <a href="index.html" class="uk-button uk-button-default">Back</a>
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
    const form = document.getElementById("add-form"); if (!form) return;
    form.onsubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.name || !data.relation || !data.phone || !data.email) {
            alert("Fill out the requirements"); return;
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
    const form = document.getElementById("edit-form"); if (!form) return;
    const id = new URLSearchParams(location.search).get("id");
    const f = friends.find(x => x.id === id);
    if (!f) { form.innerHTML = "<p>No data</p>"; return; }

    // 초기 값 채우기 (너가 정한 필드들)
    form.name.value = f.name || "";
    form.phone.value = f.phone || "";
    form.email.value = f.email || "";
    form.birthday.value = f.birthday || "";
    form.address.value = f.address || "";
    form.relation.value = f.relation || "";

    form.onsubmit = (e) => {
        e.preventDefault();
        if (confirm("Edit?")) {
            f.name = form.name.value;
            f.phone = form.phone.value;
            f.email = form.email.value;
            f.birthday = form.birthday.value;
            f.address = form.address.value;
            f.relation = form.relation.value;
            saveFriends(friends);
            alert("Edited");
            location.href = "view.html?id=" + encodeURIComponent(id);
        }
    };
}

// ---- 초기화
document.addEventListener("DOMContentLoaded", () => {
    // 페이지별 필요한 것만 실행돼도 ok
    renderTable();
    renderView();
    bindAdd();
    bindEdit();
});
