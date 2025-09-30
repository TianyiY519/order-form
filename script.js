// ===== Config =====
const FORMSUBMIT = "https://formsubmit.co/tianyiyang77@gmail.com";

// ===== Product data =====
const products = {
  dog: [
    {name: "regular, 3 roll bag (8s thickness, green)", price: 0.58},
    {name: "regular, 10 roll bag (8s thickness, green)", price: 1.84},
    {name: "regular, 15 roll bag (8s thickness, green)", price: 2.76},
    {name: "extra strong, 3 roll bag (15s thickness, paw pattern)", price: 0.95},
    {name: "extra strong, 10 roll bag (15s thickness, paw pattern)", price: 2.99},
  ],
  dispenser: [
    {name: "Dispenser (pink)", price: 1.89},
    {name: "Dispenser (green)", price: 0.68},
    {name: "Dispenser (blue)", price: 0.68},
    {name: "Dispenser (yellow)", price: 0.68},
  ],
  wipe: [
    {name: "Pet Wet Wipe(80pc)", price: 3.29},
  ]
};

// ===== Table functions =====
function updateProducts(selectEl) {
  const row = selectEl.closest("tr");
  const productSelect = row.querySelector(".product");
  productSelect.innerHTML = "<option value=''>-- Select Product --</option>";
  const category = selectEl.value;
  if (!category) return;
  products[category].forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.price;
    opt.textContent = `${p.name} - $${p.price}`;
    productSelect.appendChild(opt);
  });
  updatePrice(productSelect);
}

function updatePrice(selectEl) {
  const row = selectEl.closest("tr");
  const unitPrice = row.querySelector(".unit_price");
  const qty = row.querySelector(".qty");
  const lineTotal = row.querySelector(".line_total");
  if (selectEl.value) {
    unitPrice.value = "$" + selectEl.value;
    lineTotal.value = "$" + (parseFloat(selectEl.value) * parseInt(qty.value || 0)).toFixed(2);
  } else {
    unitPrice.value = "";
    lineTotal.value = "";
  }
  updateSubtotal();
}

function updateTotal(inputEl) {
  const row = inputEl.closest("tr");
  const unitPrice = parseFloat(row.querySelector(".product").value || 0);
  const qty = parseInt(row.querySelector(".qty").value || 0);
  row.querySelector(".line_total").value = "$" + (unitPrice * qty).toFixed(2);
  updateSubtotal();
}

function addItemRow() {
  const tbody = document.querySelector("#itemsTable tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td data-label="Category">
      <select class="category" onchange="updateProducts(this)">
        <option value="">-- Select Category --</option>
        <option value="dog">Dog Poop Bag</option>
        <option value="dispenser">Poop Bag Dispenser</option>
        <option value="wipe">Pet Wet Wipe</option>
      </select>
    </td>
    <td data-label="Product">
      <select class="product" onchange="updatePrice(this)">
        <option value="">-- Select Product --</option>
      </select>
    </td>
    <td data-label="Unit Price"><input type="text" class="unit_price" readonly></td>
    <td data-label="Qty"><input type="number" class="qty" min="1" value="1" oninput="updateTotal(this)"></td>
    <td data-label="Line Total"><input type="text" class="line_total" readonly></td>
    <td data-label="Delete"><button type="button" onclick="deleteRow(this)">Delete</button></td>
  `;
  tbody.appendChild(tr);
}

function deleteRow(btn) {
  btn.closest("tr").remove();
  updateSubtotal();
}

function updateSubtotal() {
  let subtotal = 0;
  document.querySelectorAll(".line_total").forEach(el => {
    if (el.value.startsWith("$")) {
      subtotal += parseFloat(el.value.replace("$", "")) || 0;
    }
  });
  document.getElementById("subtotal").value = "$" + subtotal.toFixed(2);
  document.getElementById("grand_total").value = "$" + subtotal.toFixed(2);
}

// ===== Submit handler =====
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('status');
  status.textContent = "Processing...";

  try {
    const form = e.currentTarget;

    // 拼接 order details
    let details = [];
    document.querySelectorAll("#itemsTable tbody tr").forEach((row, i) => {
      const cat = row.querySelector(".category")?.selectedOptions[0]?.text || "";
      const prod = row.querySelector(".product")?.selectedOptions[0]?.text || "";
      const unit = row.querySelector(".unit_price")?.value || "";
      const qty = row.querySelector(".qty")?.value || "";
      const total = row.querySelector(".line_total")?.value || "";
      details.push(`${i+1}. ${cat} | ${prod} | ${unit} | ${qty} | ${total}`);
    });

    details.push("");
    details.push("Subtotal: " + (document.getElementById("subtotal").value || ""));
    details.push("TOTAL: " + (document.getElementById("grand_total").value || ""));

    // 加入隐藏字段
    let hiddenInput = document.getElementById("order_details");
    if (!hiddenInput) {
      hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "Order_Details";
      hiddenInput.id = "order_details";
      form.appendChild(hiddenInput);
    }
    hiddenInput.value = details.join("\n");

    // FormData 提交
    const fd = new FormData(form);
    fd.append("_subject", "New Order - PengYu Global");
    fd.append("_template", "table");
    fd.append("_captcha", "false");

    const resp = await fetch(FORMSUBMIT, { method:'POST', body: fd });
    if (!resp.ok) throw new Error("Email service responded with " + resp.status);

    status.textContent = "Submitted successfully! Please check your email.";
    form.reset();
  } catch (err) {
    console.error(err);
    status.textContent = "Failed: " + err.message;
  }
});
