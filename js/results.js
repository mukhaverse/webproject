const savedResult = JSON.parse(localStorage.getItem("interactionResult"));

const scheduleRecommendation = savedResult?.scheduleRecommendation;
const scheduleData = scheduleRecommendation?.scheduleData || [];

const scheduleSection = document.querySelector(".schedule-section");
const scheduleCard = document.querySelector(".schedule-card");

if (scheduleSection) {
  scheduleSection.style.display = "none";
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

  data.forEach((item) => {
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

  data.forEach((item) => {
    document.querySelectorAll(".time").forEach((t) => {
      if (t.dataset.time === item.time) {
        t.style.color = colors[item.color];
      }
    });
  });
}

function renderLegend(data) {
  const legendContainer = document.querySelector(".schedule-legend");
  if (!legendContainer) return;

  legendContainer.innerHTML = "";
  const added = new Set();

  data.forEach((item) => {
    if (added.has(item.drug)) return;
    added.add(item.drug);

    const legendItem = document.createElement("span");
    legendItem.innerHTML = `
      <i class="legend-line ${item.color}-dose"></i>
      ${item.drug}
    `;
    legendContainer.appendChild(legendItem);
  });
}

if (scheduleRecommendation?.show && scheduleSection) {
  scheduleSection.style.display = "block";

  let scheduleMessage = document.getElementById("scheduleMessage");

  if (!scheduleMessage) {
    scheduleMessage = document.createElement("p");
    scheduleMessage.id = "scheduleMessage";
    scheduleMessage.style.marginBottom = "20px";
    scheduleSection.insertBefore(scheduleMessage, scheduleCard);
  }

  scheduleMessage.textContent = scheduleRecommendation.message || "";

  if (
    !scheduleRecommendation.canSchedule ||
    !scheduleData ||
    scheduleData.length === 0
  ) {
    if (scheduleCard) {
      scheduleCard.style.display = "none";
    }
  } else {
    if (scheduleCard) {
      scheduleCard.style.display = "block";
    }

    renderSchedule(scheduleData);
    colorTimes(scheduleData);
    renderLegend(scheduleData);
  }
}

// ########## CHARTS ##########

const results = savedResult?.results || [];
const firstInteractionFound = results.find(r => r.result?.interaction_found && r.result?.interaction);
const firstInteraction = firstInteractionFound?.result?.interaction;

if (firstInteraction) {
  const severity = firstInteraction.severity?.toLowerCase() || "minor";

  let severityData = [0, 0, 0, 0];
  switch (severity) {
    case "contraindicated": severityData = [100, 0, 0, 0]; break;
    case "major":           severityData = [0, 100, 0, 0]; break;
    case "moderate":        severityData = [0, 0, 100, 0]; break;
    default:                severityData = [0, 0, 0, 100];
  }

  const riskCanvas = document.querySelector(".risk");
  if (riskCanvas && typeof Chart !== "undefined") {
    new Chart(riskCanvas, {
      type: "doughnut",
      data: {
        labels: ["Contraindicated", "Major", "Moderate", "Minor"],
        datasets: [{
          data: severityData,
          backgroundColor: ["#36A2EB", "#FF5B83", "#FF9F40", "#FFCD56"],
          borderWidth: 0
        }]
      },
      options: { responsive: true, cutout: "55%" }
    });
  }

  const descriptionText = firstInteraction.description?.toLowerCase() || "";
  const sideEffectsCanvas = document.querySelector(".effect-chart");

  if (sideEffectsCanvas && typeof Chart !== "undefined") {
    new Chart(sideEffectsCanvas, {
      type: "line",
      data: {
        labels: ["Bleeding", "Toxicity", "Drowsiness", "Heart Risk", "Other"],
        datasets: [{
          label: "Risk Level",
          data: [
            descriptionText.includes("bleeding") ? 9 : 1,
            descriptionText.includes("toxic") ? 8 : 1,
            descriptionText.includes("drowsiness") ? 7 : 1,
            descriptionText.includes("heart") ? 8 : 1,
            descriptionText.includes("interaction") ? 5 : 1
          ],
          borderColor: "#6C8EF5",
          backgroundColor: "rgba(108,142,245,0.25)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 10 } }
      }
    });
  }
}

// ########## CARDS ##########

const cardSection = document.querySelector(".card-sect");
if (cardSection) cardSection.innerHTML = "";

const interactionsFound = results.filter(r => r.result?.interaction_found && r.result?.interaction);

if (interactionsFound.length === 0 && cardSection) {
  cardSection.innerHTML = "<p>No interaction details found.</p>";
} else if (cardSection) {
  interactionsFound.forEach((r) => {
    const interaction = r.result.interaction;

    const cards = [
      {
        title: interaction.severity || "Unknown",
        value:
          interaction.severity === "major" ? "High-risk interaction requiring close monitoring." :
          interaction.severity === "moderate" ? "Moderate interaction that may require caution." :
          interaction.severity === "minor" ? "Minor interaction with limited clinical effect." :
          "Interaction severity information."
      },
      { title: "Description", value: interaction.description || "No description available." },
      { title: "Management", value: interaction.management || "No management available." },
      { title: "Clinical Significance", value: interaction.clinical_significance || "No clinical significance available." }
    ];

    cards.forEach((item) => {
      const card = document.createElement("article");
      card.className = "result-card";

      card.innerHTML = `
        <div class="status-div">
          <span class="badge">ID: ${interaction.id || "N/A"}</span>
        </div>
        <h2>${item.title}</h2>
        <div class="mini-info-card">
          <p>${item.value}</p>
        </div>
        <div class="drugs-result">
          <span class="drug-select">${r.drug1}</span>
          <span class="drug-select">${r.drug2}</span>
        </div>
      `;

      cardSection.appendChild(card);
    });
  });
}