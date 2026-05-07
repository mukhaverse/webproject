const addBtn = document.getElementById("add-btn");
const conta = document.querySelector(".drugs-container");
const checkBtn = document.querySelector(".check-but");
const count =3 ;

addBtn.addEventListener("click",()=>{

    const drugField = document.createElement("div");
    drugField.classList.add("drug-field");

    drugField.innerHTML= `
     <label for="drug ${count}">Search Drug${count}</label>
     <input type="text" id="drug${count}" placeholder="Enter drug name" >

        <div>
            <ul class="list-div"></ul>
        </div>`

        conta.appendChild(drugField);
        count++;

})

checkBtn.addEventListener("click", async () => {
  const drug1 = document.getElementById("drug1").value.trim();
  const drug2 = document.getElementById("drug2").value.trim();

  if (!drug1 || !drug2) {
    alert("Please enter both drugs");
    return;
  }

  const response = await fetch("http://localhost:3000/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ drug1, drug2 })
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "Something went wrong");
    return;
  }

  window.location.href = "result.html";
});



