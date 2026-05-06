
const API_BASE = "http://localhost:3000";




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

  // togglePasswordVisibility("password", "togglePw");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;



    // validation
    if (!email || !password) {
      return showMsg(msgEl, "error", "Please fill in all fields.");
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

  // togglePasswordVisibility("password", "togglePw");


  
  form.addEventListener("submit", async (e) => {

    e.preventDefault();


    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;



    if (!name || !email || !password) {
      return showMsg(msgEl, "error", "Please fill in all fields.");

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











function updateNavAuth() {
  
    
  const signinEl = document.getElementById("navSignin")
                || document.querySelector(".nav-signin");


  if (!signinEl) return;

  const user = Auth.getUser();

  if (!user) {
    signinEl.textContent = "Sign In";
    signinEl.href = "/HTML/login.html";
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


  

 if (user.role === "admin") {
 
    if (!document.querySelector(".nav-admin-links")) {
 
      const wrapper = document.createElement("span");
      wrapper.className = "nav-admin-links";
 
      const mappingsLink = document.createElement("a");
      mappingsLink.href = "/HTML/drug-mappings.html";
      mappingsLink.textContent = "Drug Mappings";
      mappingsLink.style.cssText = [
        "font-size:11px",
        "background:#312e81",
        "color:rgba(255,255,255,0.85)",
        "padding:3px 10px",
        "border-radius:20px",
        "text-decoration:none",
        "margin-left:8px",
        "letter-spacing:0.5px"
      ].join(";");
 
      wrapper.appendChild(mappingsLink);
      signinEl.parentElement.appendChild(wrapper);
 
    }
 
  }



}


document.addEventListener("DOMContentLoaded", updateNavAuth);

