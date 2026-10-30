const groups = [
 {title:"ІНФОРМАЦІЯ ПРО ПРОЄКТ",items:[
  {icon:"▣",name:"Новини та оновлення",desc:"Офіційні новини, оновлення та важливі оголошення",topics:12,posts:48,last:"Команда RIVER RP"},
  {icon:"◇",name:"Правила проєкту",desc:"Правила сервера, форуму та спільноти",topics:4,posts:16,last:"Адміністрація"}
 ]},
 {title:"ІГРОВИЙ РОЗДІЛ",items:[
  {icon:"◈",name:"Загальний розділ",desc:"Спілкування гравців на різні теми",topics:28,posts:136,last:"Гравці RIVER RP"},
  {icon:"⌘",name:"Питання та допомога",desc:"Не знаєш, як щось зробити? Запитай тут",topics:9,posts:31,last:"Служба підтримки"},
  {icon:"✧",name:"Пропозиції щодо покращення",desc:"Ділися ідеями та пропозиціями для проєкту",topics:7,posts:22,last:"Команда проєкту"}
 ]},
 {title:"ЗВЕРНЕННЯ",items:[
  {icon:"⚑",name:"Скарги",desc:"Звернення щодо порушень правил",topics:3,posts:11,last:"Модерація"},
  {icon:"▤",name:"Заявки",desc:"Заявки до організацій та команди проєкту",topics:6,posts:19,last:"Керівництво"}
 ]}
];
const starterTopics=[
 {title:"Ласкаво просимо на форум RIVER RP!",section:"Новини та оновлення",author:"Адміністрація",date:"30.10.2026",replies:3},
 {title:"Правила форуму — обов'язково до ознайомлення",section:"Правила проєкту",author:"Адміністрація",date:"30.10.2026",replies:5},
 {title:"Ваші пропозиції щодо розвитку проєкту",section:"Пропозиції щодо покращення",author:"Команда RIVER RP",date:"30.10.2026",replies:2}
];
let topics=JSON.parse(localStorage.getItem("riverTopics")||"null")||starterTopics;
let currentUser=localStorage.getItem("riverUser")||"";
const $=s=>document.querySelector(s);
function save(){localStorage.setItem("riverTopics",JSON.stringify(topics))}
function renderGroups(filter=""){
 const root=$("#forumSections");root.innerHTML="";
 groups.forEach(g=>{
  const rows=g.items.filter(x=>(x.name+" "+x.desc).toLowerCase().includes(filter.toLowerCase()));
  if(!rows.length)return;
  const box=document.createElement("div");box.className="category-group panel";
  box.innerHTML=`<div class="category-title">${g.title}</div>`+rows.map(x=>`<div class="forum-row"><div class="forum-icon">${x.icon}</div><div><div class="forum-name">${x.name}</div><div class="forum-desc">${x.desc}</div></div><div class="forum-count"><b>${x.topics}</b> тем<br><b>${x.posts}</b> дописів</div><div class="last-post"><b>${x.last}</b>Остання активність</div></div>`).join("");
  root.appendChild(box);
 });
 if(!root.children.length)root.innerHTML='<div class="panel empty">Розділів не знайдено.</div>';
}
function renderTopics(filter=""){
 const root=$("#topicList");const list=topics.filter(t=>(t.title+" "+t.section+" "+t.author).toLowerCase().includes(filter.toLowerCase()));
 root.innerHTML=list.length?list.slice().reverse().map(t=>`<div class="topic-item"><div class="topic-symbol">▤</div><div class="topic-info"><b>${escapeHtml(t.title)}</b><span>${escapeHtml(t.section)} · автор: ${escapeHtml(t.author)}</span></div><div class="topic-meta">${t.date}<br>${t.replies} відповідей</div></div>`).join(""):'<div class="empty">Тем не знайдено.</div>';
 $("#statTopics").textContent=topics.length;$("#statPosts").textContent=topics.reduce((n,t)=>n+(Number(t.replies)||0)+1,0);
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)}
function openModal(html){$("#modalContent").innerHTML=html;$("#modalBackdrop").classList.add("show")}
function closeModal(){$("#modalBackdrop").classList.remove("show")}
function auth(mode){
 const isReg=mode==="register";
 openModal(`<h2>${isReg?"Створити акаунт":"Вхід на форум"}</h2><p>${isReg?"Приєднуйся до спільноти RIVER RP.":"Введи ім'я користувача для демо-входу."}</p><form id="authForm"><label class="field"><span>Ім'я користувача</span><input name="username" minlength="3" maxlength="24" required placeholder="Твій нікнейм"></label>${isReg?'<label class="field"><span>Пароль (демо)</span><input name="password" type="password" minlength="4" required placeholder="Не використовуй справжній пароль"></label>':'<label class="field"><span>Пароль (демо)</span><input name="password" type="password" required placeholder="Будь-який пароль для демонстрації"></label>'}<button class="primary" type="submit">${isReg?"Зареєструватися":"Увійти"}</button><p class="modal-note">Це лише локальна демонстрація. Дані не надсилаються на сервер і не є захищеною реєстрацією.</p></form>`);
 $("#authForm").addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.target);const name=String(fd.get("username")).trim();if(name.length<3)return;currentUser=name;localStorage.setItem("riverUser",name);closeModal();updateAuth();toast("Вітаємо, "+name+"! (демо-режим)")});
}
function updateAuth(){const a=$("#loginOpen"),b=$("#registerOpen");if(currentUser){a.textContent=currentUser;a.onclick=()=>{if(confirm("Вийти з демо-акаунта?")){currentUser="";localStorage.removeItem("riverUser");updateAuth()}};b.textContent="＋ Тема";b.onclick=newTopic}else{a.textContent="Увійти";a.onclick=()=>auth("login");b.textContent="Реєстрація";b.onclick=()=>auth("register")}}
function newTopic(){
 if(!currentUser){toast("Спочатку увійди в демо-режимі");auth("login");return}
 openModal(`<h2>Створити тему</h2><p>Опублікуй нове обговорення на форумі.</p><form id="topicForm"><label class="field"><span>Назва теми</span><input name="title" maxlength="90" required placeholder="Про що хочеш поговорити?"></label><label class="field"><span>Розділ</span><select name="section">${groups.flatMap(g=>g.items).map(x=>`<option>${x.name}</option>`).join("")}</select></label><label class="field"><span>Повідомлення</span><textarea name="body" rows="4" required placeholder="Напиши перше повідомлення..."></textarea></label><button class="primary" type="submit">Опублікувати тему</button><p class="modal-note">Тема збережеться локально в цьому браузері.</p></form>`);
 $("#topicForm").addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.target);topics.push({title:String(fd.get("title")).trim(),section:fd.get("section"),author:currentUser,date:new Date().toLocaleDateString("uk-UA"),replies:0,body:String(fd.get("body")).trim()});save();renderTopics($("#searchInput").value);closeModal();toast("Тему додано!")});
}
$("#loginOpen").onclick=()=>auth("login");$("#registerOpen").onclick=()=>auth("register");$("#newTopicTop").onclick=newTopic;
$("#modalClose").onclick=closeModal;$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
$("#searchInput").addEventListener("input",e=>{renderGroups(e.target.value);renderTopics(e.target.value)});
$("#aboutLink").onclick=e=>{e.preventDefault();openModal('<h2>Про RIVER RP</h2><p>RIVER RP — концепт ігрової спільноти та форуму. Ця версія створена як навчальний локальний прототип.</p><p class="modal-note">Наступний етап розробки — серверна частина, справжні акаунти, база даних та модерація.</p>')};
renderGroups();renderTopics();updateAuth();
