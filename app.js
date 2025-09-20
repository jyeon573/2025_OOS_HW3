// 샘플 데이터
let friends = [
  { id:"F001", name:"Hong Gil-dong", relation:"Friend", phone:"010-1234-5678", email:"hong@example.com", birthday:"2000-05-12", address:"Seoul" },
  { id:"F002", name:"Kim Hana", relation:"Sibling", phone:"010-2222-3333", email:"hana@example.com", birthday:"2001-08-30", address:"Busan" }
];

// 공통 escape
function esc(str){return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}

// 이름 이니셜 생성 (이미지 없을 때)
function initials(name){
  return String(name||"")
    .trim()
    .split(/\s+/)
    .map(p=>p[0]||"")
    .join("")
    .slice(0,2)
    .toUpperCase();
}

function renderTable(){
  const tbody = document.getElementById("list-body");
  if (!tbody) return;

  tbody.innerHTML = friends.map((f) => {
    const avatar = f.avatar
      ? `<img src="${esc(f.avatar)}" alt="" class="avatar">`
      : `<span class="avatar avatar-initials">${esc(initials(f.name))}</span>`;

    return `
      <tr>
        <td class="cell-avatar">${avatar}</td>
        <td class="cell-name"   data-label="Name"><a href="view.html?id=${encodeURIComponent(f.id)}">${esc(f.name)}</a></td>
        <td class="cell-phone"  data-label="Phone">${esc(f.phone||"")}</td>
        <td class="cell-email"  data-label="Email">${esc(f.email||"")}</td>
        <td class="cell-bday"   data-label="Birthday">${esc(f.birthday||"")}</td>
        <td class="cell-addr"   data-label="Address">${esc(f.address||"")}</td>
        <td class="cell-rel"    data-label="Relation">${esc(f.relation||"")}</td>
      </tr>
    `;
  }).join("");
}



// view 페이지: id로 데이터 찾아 표시
function renderView(){
  const wrap=document.getElementById("view-wrap"); if(!wrap) return;
  const params=new URLSearchParams(location.search);
  const id=params.get("id");
  const f=friends.find(x=>x.id===id);
  if(!f){wrap.innerHTML="<p>데이터 없음</p>"; return;}
  wrap.innerHTML=`
    <dl class="uk-description-list">
      <dt>Name</dt><dd>${esc(f.name)}</dd>
      <dt>Phone</dt><dd>${esc(f.phone)}</dd>
      <dt>Email</dt><dd>${esc(f.email)}</dd>
      <dt>Birthday</dt><dd>${esc(f.birthday)}</dd>
      <dt>Address</dt><dd>${esc(f.address)}</dd>
      <dt>Relation</dt><dd>${esc(f.relation)}</dd>
    </dl>
    <div class="uk-margin-top">
      <a class="uk-button uk-button-primary" href="edit.html?id=${f.id}">Edit</a>
      <button id="delBtn" class="uk-button uk-button-danger">Delete</button>
    </div>`;
  document.getElementById("delBtn").onclick=()=>{
    if(confirm("Delete?")){
      friends=friends.filter(x=>x.id!==id);
      alert("Deleted");
      location.href="index.html";
    }
  }
}

// add 페이지: 유효성 검사 + 저장
function bindAdd(){
  const form=document.getElementById("add-form"); if(!form) return;
  form.onsubmit=e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    if(!data.name||!data.phone||!data.email||!data.birthday){alert("필수항목 입력하세요");return;}
    data.id="F"+String(Date.now());
    friends.push(data);
    alert("Added");
    location.href="index.html";
  }
}

// edit 페이지
function bindEdit(){
  const form=document.getElementById("edit-form"); if(!form) return;
  const id=new URLSearchParams(location.search).get("id");
  const f=friends.find(x=>x.id===id);
  if(!f){form.innerHTML="<p>No data</p>";return;}
  form.name.value=f.name;
  form.phone.value=f.phone;
  form.email.value=f.email;
  form.birthday.value=f.birthday;
  form.address.value=f.address;
  form.relation.value=f.relation;

  form.onsubmit=e=>{
    e.preventDefault();
    if(confirm("Edit?")){
      f.name=form.name.value;
      f.phone=form.phone.value;
      f.email=form.email.value;
      f.birthday=form.birthday.value;
      f.address=form.address.value;
      f.relation=form.relation.value;
      alert("Edited");
      location.href="view.html?id="+id;
    }
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  renderTable(); renderView(); bindAdd(); bindEdit();
});
