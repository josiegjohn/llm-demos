const csvData = `
jurisdiction,harris,trump,oliver,stein,kennedy,others,total
Allegany,9231,22141,130,136,363,136,32137
Anne Arundel,171945,128892,2141,2429,3375,2790,311572
Baltimore City,195109,27984,892,3222,1875,1672,230754
Baltimore County,249958,149560,2240,4195,3858,3104,412915
Calvert,23438,29361,297,232,554,309,54191
Caroline,4860,11053,84,99,180,54,16330
Carroll,36867,62273,845,629,1182,855,102651
Cecil,17628,33871,291,286,536,219,52831
Charles,63454,26145,334,828,889,447,92097
Dorchester,6954,9390,57,138,191,42,16772
Frederick,82409,68753,970,1378,1494,1110,156114
Garrett,3456,11983,75,48,223,53,15838
Harford,62453,83050,1023,935,1559,1070,150090
Howard,124764,49425,1246,3341,1712,1803,182291
Kent,5251,5561,60,82,114,60,11128
Montgomery,386581,112637,2416,8009,4276,5302,519221
Prince George's,347038,45008,1038,5369,3428,2128,404009
Queen Anne's,11273,20200,174,153,336,211,32347
Saint Mary's,23531,33582,409,352,669,411,58954
Somerset,4054,5805,32,85,114,47,10137
Talbot,11119,11125,109,120,194,163,22830
Washington,27260,44054,363,513,811,331,73332
Wicomico,21513,24065,205,371,544,214,46912
Worcester,12431,19632,139,184,342,153,32881
`;

const candidates = ["harris", "trump", "oliver", "stein", "kennedy", "others"];

const parseCSV = (data) => {
  const lines = data.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((header, i) => {
      row[header] = isNaN(values[i]) ? values[i] : Number(values[i]);
    });
    return row;
  });
};

const data = parseCSV(csvData);
const statewideTotals = {};
candidates.forEach(c => statewideTotals[c] = 0);
let totalVotes = 0;

data.forEach(row => {
  candidates.forEach(c => statewideTotals[c] += row[c]);
  totalVotes += row.total;
});

function formatPercentage(value, total) {
  return `${((value / total) * 100).toFixed(2)}%`;
}

function renderStatewide() {
  const div = document.getElementById("statewide");
  let html = "<table><tr><th>Candidate</th><th>Votes</th><th>Percentage</th></tr>";
  candidates.forEach(c => {
    const name = c.charAt(0).toUpperCase() + c.slice(1);
    html += `<tr><td>${name}</td><td>${statewideTotals[c].toLocaleString()}</td><td>${formatPercentage(statewideTotals[c], totalVotes)}</td></tr>`;
  });
  html += "</table>";
  div.innerHTML = html;

  drawChart();
}

function renderCountyOptions() {
  const select = document.getElementById("countySelect");
  data.forEach(row => {
    const option = document.createElement("option");
    option.value = row.jurisdiction;
    option.textContent = row.jurisdiction;
    select.appendChild(option);
  });
  select.addEventListener("change", (e) => {
    renderCountyData(e.target.value);
  });
  renderCountyData(select.value); // default
}

function renderCountyData(county) {
  const row = data.find(r => r.jurisdiction === county);
  if (!row) return;

  let html = `<h3>${county}</h3><table><tr><th>Candidate</th><th>Votes</th><th>Percentage</th></tr>`;
  candidates.forEach(c => {
    const name = c.charAt(0).toUpperCase() + c.slice(1);
    html += `<tr><td>${name}</td><td>${row[c].toLocaleString()}</td><td>${formatPercentage(row[c], row.total)}</td></tr>`;
  });
  html += "</table>";
  document.getElementById("countyData").innerHTML = html;
}

function drawChart() {
  const ctx = document.getElementById("resultsChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: candidates.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
      datasets: [{
        label: "Votes",
        data: candidates.map(c => statewideTotals[c]),
        backgroundColor: [
          "#4285F4", "#EA4335", "#FBBC05", "#34A853", "#AA46BB", "#999999"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Statewide Votes by Candidate"
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

renderStatewide();
renderCountyOptions();