//GSAP ANIMATION....








//SCHEDULE RENDERING
const scheduleData = [
  { drug: "Drug 1", time: "04 am", color: "blue" },
  { drug: "Drug 2", time: "03 am", color: "pink" },
  { drug: "Drug 3", time: "05 am", color: "yellow" },
  { drug: "Drug 2", time: "06 am", color: "pink" },

  { drug: "Drug 1", time: "10 pm", color: "blue" },
  { drug: "Drug 2", time: "11 pm", color: "pink" },
  { drug: "Drug 3", time: "09 pm", color: "yellow" }
];

function getHourIndex(time) {
  const hour = parseInt(time.split(" ")[0], 10);
  return hour === 12 ? 1 : hour + 1;
}

function renderSchedule(data) {
  const amSchedule = document.getElementById("amSchedule");
  const pmSchedule = document.getElementById("pmSchedule");

  amSchedule.innerHTML = "";
  pmSchedule.innerHTML = "";

  for (let i = 1; i <= 12; i++) {
    const amSlot = document.createElement("div");
    amSlot.className = "hour-slot";
    amSlot.dataset.index = i;
    amSchedule.appendChild(amSlot);

    const pmSlot = document.createElement("div");
    pmSlot.className = "hour-slot";
    pmSlot.dataset.index = i;
    pmSchedule.appendChild(pmSlot);
  }

  data.forEach(item => {
    const index = getHourIndex(item.time);
    const container = item.time.includes("am") ? amSchedule : pmSchedule;
    const slot = container.querySelector(`.hour-slot[data-index="${index}"]`);

    if (!slot) return;

    slot.classList.add(`${item.color}-slot`);

    const wrapper = document.createElement("div");
    wrapper.className = "dose-wrapper";

    const dose = document.createElement("span");
    dose.className = `dose ${item.color}-dose`;

    wrapper.appendChild(dose);
    slot.appendChild(wrapper);
  });
}

function colorTimes(data) {
  const colors = {
    blue: "#36a5e8",
    pink: "#ff5b83",
    yellow: "#ffc64d"
  };

  data.forEach(item => {
    document.querySelectorAll(".time").forEach(t => {
      if (t.dataset.time === item.time) {
        t.style.color = colors[item.color];
      }
    });
  });
}

renderSchedule(scheduleData);
colorTimes(scheduleData);