// EDIT: ganti nilai ini dengan Supabase URL & ANON KEY Anda
const SUPABASE_URL = "https://shdiyeibrrdmkxntnrsg.supabase.co"
const SUPABASE_ANON_KEY = process.env.ANON_KEY;

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatEl = document.getElementById("chat");
const composer = document.getElementById("composer");
const inputMessage = document.getElementById("inputMessage");
const nameModal = document.getElementById("nameModal");
const usernameInput = document.getElementById("usernameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const changeNameBtn = document.getElementById("changeNameBtn");

let username = localStorage.getItem("chat_username") || null;
let lastLoaded = null;

function showNameModal(){
  nameModal.classList.remove("hidden");
  usernameInput.value = username || "";
  usernameInput.focus();
}
function hideNameModal(){
  nameModal.classList.add("hidden");
}

saveNameBtn.addEventListener("click", () => {
  const v = (usernameInput.value || "").trim();
  if(!v) return alert("Masukkan nama");
  username = v;
  localStorage.setItem("chat_username", username);
  hideNameModal();
});

changeNameBtn.addEventListener("click", () => {
  showNameModal();
});

if(!username) showNameModal();

// render single message
function renderMessage(m){
  const wrapper = document.createElement("div");
  wrapper.className = "message " + ((m.username === username) ? "mine" : "theirs");

  const meta = document.createElement("div");
  meta.className = "meta";
  const t = new Date(m.created_at).toLocaleTimeString();
  meta.textContent = `${m.username} · ${t}`;

  const content = document.createElement("div");
  content.className = "content";
  content.textContent = m.content;

  wrapper.appendChild(meta);
  wrapper.appendChild(content);
  chatEl.appendChild(wrapper);
  // scroll to bottom
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function loadRecent(){
  // ambil 100 pesan terakhir
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(200);

  if(error){
    console.error("Load messages error", error);
    return;
  }
  chatEl.innerHTML = "";
  data.forEach(renderMessage);
  if(data.length) lastLoaded = data[data.length-1].created_at;
}

// kirim pesan
composer.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = inputMessage.value.trim();
  if(!text) return;
  if(!username){
    showNameModal();
    return;
  }

  inputMessage.value = "";
  await supabase
    .from('messages')
    .insert([{ username, content: text }]);
  // rely on realtime to append
});

// realtime subscription
function subscribeRealtime(){
  // gunakan postgres_changes event
  const channel = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const newRow = payload.new;
      renderMessage(newRow);
    })
    .subscribe((status) => {
      // optional: console.log("subscription status", status);
    });
}

// inisialisasi
(async function init(){
  await loadRecent();
  subscribeRealtime();
})();
