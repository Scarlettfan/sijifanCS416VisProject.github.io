function raw(obj) {
    return JSON.parse(JSON.stringify(obj));
}
const buttonColorSelected = "#fed966";
const buttonColorUnSelected = "white";
var rawDataConfirm;
var rawDataDeath;
var showConfirmedCases = true;
var selectedYear = 2021,
    selectedState = "California",
    SVGTitle = "Confirmed Cases In Year ",
    YAxisText = "Confirmed Cases";
var percentageButtonOn = false;
let states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

function setPercentage() {
    countButton.style.backgroundColor = buttonColorUnSelected;
    percentageButton.style.backgroundColor = buttonColorSelected;
    SVGTitle = "Death Cases Percentage In Year ";
    YAxisText = "Death Percentage (Unit: %)";
    let returnedPercentage = calculateDeathPercentage();
    drawSVG(returnedPercentage, showConfirmedCases);
}

function removeSpace(str) { return str.replace(/\s/g, ''); }

async function fetchData() {
    let response = await fetch("https://sijiafan416dashboardserver.herokuapp.com/fetchdata");
    let dataJson = await response.json();

    rawDataConfirm = raw(dataJson.data.confirmedCases);
    rawDataDeath = raw(dataJson.data.deathCases);

    startDrawSVG()
        // slider
    var slider = document.getElementById("inputYear");
    slider.oninput = function() {
        selectedYear = parseInt(String(this.value))
        if (!showConfirmedCases && percentageButtonOn) {
            setPercentage();
        } else {
            startDrawSVG()
        }
    };
    // set up the state
    var str = ''
    states.forEach(function(state) {
        str += '<li><a id = ' + removeSpace(state) + ' href="#">' + state + '</a></li>';
    });


    var search = document.getElementById("myInput");
    var filter, ul, li, a, i, txtValue;

    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
    search.onkeyup = function() {
        document.getElementById("myUL").innerHTML = str;

        filter = search.value.toUpperCase();
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("a")[0];
            txtValue = a.textContent || a.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";

            } else {
                li[i].style.display = "none";
            }
        }
        if (!filter) {
            document.getElementById("myUL").innerHTML = "";
        }
        states.forEach(function(state) {
            var element = document.getElementById(removeSpace(state));
            if (element != null) {
                element.addEventListener("click", function() {
                    selectedState = element.innerText;
                    search.value = selectedState;
                    document.getElementById("myUL").innerHTML = "";
                    if (!showConfirmedCases && percentageButtonOn) {
                        setPercentage();
                    } else {
                        startDrawSVG()
                    }
                });
            }

        });

    }

    var firstButton = document.getElementById("firstButton");
    var secondButton = document.getElementById("secondButton")
    var countButton = document.getElementById("countButton");
    var percentageButton = document.getElementById("percentageButton");

    function showButton() {
        document.getElementById("segmentControl2").style.visibility = 'visible';
    }

    function hideButton() {
        document.getElementById("segmentControl2").style.visibility = 'hidden';
    }

    countButton.addEventListener("click", function() {
        percentageButtonOn = false;
        percentageButton.style.backgroundColor = buttonColorUnSelected;
        countButton.style.backgroundColor = buttonColorSelected;
        SVGTitle = "Death Cases In Year ";
        YAxisText = "Death Cases";
        startDrawSVG();
    })
    percentageButton.addEventListener("click", function() {
        percentageButtonOn = true;
        if (!isShowing(countButton)) {
            countButton.style.backgroundColor = buttonColorUnSelected;
            percentageButton.style.backgroundColor = buttonColorSelected;
            SVGTitle = "Death Cases Percentage In Year ";
            YAxisText = "Death Percentage (Unit: %)";
            let returnedPercentage = calculateDeathPercentage();
            drawSVG(returnedPercentage, showConfirmedCases);
        }
    })
    firstButton.addEventListener("click", function() {
        if (!isShowing(firstButton)) {
            //hide count/percentage selector button
            hideButton();
            firstButton.style.backgroundColor = buttonColorSelected;
            secondButton.style.backgroundColor = buttonColorUnSelected;
            SVGTitle = "Confirmed Cases In Year ";
            YAxisText = "Confirmed Cases";
            showConfirmedCases = true;
            percentageButtonOn = false;
            startDrawSVG();
        }

    })
    secondButton.addEventListener("click", function() {
        if (!isShowing(secondButton)) {
            //show count/percentage selector button
            showButton();
            firstButton.style.backgroundColor = buttonColorUnSelected;
            secondButton.style.backgroundColor = buttonColorSelected;
            countButton.style.backgroundColor = buttonColorSelected;
            percentageButton.style.backgroundColor = buttonColorUnSelected;
            SVGTitle = "Death Cases In Year ";
            YAxisText = "Death Cases";
            showConfirmedCases = false;
            // percentageButtonOn = false;
            startDrawSVG();
        }
    })
    let dataCA = getDataSampleByYearAndState(true, 2021, "California");
    let dataTX = getDataSampleByYearAndState(true, 2021, "Texas");
    let dataIllinois = getDataSampleByYearAndState(true, 2021, "Illinois");

    let decerasingMonthDataSampleCA = getDecreasingDataSample(dataCA);
    let decreasingMonthDataSampleTX = getDecreasingDataSample(dataTX);
    let decreasingMonthDataSampleIllinois = getDecreasingDataSample(dataIllinois);
    let title = "Cases Decreasing In 2021 Consecutive Months";
    SVGByIds(decerasingMonthDataSampleCA,
        "chart_overview1",
        showConfirmedCases,
        title + " CA", "Month", "Confirm cases");
    SVGByIds(decreasingMonthDataSampleTX,
        "chart_overview2",
        showConfirmedCases,
        title + " Texas", "Month", "Confirm cases");
    SVGByIds(decreasingMonthDataSampleIllinois,
        "chart_overview3",
        showConfirmedCases,
        title + " Illinois", "Month", "Confirm cases");
}


