document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modal");
    const openBtn = document.getElementById("openBtn");
    const closeBtn = document.getElementById("closeBtn");
    const overlay = document.getElementById("overlay");
    const box = document.querySelector(".modal-box");

    const submit = document.getElementById("submit");
    const list = document.getElementById("list");
    const nameInput = document.getElementById("name");
    const messageInput = document.getElementById("message");


    
    
    openBtn.addEventListener("click", () => {
        modal.classList.add("active");

        gsap.to(box, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        });
    });


    


    function closeModal() {
        gsap.to(box, {
            scale: 0.95,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => modal.classList.remove("active")
        });
    }

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });


    

    submit.addEventListener("click", () => {

        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            alert("Fill both fields");
            return;
        }

        const initials = name
            .split(" ")
            .map(n => n[0])
            .join("")
            .substring(0,2)
            .toUpperCase();

        const item = document.createElement("div");
        item.className = "item";

        item.innerHTML = `
            <div class="avatar">${initials}</div>
            <div class="text">
                <strong>${escapeHTML(name)}</strong>
                <p>"${escapeHTML(message)}"</p>
            </div>
        `;

        list.prepend(item);

        nameInput.value = "";
        messageInput.value = "";

        closeModal();
    });


    



    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[m]);
    }

});