const SUPABASE_URL = "https://muywxdvpszwedfbfpvli.supabase.co";
const SUPABASE_KEY = "sb_publishable_kJ4B30MG-o5U3sdwAF4IQg_RfJTE7Av";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const groups = [
  { title: "ІНФОРМАЦІЯ ПРО ПРОЄКТ", items: [
    { icon: "▣", name: "Новини та оновлення", desc: "Офіційні новини, оновлення та важливі оголошення" },
    { icon: "◇", name: "Правила проєкту", desc: "Правила сервера, форуму та спільноти" }
  ]},
  { title: "ІГРОВИЙ РОЗДІЛ", items: [
    { icon: "◈", name: "Загальний розділ", desc: "Спілкування гравців на різні теми" },
    { icon: "⌘", name: "Питання та допомога", desc: "Не знаєш, як щось зробити? Запитай тут" },
    { icon: "✧", name: "Пропозиції щодо покращення", desc: "Ділися ідеями та пропозиціями для проєкту" }
  ]},
  { title: "ЗВЕРНЕННЯ", items: [
    { icon: "⚑", name: "Скарги", desc: "Звернення щодо порушень правил" },
    { icon: "▤", name: "Заявки", desc: "Заявки до організацій та команди проєкту" }
  ]}
];

let topics = [];
let currentUser = null;
let selectedSection = "";

const $ = s => document.querySelector(s);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

function openModal(html) {
  $("#modalContent").innerHTML = html;
  $("#modalBackdrop").classList.add("show");
}

function closeModal() {
  $("#modalBackdrop").classList.remove("show");
}

function renderGroups(filter = "") {
  const root = $("#forumSections");
  root.innerHTML = "";

  groups.forEach(group => {
    const items = group.items.filter(item =>
      (item.name + " " + item.desc).toLowerCase().includes(filter.toLowerCase())
    );

    if (!items.length) return;

    const box = document.createElement("div");
    box.className = "category-group panel";

    box.innerHTML =
      `<div class="category-title">${escapeHtml(group.title)}</div>` +
      items.map(item => `
        <div class="forum-row" data-section="${escapeHtml(item.name)}" style="cursor:pointer">
          <div class="forum-icon">${item.icon}</div>
          <div>
            <div class="forum-name">${escapeHtml(item.name)}</div>
            <div class="forum-desc">${escapeHtml(item.desc)}</div>
          </div>
          <div class="forum-count">Переглянути →</div>
        </div>
      `).join("");

    root.appendChild(box);
  });

  if (!root.children.length) {
    root.innerHTML = '<div class="panel empty">Розділів не знайдено.</div>';
  }
}

function renderTopics(filter = "") {
  const root = $("#topicList");

  const list = topics.filter(topic =>
    (topic.title + " " + topic.section + " " + topic.author_name)
      .toLowerCase().includes(filter.toLowerCase()) &&
    (!selectedSection || topic.section === selectedSection)
  );

  root.innerHTML = list.length
    ? list.map(topic => `
      <div class="topic-item" data-topic="${topic.id}" style="cursor:pointer">
        <div class="topic-symbol">▤</div>
        <div class="topic-info">
          <b>${escapeHtml(topic.title)}</b>
          <span>${escapeHtml(topic.section)} · автор: ${escapeHtml(topic.author_name)}</span>
        </div>
        <div class="topic-meta">
          ${new Date(topic.created_at).toLocaleDateString("uk-UA")}
        </div>
      </div>
    `).join("")
    : '<div class="empty">У цьому розділі поки немає тем.</div>';

  $("#statTopics").textContent = topics.length;
  $("#statPosts").textContent = topics.length;
}

async function loadTopics() {
  const { data, error } = await db
    .from("topics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    toast("Не вдалося завантажити теми.");
    return;
  }

  topics = data || [];
  renderTopics($("#searchInput").value);
}

function openTopic(topic) {
  openModal(`
    <h2>${escapeHtml(topic.title)}</h2>
    <p>${escapeHtml(topic.section)} · Автор: ${escapeHtml(topic.author_name)}</p>
    <div style="white-space:pre-wrap;line-height:1.6;margin-top:20px">
      ${escapeHtml(topic.body)}
    </div>
  `);
}

