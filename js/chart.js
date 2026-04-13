//Doughnut chart
//TEST DATA..
const charData ={
labels: ["Contraindicated","Major","Moderate","Minor"],
data: [60,25,30,95],
};

const myChart = document.querySelector(".risk");

new Chart(myChart, {
    type: "doughnut",
    data: {
        labels: charData.labels ,
        datasets: [

        {
            label: "Risk ratio",
            data: charData.data,
        
        },
    ],
    },
});



//line chart
const effectChart = document.querySelector(".effect-chart").getContext("2d");

//gradients
const grayGradient = effectChart.createLinearGradient(0, 0, 0, 300);
grayGradient.addColorStop(0, "rgba(200,200,200,0.9)");
grayGradient.addColorStop(1, "rgba(200,200,200,0.2)");

const blueGradient = effectChart.createLinearGradient(0, 0, 0, 300);
blueGradient.addColorStop(0, "rgba(80,100,230,0.9)");
blueGradient.addColorStop(1, "rgba(80,100,230,0.2)");

const cyanGradient = effectChart.createLinearGradient(0, 0, 0, 300);
cyanGradient.addColorStop(0, "rgba(100,200,220,0.9)");
cyanGradient.addColorStop(1, "rgba(100,200,220,0.2)");


//creat the chart
new Chart(effectChart, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "EDC",
        data: [200, 400, 300, 250, 350],
        backgroundColor: grayGradient,
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        stack: "stack1"
      },
      {
        label: "IRT",
        data: [50, 80, 150, 200, 100],
        backgroundColor: blueGradient,
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        stack: "stack1"
      },
      {
        label: "I",
        data: [30, 40, 60, 120, 50],
        backgroundColor: cyanGradient,
        borderWidth: 0,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        stack: "stack1"
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    interaction: {
      mode: "index",
      intersect: false
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false }
      },
      y: {
        stacked: true,
        display: false
      }
    }
  }
});