function calculateDeathPercentage() {
    /*
     * need to get confirmedCasesMonthlydata
     * each monthlyData / each confirmedCasesMonthlydata
     * return array
     */
    // let deathRateMonthly = []
    // let sum = 0;
    let deathPercentageForSelectedYear = [];
    let confirmedCasesMonthlydata = getDataSampleForSelectedYear(raw(rawDataConfirm));
    let deathCaseMonthlydata = getDataSampleForSelectedYear(raw(rawDataDeath))



    for (var i = 0; i < deathCaseMonthlydata.length; i++) {
        // sum += deathCaseMonthlydata[i].y;

        let x = deathCaseMonthlydata[i].x;
        let y = 0;
        if (deathCaseMonthlydata[i].y === 0) {
            y = 0;
        } else {
            y = (deathCaseMonthlydata[i].y / confirmedCasesMonthlydata[i].y * 100).toPrecision(3);

        }

        deathPercentageForSelectedYear.push({ x: x, y: y });
    }
    // for(var i = 0;i < deathCaseMonthlydata.length; i++){
    //     let x = deathCaseMonthlydata[i].x;
    //     let y = (deathCaseMonthlydata[i].y/sum *100).toPrecision(3);
    //     deathRateMonthly.push({x:x,y:y});
    // }
    return deathPercentageForSelectedYear;
}

function addCasesByMonth(data) {
    let rawData = raw(data);
    let monthlyData = [];
    const monthNameList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < rawData.length; i += 1) {
        let currentData = rawData[i];
        let object = {};
        // set each month as 0
        for (let j = 0; j < monthNameList.length; j += 1) {
            let monthName = monthNameList[j];
            object[monthName] = 0;
        }

        for (const [key, value] of Object.entries(currentData)) {
            if (key.includes("/")) {
                let monthNum = parseInt(key.substring(0, key.indexOf("/")));
                let monthName = monthNameList[monthNum - 1];

                object[monthName] += parseInt(value.toString());
            } else {
                object[key] = value
            }
        }
        monthlyData.push(object);
    }

    // show death data percentage



    return raw(monthlyData);
}

function convertToMonthData(arr) {
    let resultArr = [];

    for (let i = 0; i < arr.length; i += 1) {
        resultArr.push(addCasesByMonth(arr[i]));
    }
    return raw(resultArr);
}

