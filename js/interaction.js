let count = 3;

const addBtn = document.getElementById("add-btn");
const conta = document.querySelector(".drugs-container");
const checkBtn = document.getElementById("check-but");

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
  count++;
});

checkBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const drug1 = document.getElementById("drug1").value.trim();
  const drug2 = document.getElementById("drug2").value.trim();

  if (!drug1 || !drug2) {
    alert("Please enter both drugs");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        drugs: [drug1, drug2]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    localStorage.setItem("interactionResult", JSON.stringify(data));

    window.location.href = "results.html";

  } catch (error) {
    console.error(error);
    alert("Failed to fetch interaction data");
  }
});