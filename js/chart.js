
//TEST DATA..
const charData ={
labels: ["REMAS","SHUMOKH","MARWA"],
data: [60 ,25,30],

};

const myChart = document.querySelector(".risk");

new Chart(myChart, {
    type: "doughnut",
    data: {
        labels: charData.labels ,
        datasets: [

        {
            label: "PROJECT MEMBER",
            data: charData.data,
        
        },
    ],
    },
});

