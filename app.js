// 샘플 데이터
let friends = [
  { id:"F001", name:"Hong Gil-dong", relation:"Friend", phone:"010-1234-5678", email:"hong@example.com", birthday:"2000-05-12", address:"Seoul" },
  { id:"F002", name:"Kim Hana", relation:"Sibling", phone:"010-2222-3333", email:"hana@example.com", birthday:"2001-08-30", address:"Busan" }
];

// 공통 escape
function esc(str){return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}

// index 페이지: 테이블 출력
function renderTable(){
  const tbody=document.getElementById("list-body"); if(!tbody) return;
  tbody.innerHTML=friends.map((f,i)=>`
    <tr>
      <td>${i+1}</td>
      <td><a href="view.html?id=${f.id}">${esc(f.name)}</a></td>
      <td>${esc(f.relation)}</td>
      <td>${esc(f.phone)}</td>
      <td>${esc(f.email)}</td>
      <td>${esc(f.birthday)}</td>

    </tr>
  `).join("");
}

// index: 삭제 confirm
function bindDelete(){
  const tbody=document.getElementById("list-body"); if(!tbody) return;
  tbody.addEventListener("click",e=>{
    const btn=e.target.closest("[data-del]"); if(!btn) return;
    const id=btn.getAttribute("data-del");
    if(confirm("게시물을 삭제할까요?")){
      friends=friends.filter(f=>f.id!==id);
      renderTable();
    }
  });
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
      <dt>Relation</dt><dd>${esc(f.relation)}</dd>
      <dt>Phone</dt><dd>${esc(f.phone)}</dd>
      <dt>Email</dt><dd>${esc(f.email)}</dd>
      <dt>Birthday</dt><dd>${esc(f.birthday)}</dd>
      <dt>Address</dt><dd>${esc(f.address)}</dd>
    </dl>
    <div class="uk-margin-top">
      <a class="uk-button uk-button-primary" href="edit.html?id=${f.id}">Edit</a>
      <button id="delBtn" class="uk-button uk-button-danger">Delete</button>
      <a href="index.html" class="uk-button uk-button-default">Back</a>
    </div>`;
  document.getElementById("delBtn").onclick=()=>{
    if(confirm("게시물을 삭제할까요?")){
      friends=friends.filter(x=>x.id!==id);
      alert("삭제되었습니다");
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
    if(!data.name||!data.relation||!data.phone||!data.email){alert("필수항목 입력하세요");return;}
    data.id="F"+String(Date.now());
    friends.push(data);
    alert("게시물이 추가됩니다");
    location.href="index.html";
  }
}

// edit 페이지
function bindEdit(){
  const form=document.getElementById("edit-form"); if(!form) return;
  const id=new URLSearchParams(location.search).get("id");
  const f=friends.find(x=>x.id===id);
  if(!f){form.innerHTML="<p>데이터 없음</p>";return;}
  form.name.value=f.name;
  form.relation.value=f.relation;
  form.phone.value=f.phone;
  form.email.value=f.email;
  form.birthday.value=f.birthday;
  form.address.value=f.address;

  form.onsubmit=e=>{
    e.preventDefault();
    if(confirm("게시물을 수정할까요?")){
      f.name=form.name.value;
      f.relation=form.relation.value;
      f.phone=form.phone.value;
      f.email=form.email.value;
      f.birthday=form.birthday.value;
      f.address=form.address.value;
      alert("수정되었습니다");
      location.href="view.html?id="+id;
    }
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  renderTable(); bindDelete(); renderView(); bindAdd(); bindEdit();
});
