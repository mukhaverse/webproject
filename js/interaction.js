let count = 3;

const addBtn = document.getElementById("add-btn");
const conta = document.querySelector(".drugs-container");
const checkBtn = document.getElementById("check-but");

// ########## apply autocomplete to inputs ##########

function addAutocomplete(input) {
  input.addEventListener("input", async () => {
    const val = input.value.trim();

    let list = input.parentElement.querySelector(".list-div");

    if (!list) {
      list = document.createElement("ul");
      list.classList.add("list-div");
      input.parentElement.appendChild(list);
    }

    if (val === "") {
      list.innerHTML = "";
      return;
    }

    try {
      const response = await fetch(
        `https://medixa.onrender.com/search?q=${encodeURIComponent(val)}`
      );

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Search returned non-JSON:", text);
        list.innerHTML = "";
        return;
      }

      list.innerHTML = "";

      data.forEach((drug) => {
        const li = document.createElement("li");
        li.textContent = drug.name;
        li.addEventListener("click", () => {
          input.value = drug.name;
          list.innerHTML = "";
        });
        list.appendChild(li);
      });
    } catch (error) {
      console.log("Error during autocomplete:", error);
      list.innerHTML = "";
    }
  });
}

// activate autocomplete for existing inputs
const allInputs = document.querySelectorAll(".drugs-container input");
allInputs.forEach(addAutocomplete);

// ########## add new drug input ##########

addBtn.addEventListener("click", () => {
  const drugField = document.createElement("div");
  drugField.classList.add("drug-field");

  drugField.innerHTML = `
    <label for="drug${count}">Search Drug ${count}</label>
    <input type="text" id="drug${count}" placeholder="Enter drug name">
    <div>
      <ul class="list-div"></ul>
    </div>
  `;

  conta.appendChild(drugField);

  const newInput = drugField.querySelector("input");
  addAutocomplete(newInput);

  count++;
});

// ########## no interaction overlay ##########

function showNoInteractionOverlay() {
  let overlay = document.getElementById("no-interaction-overlay");
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.id = "no-interaction-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease forwards;
  `;

  overlay.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.06); }
      }
      .no-int-box {
        background: white;
        border-radius: 24px;
        padding: 50px 40px;
        text-align: center;
        max-width: 380px;
        width: 90%;
        animation: slideUp 0.4s ease forwards;
      }
      .no-int-icon {
        width: 85px;
        height: 85px;
        background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 22px;
        font-size: 38px;
        animation: pulse 2.5s ease infinite;
      }
      .no-int-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: #2e7d32;
        margin-bottom: 10px;
      }
      .no-int-sub {
        font-size: 0.9rem;
        color: #6b7280;
        line-height: 1.6;
        margin-bottom: 28px;
      }
      .no-int-close {
        background: #2e7d32;
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 50px;
        font-size: 0.95rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      .no-int-close:hover {
        background: #1b5e20;
      }
    </style>

    <div class="no-int-box">
      <div class="no-int-icon">✅</div>
      <p class="no-int-title">No Interaction Found</p>
      <p class="no-int-sub">
        These medications appear to be safe to take together.
        No known interactions were detected between them.
      </p>
      <button class="no-int-close" id="closeNoInt">Ok</button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("closeNoInt").addEventListener("click", () => {
    overlay.remove();
    window.location.href = "../index.html";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
      window.location.href = "../index.html";
    }
  });
}

// ########## check interaction ##########

checkBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const inputs = document.querySelectorAll(".drugs-container input");
  const drugs = [];

  inputs.forEach((input) => {
    const value = input.value.trim();
    if (value !== "") drugs.push(value);
  });

  if (drugs.length < 2) {
    alert("Please enter at least two drugs");
    return;
  }

  try {
    const token = localStorage.getItem("medixa_token");

    if (!token) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch("https://medixa.onrender.com/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ drugs })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Check returned non-JSON:", text);
      alert("Server error. Check Render logs.");
      return;
    }

    if (!response.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    const hasInteraction = data.results?.some(r => r.result?.interaction_found);

    if (!hasInteraction) {
      showNoInteractionOverlay();
      return;
    }

    localStorage.setItem("interactionResult", JSON.stringify(data));
    window.location.href = "results.html";

  } catch (error) {
    console.error(error);
    alert("Failed to fetch interaction data");
  }
});