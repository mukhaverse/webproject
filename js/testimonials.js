document.addEventListener('DOMContentLoaded', () => {

    const wrapper = document.getElementById('wrapper');
    const toggleBtn = document.getElementById('toggleFormBtn');
    const panels = document.querySelectorAll('.lr-panel');

    const submitBtn = document.getElementById('submitGuestbook');
    const list = document.getElementById('entriesContainer');

    const nameInput = document.getElementById('guestName');

    const messageInput = document.getElementById('guestMessage');


    let isOpen = false;


    

    toggleBtn.addEventListener('click', () => {

        const initialHeight = wrapper.offsetHeight;

        wrapper.classList.toggle('active');
        const newHeight = wrapper.offsetHeight;
        wrapper.classList.toggle('active');

        const lockedHeight = Math.max(initialHeight, newHeight);
        wrapper.style.height = lockedHeight + "px";

        if (!isOpen) {

            gsap.to(panels, {
                x: "0%",
                stagger: 0.05,
                duration: 0.45,
                ease: "power1.inOut",
                onUpdate: function () {


                    if (this.progress() > 0.9 && !isOpen) {
                        wrapper.classList.add('active');
                        isOpen = true;
                    }
                },
                onComplete: () => {

                    gsap.to(panels, {
                        x: "100%",
                        stagger: 0.05,
                        duration: 0.45,
                        ease: "power1.inOut",
                        onComplete: () => {
                            gsap.set(panels, { x: "-100%" });
                            wrapper.style.height = "";
                        }
                    });

                }
            });

        } else {

            gsap.set(panels, { x: "100%" });

            gsap.to(panels, {
                x: "0%",
                stagger: 0.05,
                duration: 0.45,
                ease: "power1.inOut",
                onUpdate: function () {


                    if (this.progress() > 0.9 && isOpen) {
                        wrapper.classList.remove('active');
                        isOpen = false;
                    }
                },
                onComplete: () => {

                    gsap.to(panels, {
                        x: "-100%",
                        stagger: 0.05,
                        duration: 0.45,
                        ease: "power1.inOut",
                        onComplete: () => {
                            wrapper.style.height = "";
                        }
                    });

                }
            });
        }

    });


    



    submitBtn.addEventListener('click', () => {

        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            alert("Please fill in both fields!");
            return;
        }

        
        const now = new Date();
        const timeString = now.toLocaleDateString() + ' ' +
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });



        const noEntries = list.querySelector('.no-entries');
        if (noEntries) noEntries.remove();


        const entry = document.createElement('div');
        entry.className = 'testimonial-card';


        entry.innerHTML = `
            <div class="entry-header">
                <span class="entry-name">${escapeHTML(name)}</span>
                <span class="entry-time">${timeString}</span>
            </div>
            <p class="entry-message">${escapeHTML(message)}</p>
        `;

        list.prepend(entry);

        nameInput.value = '';
        messageInput.value = '';


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