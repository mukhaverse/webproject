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



    
    

    submit.addEventListener("click", async () => {

        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            alert("Fill both fields");
            return;
        }

        // send to backend
        try {
            await fetch("http://localhost:3000/testimonials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, message })
            });
        } catch (err) {
            console.error("Failed to save:", err);
        }

        
        const now = new Date();

        const time = now.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });

        const item = document.createElement("div");
        item.className = "item";

        item.innerHTML = `
            <div class="avatar">${time}</div>
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



    



    async function loadTestimonials() {
        try {
            const res = await fetch("http://localhost:3000/testimonials");
            const data = await res.json();

            data.forEach(t => {

                const date = new Date(t.created_at);

                const time = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                });

                const item = document.createElement("div");
                item.className = "item";

                item.innerHTML = `
                    <div class="avatar">${time}</div>
                    <div class="text">
                        <strong>${escapeHTML(t.name)}</strong>
                        <p>"${escapeHTML(t.message)}"</p>
                    </div>
                `;

                list.appendChild(item);
            });

        } catch (err) {
            console.error("Failed to load testimonials:", err);
        }
    }

    loadTestimonials();





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