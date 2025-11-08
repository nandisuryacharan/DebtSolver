import { BinaryHeap } from './heap.js';

onload = function () {
  let curr_data;
  let edgesInput = [];
  let totalPersons = 0;

  const container = document.getElementById('mynetwork');
  const container2 = document.getElementById('mynetwork2');
  const solve = document.getElementById('solve');
  const temptext = document.getElementById('temptext');
  const genNew = document.getElementById('generate-graph');

  const network = new vis.Network(container);
  const network2 = new vis.Network(container2);

  const options = {
    edges: {
      arrows: { to: true },
      labelHighlightBold: true,
      font: { size: 18 },
    },
    nodes: {
      font: '14px arial red',
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf183',
        size: 40,
        color: '#991133',
      },
    },
  };
  network.setOptions(options);
  network2.setOptions(options);

  // Create persons
  document.getElementById("createPersons").onclick = function () {
    totalPersons = parseInt(document.getElementById("numPersons").value);
    if (isNaN(totalPersons) || totalPersons <= 0) {
      alert("Please enter a valid number of persons.");
      return;
    }
    edgesInput = [];
    document.querySelector("#transactionsTable tbody").innerHTML = "";
    document.getElementById("transactionInput").style.display = "block";
  };

  // Add transaction
  document.getElementById("addTransaction").onclick = function () {
    const from = parseInt(document.getElementById("fromPerson").value);
    const to = parseInt(document.getElementById("toPerson").value);
    const amount = parseInt(document.getElementById("amount").value);

    if (isNaN(from) || isNaN(to) || isNaN(amount) || from === to || amount <= 0 || from > totalPersons || to > totalPersons) {
      alert("Invalid input.");
      return;
    }

    // Check if already exists and add up
    const existing = edgesInput.find(e => e.from === from && e.to === to);
    if (existing) existing.amount += amount;
    else edgesInput.push({ from, to, amount });

    renderTable();
  };

  function renderTable() {
    const tbody = document.querySelector("#transactionsTable tbody");
    tbody.innerHTML = "";
    for (let e of edgesInput) {
      const row = `<tr><td>${e.from}</td><td>${e.to}</td><td>${e.amount}</td></tr>`;
      tbody.innerHTML += row;
    }
  }

  // Generate graph
  document.getElementById("generateGraph").onclick = function () {
    if (edgesInput.length === 0) {
      alert("Add at least one transaction!");
      return;
    }
    const nodes = [];
    for (let i = 1; i <= totalPersons; i++) nodes.push({ id: i, label: "Person " + i });
    const edges = edgesInput.map(e => ({ from: e.from, to: e.to, label: String(e.amount) }));

    curr_data = { nodes: new vis.DataSet(nodes), edges: edges };
    network.setData(curr_data);
    temptext.style.display = "inline";
    container2.style.display = "none";
  };

  // Solve
  solve.onclick = function () {
    if (!curr_data) {
      alert("Generate graph first!");
      return;
    }
    temptext.style.display = "none";
    container2.style.display = "inline";

    const solvedData = solveData(curr_data);
    network2.setData(solvedData);
    document.getElementById("mynetwork2").style.display = "block";
  };

  function solveData(data) {
    const sz = data['nodes'].length;
    const vals = Array(sz).fill(0);

    for (let e of data['edges']) {
      vals[e.to - 1] += parseInt(e.label);
      vals[e.from - 1] -= parseInt(e.label);
    }

    const pos_heap = new BinaryHeap();
    const neg_heap = new BinaryHeap();

    for (let i = 0; i < sz; i++) {
      if (vals[i] > 0) pos_heap.insert([vals[i], i]);
      else if (vals[i] < 0) neg_heap.insert([-vals[i], i]);
    }

    const new_edges = [];
    while (!pos_heap.empty() && !neg_heap.empty()) {
      const mx = pos_heap.extractMax();
      const mn = neg_heap.extractMax();

      const amt = Math.min(mx[0], mn[0]);
      const to = mx[1];
      const from = mn[1];

      new_edges.push({ from: from + 1, to: to + 1, label: String(amt) });
      mx[0] -= amt;
      mn[0] -= amt;

      if (mx[0] > 0) pos_heap.insert(mx);
      if (mn[0] > 0) neg_heap.insert(mn);
    }

    return { nodes: data['nodes'], edges: new_edges };
  }

  // Reset everything
  genNew.onclick = function () {
    document.getElementById("transactionInput").style.display = "none";
    document.getElementById("numPersons").value = "";
    document.querySelector("#transactionsTable tbody").innerHTML = "";
    edgesInput = [];
    totalPersons = 0;
    network.setData({ nodes: [], edges: [] });
    network2.setData({ nodes: [], edges: [] });
    document.getElementById("mynetwork2").style.display = "none";
    temptext.style.display = "inline";
  };
};