function drawSVG(dataSample, confirmed = true) {
    let sample = raw(dataSample);
    if (percentageButtonOn) {
        console.log(dataSample)
    }
    const svg = d3.select("#chart_monthly");
    // const svgContainer = d3.select('#container');
    d3.select("#chart_monthly").selectAll("*").remove();
    const margin = 80;
    const width = 700 - 2 * margin;
    const height = 500 - 2 * margin;

    const chart = d3.select("#chart_monthly").append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.x))
        .padding(0.3)

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, findMaxY(sample)]);

    const makeYLines = () => d3.axisLeft()
        .scale(yScale)

    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    chart.append('g')
        .call(d3.axisLeft(yScale));

    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        )

    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')

    barGroups
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.x))
        .attr('width', xScale.bandwidth())
        // .attr("height", 0)
        // .attr("y", height)
        // .transition().duration(3000)
        .attr('y', (d) => yScale(d.y))
        .attr('height', (d) => height - yScale(d.y))

    .on('mouseenter', function(actual, i) {
            d3.selectAll('.value')
                .attr('opacity', 0)

            d3.select(this)
                .transition()
                .duration(300)
                .style("fill", d3.color("orange"))
                .attr('x', (d) => xScale(d.x) - 5)
                .attr('width', xScale.bandwidth() + 10)

            const y = yScale(actual.y)

            line = chart.append('line')
                .attr('id', 'limit')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)

            barGroups.append('text')
                .attr('class', 'divergence')
                .attr('x', (d) => xScale(d.x) + xScale.bandwidth() / 2)
                .attr('y', (d) => yScale(d.y))
                .attr('text-anchor', 'middle')

            .text((d, idx) => {
                let divergence = d.y - actual.y;
                let text = "+";

                if (divergence < 0) {
                    text = ""
                }
                divergence *= 1.0;

                // if the percentage is on
                if (!showConfirmedCases && percentageButtonOn) {
                    text += `${divergence.toPrecision(3)}%`
                } else {
                    divergence /= 1000000;
                    divergence = divergence.toFixed(1);

                    if (divergence <= 0.0) {
                        let difference = d.y - actual.y;
                        difference *= 1.0;
                        difference /= 1000;
                        difference = difference.toFixed(1);
                        text += `${difference}K`
                    } else {
                        text += `${divergence}M`
                    }
                }
                if (!showConfirmedCases && selectedYear === 2022 && d.y === 0) {
                    return '';
                }
                return idx !== i ? text : '';
            })
        })
        .on('mouseleave', function() {
            d3.selectAll('.value')
                .attr('opacity', 1)

            d3.select(this)
                .transition()
                .duration(300)
                .style("fill", "#80cbc4")
                .attr('opacity', 1)
                .attr('x', (d) => xScale(d.x))
                .attr('width', xScale.bandwidth())

            chart.selectAll('#limit').remove()
            chart.selectAll('.divergence').remove()
        })

    barGroups
        .append('text')
        .attr('class', 'value')
        .attr('x', (d) => xScale(d.x) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.y))
        .attr('text-anchor', 'middle')
        .text((d) => {
            let value = `${d.y}`;
            if (!showConfirmedCases && selectedYear === 2022 && d.y === 0) {
                return '';
            }
            if (!showConfirmedCases && percentageButtonOn) {
                value = `${d.y}%`
            }
            return value;
        })



    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 5)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text(YAxisText)

    svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text('Month')

    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)

    .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(SVGTitle + selectedYear + " Of " + selectedState)

    svg.append('text')
        .attr('class', 'source')
        .attr('x', width - margin / 2)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'start')
        .text('Source: Johns Hopkins University Medical, July 2022')


}

