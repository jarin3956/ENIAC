const width_threshold = 480;


async function LineChartData() {

  let response = await fetch('/admin/dash-bord/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },

  });
  let res = await response.json();
  if (res) {
    let pieMonth = []
    let pieData = []
    
    let totalRevenueofMonth = []
    let totalRevenueofData = []
    res.pie.forEach(({
      _id,
      sum
    }) => {
      pieMonth.push(_id.status)
      pieData.push(sum)
    })

    
    

    res.revenue.forEach(({
      _id,
      sum
    }) => {
      totalRevenueofMonth.push(_id)
      totalRevenueofData.push(sum)
    })




    drawBarChart(totalRevenueofMonth, totalRevenueofData)
    drawPieChart(pieMonth, pieData)
    drawDonutChart(res.chart.delivered, res.chart.cancelled, res.chart.returned)
    
    drawDonutChart2(res.proC.categoryNames, res.proC.productCounts);
  }
}


LineChartData()


function drawDonutChart2(categoryNames, productCounts) {
  if ($("#donutChart2").length) {
    var chartHeight = 300;

    $("#donutChartContainer2").css("height", chartHeight + "px");

    var ctxDonut2 = document.getElementById("donutChart2").getContext("2d");

    var optionsDonut2 = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      },
      legend: {
        position: "right"
      }
    };

    var configDonut2 = {
      type: "doughnut",
      data: {
        labels: categoryNames,
        datasets: [
          {
            data: productCounts,
            backgroundColor: [
              "#4ED6B8",
              "#FFCE56",
              "#36A2EB",
              "#FF6384",
              "#1F77B4",
              "#FF7F0E",
              "#2CA02C",
              "#9467BD",
              "#8C564B",
              "#E377C2"
            ]
          }
        ]
      },
      options: optionsDonut2
    };

    var donutChart2 = new Chart(ctxDonut2, configDonut2);

    // Show product count on hover
    ctxDonut2.canvas.addEventListener("mousemove", function(event) {
      var activePoints = donutChart2.getElementsAtEvent(event);
      var firstPoint = activePoints[0];
      if (firstPoint) {
        var label = donutChart2.data.labels[firstPoint._index];
        var value = donutChart2.data.datasets[0].data[firstPoint._index];
        var total = donutChart2.data.datasets[0].data.reduce(
          (a, b) => a + b,
          0
        );
        var percent = ((value / total) * 100).toFixed(2) + "%";
        var tooltipText = `${value} Products (${percent})`;
        $("#donutChart2").attr("title", tooltipText);
      } else {
        $("#donutChart2").removeAttr("title");
      }
    });
  }
}




function drawDonutChart(delivered, cancelled, returned) {
  if ($("#donutChart").length) {
    ctxDonut = document.getElementById("donutChart").getContext("2d");
    optionsDonut = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            var label = data.labels[tooltipItem.index] || '';

            if (label) {
              label += ': ';
            }
            label += data.datasets[0].data[tooltipItem.index];
            label += ' orders';
            return label;
          }
        }
      }
    };
    configDonut = {
      type: "doughnut",
      data: {
        labels: ["Delivered", "Cancelled", "Returned"],
        datasets: [{
          data: [delivered, cancelled, returned],
          backgroundColor: [
            "#8BC34A", // green for delivered
            "#FF6384", // red for cancelled
            "#36A2EB" // blue for returned
          ]
        }]
      },
      options: optionsDonut
    };
    donutChart = new Chart(ctxDonut, configDonut);
  }
}






function drawBarChart(month, data) {
  if ($("#barChart").length) {
    ctxBar = document.getElementById("barChart").getContext("2d");

    optionsBar = {
      responsive: true,
      scales: {
        xAxes: [{
          
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            
          }
        }],
        yAxes: [{
          barPercentage: 0.2,
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            
          }
        }]
        
      }
    };

    

    /**
     * COLOR CODES
     * Red: #F7604D
     * Aqua: #4ED6B8
     * Green: #A8D582
     * Yellow: #D7D768
     * Purple: #9D66CC
     * Orange: #DB9C3F
     * Blue: #3889FC
     */

    var labels = month.map(function(m) {
      return m + "th week";
    })

    configBar = {
      type: "horizontalBar",
      data: {
        labels: labels,
        datasets: [{
          label: "Revenue",
          data: data,
          backgroundColor: [
            "#F7604D",
            "#4ED6B8",
            "#A8D582",
            "#D7D768",
            "#9D66CC",
            "#DB9C3F",
            "#3889FC"
          ],
          borderWidth: 0
        }]
      },
      options: optionsBar
    };

    barChart = new Chart(ctxBar, configBar);
  }
}





function drawPieChart(month, data) {
  if ($("#pieChart").length) {
    var chartHeight = 300;

    $("#pieChartContainer").css("height", chartHeight + "px");

    ctxPie = document.getElementById("pieChart").getContext("2d");

    optionsPie = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      },
      legend: {
        position: "top"
      }
    };

    configPie = {
      type: "pie",
      data: {
        datasets: [{
          data: data,
          backgroundColor: ["#4ED6B8", "#F7604D"],
          label: "Payment Method"
        }],
        labels: ["COD", "Online Payment"]
      },
      options: optionsPie
    };

    pieChart = new Chart(ctxPie, configPie);
  }
}





function updateDonutChart() {
  if (donutChart) {
    donutChart.options = optionsDonut;
    donutChart.update();
  }
}




function updateBarChart() {
  if (barChart) {
    barChart.options = optionsBar;
    barChart.update();
  }
}