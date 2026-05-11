// let count = 3;

// const addBtn = document.getElementById("add-btn");
// const conta = document.querySelector(".drugs-container");
// const checkBtn = document.getElementById("check-but");


// // ########## apply autocomplete to inputs ##########

// function addAutocomplete(input) {
//   input.addEventListener("input", async () => {
//     const val = input.value.trim();

//     let list = input.parentElement.querySelector(".list-div");

//     if (!list) {
//       list = document.createElement("ul");
//       list.classList.add("list-div");
//       input.parentElement.appendChild(list);
//     }

//     if (val === "") {
//       list.innerHTML = "";
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://medixa.onrender.com/search?q=${val}`
//       );

//       const data = await response.json();

//       list.innerHTML = "";

//       data.forEach((drug) => {
//         const li = document.createElement("li");

//         li.textContent = drug.name;

//         li.addEventListener("click", () => {
//           input.value = drug.name;
//           list.innerHTML = "";
//         });

//         list.appendChild(li);
//       });

//     } catch (error) {
//       console.log("Error during autocomplete");
//       list.innerHTML = "";
//     }
//   });
// }


// // activate autocomplete for drug1 and drug2
// const allInputs = document.querySelectorAll(".drugs-container input");

// allInputs.forEach(addAutocomplete);


// // ########## add new drug input ##########

// addBtn.addEventListener("click", () => {
//   const drugField = document.createElement("div");
//   drugField.classList.add("drug-field");

//   drugField.innerHTML = `
//     <label for="drug${count}">Search Drug ${count}</label>
//     <input
//       type="text"
//       id="drug${count}"
//       placeholder="Enter drug name"
//     >
//   `;

//   conta.appendChild(drugField);

//   const newInput = drugField.querySelector("input");
//   addAutocomplete(newInput);

//   count++;
// });


// // ########## check interaction ##########

// checkBtn.addEventListener("click", async (e) => {
//   e.preventDefault();

//   const inputs = document.querySelectorAll(".drugs-container input");

//   const drugs = [];

//   inputs.forEach((input) => {
//     const value = input.value.trim();

//     if (value !== "") {
//       drugs.push(value);
//     }
//   });

//   if (drugs.length < 2) {
//     alert("Please enter at least two drugs");
//     return;
//   }

//   try {


//     // const response = await fetch(
//     //   "https://medixa.onrender.com/check",
//     //   {
//     //     method: "POST",

//     //     headers: {
//     //       "Content-Type": "application/json"
//     //     },

//     //     body: JSON.stringify({
//     //       drugs: [drug1, drug2]
//     //     })
//     //   }
//     // );

//     const token = localStorage.getItem("token");
// const response = await fetch("https://medixa.onrender.com/check", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     ...(token ? { "Authorization": `Bearer ${token}` } : {})
//   },
//   body: JSON.stringify({ drugs })
// });


//     const data = await response.json();

//     if (!response.ok) {
//       alert(data.error || "Something went wrong");
//       return;
//     }

//     localStorage.setItem(
//       "interactionResult",
//       JSON.stringify(data)
//     );

//     window.location.href = "results.html";

//   } catch (error) {
//     console.error(error);
//     alert("Failed to fetch interaction data");
//   }
// });



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

// activate autocomplete for drug1 and drug2
const allInputs = document.querySelectorAll(".drugs-container input");
allInputs.forEach(addAutocomplete);

// ########## add new drug input ##########

addBtn.addEventListener("click", () => {
  const drugField = document.createElement("div");
  drugField.classList.add("drug-field");

  drugField.innerHTML = `
    <label for="drug${count}">Search Drug ${count}</label>
    <input
      type="text"
      id="drug${count}"
      placeholder="Enter drug name"
    >
  `;

  conta.appendChild(drugField);

  const newInput = drugField.querySelector("input");
  addAutocomplete(newInput);

  count++;
});

// ########## check interaction ##########

checkBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const inputs = document.querySelectorAll(".drugs-container input");
  const drugs = [];

  inputs.forEach((input) => {
    const value = input.value.trim();

    if (value !== "") {
      drugs.push(value);
    }
  });

  if (drugs.length < 2) {
    alert("Please enter at least two drugs");
    return;
  }

  try {
    const token = localStorage.getItem("token");

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

    localStorage.setItem("interactionResult", JSON.stringify(data));

    window.location.href = "results.html";
  } catch (error) {
    console.error(error);
    alert("Failed to fetch interaction data");
  }
});