function SVGByIds(dataSample, id = "chart_overview1", confirmed = true, overViewTitle = "", overViewXAxisText = "", overViewYAxisText = "") {
    let sample = raw(dataSample);

    const svg = d3.select("#" + id);
    // const svgContainer = d3.select('#container');
    d3.select("#" + id).selectAll("*").remove();
    const margin = 80;
    const width = 700 - 2 * margin;
    const height = 500 - 2 * margin;

    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.x))
        .padding(0.3)

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, findMaxY(sample)]);

    const makeYLines = () => d3.axisLeft()
        .scale(yScale)

    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    chart.append('g')
        .call(d3.axisLeft(yScale));

    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        )

    const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')

    barGroups
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.x))
        .attr('width', xScale.bandwidth())
        // .attr("height", 0)
        // .attr("y", height)
        // .transition().duration(3000)
        .attr('y', (d) => yScale(d.y))
        .attr('height', (d) => height - yScale(d.y))

    .on('mouseenter', function(actual, i) {
            d3.selectAll('.value')
                .attr('opacity', 0)

            d3.select(this)
                .transition()
                .duration(300)
                .style("fill", d3.color("orange"))
                .attr('x', (d) => xScale(d.x) - 5)
                .attr('width', xScale.bandwidth() + 10)

            const y = yScale(actual.y)

            line = chart.append('line')
                .attr('id', 'limit')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)

            barGroups.append('text')
                .attr('class', 'divergence')
                .attr('x', (d) => xScale(d.x) + xScale.bandwidth() / 2)
                .attr('y', (d) => yScale(d.y))
                .attr('text-anchor', 'middle')

            .text((d, idx) => {
                let divergence = d.y - actual.y;
                let text = "+";

                if (divergence < 0) {
                    text = ""
                }
                divergence *= 1.0;

                // if the percentage is on
                if (!showConfirmedCases && percentageButtonOn) {
                    text += `${divergence.toPrecision(3)}%`
                } else {
                    divergence /= 1000000;
                    divergence = divergence.toFixed(1);

                    if (divergence <= 0.0) {
                        let difference = d.y - actual.y;
                        difference *= 1.0;
                        difference /= 1000;
                        difference = difference.toFixed(1);
                        text += `${difference}K`
                    } else {
                        text += `${divergence}M`
                    }
                }
                if (!showConfirmedCases && selectedYear === 2022 && d.y === 0) {
                    return '';
                }
                return idx !== i ? text : '';
            })
        })
        .on('mouseleave', function() {
            d3.selectAll('.value')
                .attr('opacity', 1)

            d3.select(this)
                .transition()
                .duration(300)
                .style("fill", "#80cbc4")
                .attr('opacity', 1)
                .attr('x', (d) => xScale(d.x))
                .attr('width', xScale.bandwidth())

            chart.selectAll('#limit').remove()
            chart.selectAll('.divergence').remove()
        })

    barGroups
        .append('text')
        .attr('class', 'value')
        .attr('x', (d) => xScale(d.x) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.y))
        .attr('text-anchor', 'middle')
        .text((d) => {
            let value = `${d.y}`;
            if (!showConfirmedCases && selectedYear === 2022 && d.y === 0) {
                return '';
            }
            if (!showConfirmedCases && percentageButtonOn) {
                value = `${d.y}%`
            }
            return value;
        })



    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 5)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text(overViewYAxisText)

    svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text(overViewXAxisText)

    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)

    .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(overViewTitle)

    svg.append('text')
        .attr('class', 'source')
        .attr('x', width - margin / 2)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'start')
        .text('Source: Johns Hopkins University Medical, July 2022')


}

function findMaxY(arr) {
    let rawData = raw(arr);
    return Math.max.apply(null, rawData.map(obj => {
        return obj.y;
    }));
}

function getDataSampleForSelectedYear(data) {
    let year2020 = [],
        year2021 = [],
        year2022 = [];
    for (let i = 0; i < data.length; i += 1) {
        let currentData = data[i];
        let object2020 = {},
            object2021 = {},
            object2022 = {};

        for (const [key, value] of Object.entries(currentData)) {

            if (key.match("([0-9]?[0-9]\\/[0-9]?[0-9]\\/20)")) { // year ends in 20
                object2020[key] = value;
            } else if (key.match("([0-9]?[0-9]\/[0-9]?[0-9]\/21)")) { // year ends in 21
                object2021[key] = value;
            } else if (key.match("([0-9]?[0-9]\\/[0-9]?[0-9]\\/22)")) { // year ends in 22
                object2022[key] = value;
            } else if (key === "Province_State") { // set state name
                object2020[key] = value;
                object2021[key] = value;
                object2022[key] = value;
            }
        }
        year2020.push(object2020);
        year2021.push(object2021);
        year2022.push(object2022);
    }

    const yearData = [year2020, year2021, year2022];
    const monthData = convertToMonthData(raw(yearData));

    let dataSample = getStateMonthData(monthData, selectedYear, selectedState);

    return dataSample;
}

function getStateMonthData(data, year, state) {
    let rawData = raw(data);

    let yearIndex = year - 2020;
    let selectedYearData = rawData[yearIndex]
        // console.log(selectedYearData);
    let arrObj = []
        // console.log(state)
    for (let i = 0; i < selectedYearData.length; i++) {
        // console.log(selectedYearData[i]["Province_State"] === state)
        if (selectedYearData[i]["Province_State"] === state) {
            // console.log(selectedYearData[i]);
            for (const [key, value] of Object.entries(selectedYearData[i])) {
                if (key !== "Province_State")
                    arrObj.push({ x: key, y: value });
            }
        }
    }

    return raw(arrObj);
}

