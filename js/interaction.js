const addBtn = document.getElementById("add-btn");
const conta = document.querySelector(".drugs-container");
let count =3 ;

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