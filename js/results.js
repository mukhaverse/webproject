// GSAP ANIMATION....




// LOAD RESULT FROM INTERACTION PAGE
const savedResult =
  JSON.parse(localStorage.getItem("interactionResult"));




// SCHEDULE RENDERING
const scheduleData =
  savedResult?.scheduleRecommendation?.scheduleData;

if (!scheduleData || scheduleData.length === 0) {
  console.error("Backend did not return schedule data");

  const scheduleSection =
    document.querySelector(".schedule-section");

  if (scheduleSection) {
    scheduleSection.style.display = "none";
  }
}

function getHourIndex(time) {
  const hour = parseInt(time.split(" ")[0], 10);
  return hour === 12 ? 1 : hour + 1;
}

function renderSchedule(data) {
  const amSchedule = document.getElementById("amSchedule");
  const pmSchedule = document.getElementById("pmSchedule");

  if (!amSchedule || !pmSchedule) return;

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
    pink: "#ff5b83",
    yellow: "#ffc64d",
    blue: "#36a5e8",
    orange: "#ff9f40",
    green: "#2ecc71",
    purple: "#9b5de5",
    cyan: "#00bcd4"
  };

  data.forEach(item => {
    document.querySelectorAll(".time").forEach(t => {
      if (t.dataset.time === item.time) {
        t.style.color = colors[item.color];
      }
    });
  });
}




// DYNAMIC SCHEDULE FROM BACKEND
const scheduleSection = document.querySelector(".schedule-section");
const scheduleCard = document.querySelector(".schedule-card");

if (scheduleSection) {
  scheduleSection.style.display = "none";
}

const scheduleRecommendation =
  savedResult?.scheduleRecommendation;

if (scheduleRecommendation?.show && scheduleSection) {
  scheduleSection.style.display = "block";

  let scheduleMessage =
    document.getElementById("scheduleMessage");

  if (!scheduleMessage) {
    scheduleMessage = document.createElement("p");
    scheduleMessage.id = "scheduleMessage";
    scheduleMessage.style.marginBottom = "20px";
    scheduleMessage.textContent =
      scheduleRecommendation.message || "";

    scheduleSection.insertBefore(scheduleMessage, scheduleCard);
  }

  if (!scheduleRecommendation.canSchedule) {
    if (scheduleCard) {
      scheduleCard.style.display = "none";
    }
  } else {
    if (scheduleCard) {
      scheduleCard.style.display = "block";
    }

    if (scheduleData && scheduleData.length > 0) {
      renderSchedule(scheduleData);
      colorTimes(scheduleData);
      renderLegend(scheduleData);
    }
  }
}




// DYNAMIC CHARTS
if (savedResult && savedResult.results?.length > 0) {
  const interactionData =
    savedResult.results[0].result?.interaction;

  if (interactionData) {
    const severity =
      interactionData.severity?.toLowerCase() || "minor";

    let severityData = [0, 0, 0, 0];

    switch (severity) {
      case "contraindicated":
        severityData = [100, 0, 0, 0];
        break;
      case "major":
        severityData = [0, 100, 0, 0];
        break;
      case "moderate":
        severityData = [0, 0, 100, 0];
        break;
      default:
        severityData = [0, 0, 0, 100];
    }

    const riskCanvas =
      document.querySelector(".risk");

    if (riskCanvas) {
      new Chart(riskCanvas, {
        type: "doughnut",
        data: {
          labels: [
            "Contraindicated",
            "Major",
            "Moderate",
            "Minor"
          ],
          datasets: [
            {
              data: severityData,
              backgroundColor: [
                "#36A2EB",
                "#FF5B83",
                "#FF9F40",
                "#FFCD56"
              ],
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          cutout: "55%",
          plugins: {
            legend: {
              display: true
            }
          }
        }
      });
    }

    const descriptionText =
      interactionData.description?.toLowerCase() || "";

    let bleeding = 1;
    let toxicity = 1;
    let drowsiness = 1;
    let heartRisk = 1;
    let other = 1;

    if (
      descriptionText.includes("bleeding") ||
      descriptionText.includes("hemorrhage")
    ) {
      bleeding = 9;
    }

    if (
      descriptionText.includes("toxicity") ||
      descriptionText.includes("toxic")
    ) {
      toxicity = 8;
    }

    if (
      descriptionText.includes("drowsiness") ||
      descriptionText.includes("sedation")
    ) {
      drowsiness = 7;
    }

    if (
      descriptionText.includes("heart") ||
      descriptionText.includes("cardiac")
    ) {
      heartRisk = 8;
    }

    if (descriptionText.includes("interaction")) {
      other = 5;
    }

    const sideEffectsCanvas =
      document.querySelector(".effect-chart");

    if (sideEffectsCanvas) {
      const sideEffectsCtx =
        sideEffectsCanvas.getContext("2d");

      new Chart(sideEffectsCtx, {
        type: "line",
        data: {
          labels: [
            "Bleeding",
            "Toxicity",
            "Drowsiness",
            "Heart Risk",
            "Other"
          ],
          datasets: [
            {
              label: "Risk Level",
              data: [
                bleeding,
                toxicity,
                drowsiness,
                heartRisk,
                other
              ],
              borderColor: "#6C8EF5",
              backgroundColor: "rgba(108,142,245,0.25)",
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 10
            }
          }
        }
      });
    }
  }
}




// DYNAMIC RESULT CARDS
const cardSection =
  document.querySelector(".card-sect");

if (
  savedResult &&
  savedResult.results &&
  savedResult.results.length > 0 &&
  cardSection
) {
  savedResult.results.forEach((item, index) => {
    const interaction =
      item.result?.interaction;

    if (!interaction) return;

    const card =
      document.createElement("article");

    card.className = "resul-card";
    card.setAttribute("aria-labelledby", `card${index + 1}`);

    const createdDate =
      interaction.created_at
        ? new Date(interaction.created_at)
        : new Date();

    const dateText =
      createdDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short"
      });

    card.innerHTML = `
      <div class="status-div">
        <time class="date">${dateText}</time>
        <span class="badge">STATUS</span>
      </div>

      <div class="info-div">
        <h2 id="card${index + 1}">${interaction.severity || "Unknown"}</h2>
        <p class="uni-id">ID: ${interaction.id || "N/A"}</p>
        <p>${interaction.description || "No description available."}</p>
      </div>

      <div class="drugs-result">
        <span class="drug-select">
          ${item.drug1?.normalized || item.drug1?.original || "Drug 1"}
        </span>
        <span class="drug-select">
          ${item.drug2?.normalized || item.drug2?.original || "Drug 2"}
        </span>
      </div>
    `;

    cardSection.appendChild(card);
  });
}


function renderLegend(data) {
  const legendContainer =
    document.querySelector(".schedule-legend");

  if (!legendContainer) return;

  legendContainer.innerHTML = "";

  const added = new Set();

  data.forEach(item => {
    if (added.has(item.drug)) return;

    added.add(item.drug);

    const legendItem =
      document.createElement("span");

    legendItem.innerHTML = `
      <i class="legend-line ${item.color}-dose"></i>
      ${item.drug}
    `;

    legendContainer.appendChild(legendItem);
  });
}