function startDrawSVG() {
    drawSVG(getDataSampleForSelectedYear(returnSelectedData()), showConfirmedCases);
}

function isShowing(button) {
    return button.style.backgroundColor === buttonColorSelected;
}

function returnSelectedData() {
    if (showConfirmedCases) {
        return raw(rawDataConfirm);
    } else {
        return raw(rawDataDeath);
    }
}

function getIncreasingDataSample(dataSample) {
    let monthList = [],
        casesLists = [];

    for (let i = 0; i < dataSample.length; i += 1) {
        let currentRow = dataSample[i];
        monthList.push(currentRow["x"]);
        casesLists.push(currentRow["y"]);
    }
    let startIndex = 1,
        endIndex = 1; // will skip Jan and start from Feb
    let recordList = [];
    while (startIndex !== casesLists.length && endIndex <= (casesLists.length - 1)) {
        endIndex += 1;
        if (casesLists[endIndex] >= casesLists[endIndex - 1]) {

            continue;
        } else {
            if (recordList.length === 0) {
                recordList.push(startIndex);
                recordList.push(endIndex - 1);
            } else {
                let range = recordList[1] - recordList[0];
                if (range > (endIndex - 1 - startIndex)) {
                    // do nothing 
                } else {
                    recordList[0] = startIndex;
                    recordList[1] = endIndex - 1;
                }
            }
            startIndex += 1;
            endIndex = startIndex;
        }
    }
    let returnedDataSample = [];

    for (let i = recordList[0]; i <= recordList[1]; i += 1) {
        let x = monthList[i],
            y = casesLists[i];
        returnedDataSample.push({
            x: x,
            y: y
        });
    }

    return raw(returnedDataSample);
}

function getDecreasingDataSample(dataSample) {
    let monthList = [],
        casesLists = [];

    for (let i = 0; i < dataSample.length; i += 1) {
        let currentRow = dataSample[i];
        monthList.push(currentRow["x"]);
        casesLists.push(currentRow["y"]);
    }
    let startIndex = 1,
        endIndex = 1; // will skip Jan and start from Feb
    let recordList = [];
    while (startIndex !== casesLists.length && endIndex <= (casesLists.length - 1)) {
        endIndex += 1;
        if (casesLists[endIndex] <= casesLists[endIndex - 1]) {
            continue;
        } else {
            if (recordList.length === 0) {
                recordList.push(startIndex);
                recordList.push(endIndex - 1);
            } else {
                let range = recordList[1] - recordList[0];
                if (range > (endIndex - 1 - startIndex)) {
                    // do nothing 
                } else {
                    recordList[0] = startIndex;
                    recordList[1] = endIndex - 1;
                }
            }
            startIndex += 1;
            endIndex = startIndex;
        }
    }

    let returnedDataSample = []
    for (let i = recordList[0]; i <= recordList[1]; i += 1) {
        let x = monthList[i],
            y = casesLists[i];
        returnedDataSample.push({
            x: x,
            y: y
        });
    }
    return raw(returnedDataSample);
}

function getDataSampleByYearAndState(confirmed = true, year = "2021", state = "California") {
    let data = raw(rawDataConfirm);
    if (!confirmed) {
        data = raw(rawDataDeath);
    }

    let year2020 = [],
        year2021 = [],
        year2022 = [];
    for (let i = 0; i < data.length; i += 1) {
        let currentData = data[i];
        let object2020 = {},
            object2021 = {},
            object2022 = {};

        for (const [key, value] of Object.entries(currentData)) {

            if (key.match("([0-9]?[0-9]\\/[0-9]?[0-9]\\/20)")) { // year ends in 20
                object2020[key] = value;
            } else if (key.match("([0-9]?[0-9]\/[0-9]?[0-9]\/21)")) { // year ends in 21
                object2021[key] = value;
            } else if (key.match("([0-9]?[0-9]\\/[0-9]?[0-9]\\/22)")) { // year ends in 22
                object2022[key] = value;
            } else if (key === "Province_State") { // set state name
                object2020[key] = value;
                object2021[key] = value;
                object2022[key] = value;
            }
        }
        year2020.push(object2020);
        year2021.push(object2021);
        year2022.push(object2022);
    }

    const yearData = [year2020, year2021, year2022];
    const monthData = convertToMonthData(raw(yearData));

    let dataSample = getStateMonthData(monthData, year, state);

    return dataSample;
}