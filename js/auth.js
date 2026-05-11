const API_BASE = "https://medixa.onrender.com";




const Auth = {



  saveToken(token, user) {
    localStorage.setItem("medixa_token", token);
    localStorage.setItem("medixa_user",  JSON.stringify(user));
  },



  getToken() {
    return localStorage.getItem("medixa_token");
  },




  
  getUser() {
    const raw = localStorage.getItem("medixa_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      // Corrupted data treat as logged out
      return null;
    }
  },


  isLoggedIn() {
    return !!this.getToken();

  },


  logout() {

    localStorage.removeItem("medixa_token");
    localStorage.removeItem("medixa_user");
    
    window.location.href = "/";

  },


  // fetch("/chat/start", { method: "POST", headers: Auth.headers() })

  headers(extra = {}) {

    const h = { "Content-Type": "application/json" };
    const token = this.getToken();


    if (token) {
      h["Authorization"] = `Bearer ${token}`;
    }

    return { ...h, ...extra };
  }


};
window.Auth = Auth;








function showMsg(el, type, text) {
  el.className    = `auth-msg ${type} visible`;
  el.textContent  = text;

}



function setLoading(btn, isLoading) {

  btn.classList.toggle("loading", isLoading);
}


function initLoginForm() {
  const form      = document.getElementById("loginForm");
  const msgEl     = document.getElementById("authMsg");
  const submitBtn = document.getElementById("submitBtn");

  if (!form) return;  

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      return showMsg(msgEl, "error", "Please fill in all fields.");
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!EMAIL_REGEX.test(email)) {
      return showMsg(msgEl, "error", "Please enter a valid email address.");
    }

    setLoading(submitBtn, true);
    msgEl.classList.remove("visible");

    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(submitBtn, false);
        return showMsg(msgEl, "error", data.error || "Login failed. Please try again.");
      }

      Auth.saveToken(data.token, data.user);
      showMsg(msgEl, "success", "Signed in! Redirecting…");

      setTimeout(() => {
        const params   = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        window.location.href = redirect || "/";
      }, 700);


    } catch (err) {
      setLoading(submitBtn, false);
      showMsg(msgEl, "error", "Could not reach the server. Is it running?");
    }

  });

}


function initSignupForm() {

  const form      = document.getElementById("signupForm");
  const msgEl     = document.getElementById("authMsg");
  const submitBtn = document.getElementById("submitBtn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
      return showMsg(msgEl, "error", "Please fill in all fields.");
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const NAME_REGEX  = /^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]{2,50}$/;

    if (!NAME_REGEX.test(name)) {
      return showMsg(msgEl, "error", "Name must be 2–50 letters only.");
    }

    if (!EMAIL_REGEX.test(email)) {
      return showMsg(msgEl, "error", "Please enter a valid email address.");
    }

    if (password.length < 6) {
      return showMsg(msgEl, "error", "Password must be at least 6 characters.");
    }
    setLoading(submitBtn, true);
    msgEl.classList.remove("visible");

    try {
      const res  = await fetch(`${API_BASE}/auth/signup`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(submitBtn, false);
        return showMsg(msgEl, "error", data.error || "Sign up failed. Please try again.");
      }

      Auth.saveToken(data.token, data.user);
      showMsg(msgEl, "success", "Account created! Redirecting…");

      setTimeout(() => {
        window.location.href = "/";
      }, 700);

    } catch (err) {
      setLoading(submitBtn, false);
      showMsg(msgEl, "error", "Could not reach the server. Is it running?");
    }

  });

}





function applyAuthToSigninEl(signinEl, user) {
  if (!signinEl) return;

  if (!user) {
    signinEl.textContent = "Sign In";
    signinEl.href = "/html/login.html";
    return;
  }

  signinEl.textContent = user.name.split(" ")[0];
  signinEl.href        = "#";
  signinEl.title       = "Click to sign out";

  signinEl.addEventListener("click", (e) => {
    e.preventDefault();

    const panels = document.querySelectorAll(".panel");
    if (typeof gsap !== "undefined" && panels.length) {
      gsap.to(panels, {
        y: "0%", stagger: 0.1, duration: 0.3,
        onComplete: () => Auth.logout()
      });
    } else {
      Auth.logout();
    }
  });
}



function addRoleTabs(navTabs, user) {
  if (!user || !navTabs) return;

  const currentPage = window.location.pathname.split("/").pop();

  if (user.role === "admin") {

    if (!navTabs.querySelector(".chat-management-link")) {
      const chatLink = document.createElement("a");
      chatLink.className = "nav-tab nav-role-link chat-management-link";
      chatLink.href = "/html/chat-management.html";
      chatLink.textContent = "Chat Management";
      chatLink.dataset.page = "chat-management";

      if (currentPage === "chat-management.html") {
        chatLink.classList.add("active");
      }

      navTabs.appendChild(chatLink);
    }

    if (!navTabs.querySelector(".drug-management-link")) {
      const drugLink = document.createElement("a");
      drugLink.className = "nav-tab nav-role-link drug-management-link";
      drugLink.href = "/html/drug-mappings.html";
      drugLink.textContent = "Admin Panel";
      drugLink.dataset.page = "drug-mappings";

      if (currentPage === "drug-mappings.html") {
        drugLink.classList.add("active");
      }

      navTabs.appendChild(drugLink);
    }

  } else {

    if (!navTabs.querySelector(".nav-role-link")) {
      const roleLink = document.createElement("a");
      roleLink.className = "nav-tab nav-role-link";
      roleLink.href = "/html/ask-pharmacist.html";
      roleLink.textContent = "Ask a Pharmacist";
      roleLink.dataset.page = "ask-pharmacist";

      if (currentPage === "ask-pharmacist.html") {
        roleLink.classList.add("active");
      }

      navTabs.appendChild(roleLink);
    }
  }
}


function updateNavAuth() {
  const user = Auth.getUser();

  applyAuthToSigninEl(document.getElementById("navSignin"), user);
  applyAuthToSigninEl(document.getElementById("navSigninMobile"), user);

  addRoleTabs(document.getElementById("navTabs"), user);
  addRoleTabs(document.getElementById("navSidebarTabs"), user);

  const active = document.querySelector(".nav-tabs .nav-tab.active");
  const tabBg = document.getElementById("tabBg");

  if (active && tabBg) {
    tabBg.style.left = active.offsetLeft + "px";
    tabBg.style.width = active.offsetWidth + "px";
    tabBg.style.opacity = "1";
  }
}


document.addEventListener("DOMContentLoaded", updateNavAuth);