async function auth(mode) {
  const isRegister = mode === "register";

  openModal(`
    <h2>${isRegister ? "Реєстрація" : "Вхід на форум"}</h2>
    <form id="authForm">
      ${isRegister ? `
        <label class="field">
          <span>Ім'я користувача</span>
          <input name="username" minlength="3" maxlength="24" required>
        </label>
      ` : ""}
      <label class="field">
        <span>Email</span>
        <input name="email" type="email" required>
      </label>
      <label class="field">
        <span>Пароль</span>
        <input name="password" type="password" minlength="6" required>
      </label>
      <button class="primary" type="submit">
        ${isRegister ? "Зареєструватися" : "Увійти"}
      </button>
    </form>
  `);

  $("#authForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = new FormData(event.target);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const username = String(form.get("username") || "").trim();

    let result;

    if (isRegister) {
      result = await db.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
    } else {
      result = await db.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      toast(result.error.message);
      return;
    }

    if (isRegister && !result.data.session) {
      closeModal();
      toast("Перевір пошту та підтвердь реєстрацію!");
      return;
    }

    currentUser = result.data.user;
    closeModal();
    updateAuth();
    await loadTopics();
    toast(isRegister ? "Акаунт створено!" : "Ти увійшов!");
  });
}

function updateAuth() {
  const login = $("#loginOpen");
  const register = $("#registerOpen");

  if (currentUser) {
    const username =
      currentUser.user_metadata?.username ||
      currentUser.email.split("@")[0];

    login.textContent = username;
    login.onclick = async () => {
      await db.auth.signOut();
      currentUser = null;
      updateAuth();
      toast("Ти вийшов з акаунта.");
    };

    register.textContent = "＋ Тема";
    register.onclick = newTopic;
  } else {
    login.textContent = "Увійти";
    login.onclick = () => auth("login");

    register.textContent = "Реєстрація";
    register.onclick = () => auth("register");
  }
}

function newTopic() {
  if (!currentUser) {
    toast("Спочатку увійди на форум!");
    auth("login");
    return;
  }

  openModal(`
    <h2>Створити тему</h2>
    <form id="topicForm">
      <label class="field">
        <span>Назва теми</span>
        <input name="title" maxlength="90" required>
      </label>
      <label class="field">
        <span>Розділ</span>
        <select name="section">
          ${groups.flatMap(g => g.items).map(item =>
            `<option>${escapeHtml(item.name)}</option>`
          ).join("")}
        </select>
      </label>
      <label class="field">
        <span>Повідомлення</span>
        <textarea name="body" rows="5" required></textarea>
      </label>
      <button class="primary" type="submit">Опублікувати тему</button>
    </form>
  `);

  $("#topicForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = new FormData(event.target);
    const username =
      currentUser.user_metadata?.username ||
      currentUser.email.split("@")[0];

    const { error } = await db.from("topics").insert({
      title: String(form.get("title")).trim(),
      section: form.get("section"),
      body: String(form.get("body")).trim(),
      author_name: username,
      author_id: currentUser.id
    });

    if (error) {
      toast(error.message);
      return;
    }

    selectedSection = "";
    closeModal();
    await loadTopics();
    toast("Тему успішно опубліковано!");
  });
}

$("#loginOpen").onclick = () => auth("login");
$("#registerOpen").onclick = () => auth("register");
$("#newTopicTop").onclick = newTopic;

$("#modalClose").onclick = closeModal;
$("#modalBackdrop").addEventListener("click", event => {
  if (event.target.id === "modalBackdrop") closeModal();
});

$("#searchInput").addEventListener("input", event => {
  renderGroups(event.target.value);
  renderTopics(event.target.value);
});

$("#forumSections").addEventListener("click", event => {
  const row = event.target.closest("[data-section]");
  if (!row) return;

  selectedSection = row.dataset.section;
  renderTopics($("#searchInput").value);
  $("#topicList").scrollIntoView({ behavior: "smooth" });
});

$("#topicList").addEventListener("click", event => {
  const row = event.target.closest("[data-topic]");
  if (!row) return;

  const topic = topics.find(item => String(item.id) === row.dataset.topic);
  if (topic) openTopic(topic);
});

$("#aboutLink").onclick = event => {
  event.preventDefault();
  openModal(`
    <h2>Про RIVER RP</h2>
    <p>RIVER RP — ігрова спільнота та форум.</p>
  `);
};

async function startForum() {
  renderGroups();

  const { data, error } = await db.auth.getSession();

  if (error) {
    toast("Помилка підключення до акаунта.");
  }

  currentUser = data?.session?.user || null;
  updateAuth();
  await loadTopics();

  db.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    updateAuth();
    loadTopics();
  });
}

startForum();
