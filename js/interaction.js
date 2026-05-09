let count = 3;

const addBtn = document.getElementById("add-btn");
const conta = document.querySelector(".drugs-container");
const checkBtn = document.getElementById("check-but");


// ########## autocomplete function ##########

function addAutocomplete(input) {

  input.addEventListener("input", async () => {

    const val = input.value.trim();

    const list = input.parentElement.querySelector(".list-div");
      list = document.createElement("ul");
      list.classList.add("list-div");

  input.parentElement.appendChild(list);

    // if input empty
    if (val === "") {
      list.innerHTML = "";
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:3000/search?q=${val}`
      );

      const data = await response.json();

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

      console.log("Error during autocomplete");

    }

  });

}


// ########## activate autocomplete for existing inputs ##########

const allInputs =
  document.querySelectorAll(".drugs-container input");

allInputs.forEach(addAutocomplete);




// ########## add new drug input ##########

addBtn.addEventListener("click", () => {

  const drugField = document.createElement("div");

  drugField.classList.add("drug-field");

  drugField.innerHTML = `
    <label for="drug${count}">
      Search Drug ${count}
    </label>

    <input
      type="text"
      id="drug${count}"
      placeholder="Enter drug name"
    >

    <ul class="list-div"></ul>
  `;

  conta.appendChild(drugField);

  // activate autocomplete for new input
  const newInput =
    drugField.querySelector("input");

  addAutocomplete(newInput);

  count++;

});




// ########## check interaction ##########

checkBtn.addEventListener("click", async (e) => {

  e.preventDefault();

  const drug1 =
    document.getElementById("drug1").value.trim();

  const drug2 =
    document.getElementById("drug2").value.trim();

  if (!drug1 || !drug2) {

    alert("Please enter both drugs");

    return;
  }

  try {

    const response = await fetch(
      "http://localhost:3000/check",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          drugs: [drug1, drug2]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.error || "Something went wrong");

      return;
    }

    localStorage.setItem(
      "interactionResult",
      JSON.stringify(data)
    );

    window.location.href = "results.html";

  } catch (error) {

    console.error(error);

    alert("Failed to fetch interaction data");

  }

});