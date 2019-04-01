function plotGraph(results) {
	var ctx = document.getElementById("myChart").getContext('2d');
	var labels = [];
	var colors = [];
	var data = [];
	var a=0;
	results.forEach((result) => {
		labels.push(result.name);
		data.push(result.value);
		if(result.name==5){
			a=0.3;
		}
		else if(result.name==4){
			a=0.8;
		}
		else if(result.name==3){
			a=0.85	;
		}
		else{
			a=1;
		}
		colors.push('rgba(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + a + ')');
	});
	var myChart = new Chart(ctx, {
		type: 'pie',
		data: {
			labels: labels,
			datasets: [{
				label: 'Тест по "тема"',
				data: data,
				backgroundColor: colors,
				borderColor: colors,
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});
}

function processStatistics(students, marks) {
	var data = [];
	marks.forEach((grade) => {
		var count = 0;
		students.forEach((student) => {
			if (student.mark === grade.mark)
				count++;
		});

		if (count > 0)
			data.push({ name: grade.mark, value: count });
	});

	plotGraph(data);
}