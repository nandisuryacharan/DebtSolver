// Generate debt table based on number of persons
function generateTable() {
  const n = parseInt(document.getElementById('numPersons').value);
  let html = '<table><tr><th></th>';
  for (let i = 0; i < n; i++) html += `<th>Person ${i}</th>`;
  html += '</tr>';

  for (let i = 0; i < n; i++) {
    html += `<tr><th>Person ${i}</th>`;
    for (let j = 0; j < n; j++) {
      if (i === j) {
        html += `<td>-</td>`;
      } else {
        html += `<td><input type="number" min="0" value="0" id="debt-${i}-${j}"></td>`;
      }
    }
    html += '</tr>';
  }
  html += '</table>';
  document.getElementById('tableContainer').innerHTML = html;
  document.getElementById('solveBtn').style.display = 'inline-block';
}

// Read debts from table into a matrix
function getDebtMatrix() {
  const n = parseInt(document.getElementById('numPersons').value);
  const graph = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        graph[i][j] = parseInt(document.getElementById(`debt-${i}-${j}`).value) || 0;
      }
    }
  }
  return graph;
}

// Utility functions
function getMaxIndex(arr) {
  return arr.indexOf(Math.max(...arr));
}
function getMinIndex(arr) {
  return arr.indexOf(Math.min(...arr));
}
function minOf2(x, y) {
  return x < y ? x : y;
}

// Recursive function to minimize cash flow
function minCashFlowRec(amount) {
  const mxCredit = getMaxIndex(amount);
  const mxDebit = getMinIndex(amount);

  if (amount[mxCredit] === 0 && amount[mxDebit] === 0) return [];

  const min = minOf2(-amount[mxDebit], amount[mxCredit]);
  amount[mxCredit] -= min;
  amount[mxDebit] += min;

  return [`Person ${mxDebit} pays ${min} to Person ${mxCredit}`, 
          ...minCashFlowRec(amount)];
}

function minCashFlow(graph) {
  const n = graph.length;
  const amount = Array(n).fill(0);
  for (let p = 0; p < n; p++) {
    for (let i = 0; i < n; i++) {
      amount[p] += (graph[i][p] - graph[p][i]);
    }
  }
  return minCashFlowRec(amount);
}

// Solve debt
function solveDebt() {
  const graph = getDebtMatrix();
  const result = minCashFlow(graph);
  document.getElementById('result').innerHTML = result.length 
    ? result.join('<br>') 
    : "No transactions needed.";
}
