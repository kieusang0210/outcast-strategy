document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     1. TABS NAVIGATION & INTERACTION
     ========================================================================== */
  
  // R&D Tabs
  const tabButtons = document.querySelectorAll('#research .tab-btn');
  const tabPanes = document.querySelectorAll('#research .tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Update buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update panes
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.getAttribute('id') === targetTab) {
          pane.classList.add('active');
        }
      });
    });
  });

  // Roadmap Timeline Weeks
  const timelineButtons = document.querySelectorAll('.timeline-widget .widget-btn');
  const timelinePanes = document.querySelectorAll('.timeline-widget .widget-pane');

  timelineButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetWeek = button.getAttribute('data-week');
      
      // Update buttons
      timelineButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update panes
      timelinePanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.getAttribute('id') === `pane-${targetWeek}`) {
          pane.classList.add('active');
        }
      });
    });
  });

  // Sidebar navigation active state on scroll
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-menu .nav-item');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      const href = item.querySelector('a').getAttribute('href').substring(1);
      if (href === current) {
        item.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     2. COPY TO CLIPBOARD
     ========================================================================== */
  const copyBtn = document.getElementById('copy-script-btn');
  const scriptText = document.getElementById('negotiation-script-text');

  if (copyBtn && scriptText) {
    copyBtn.addEventListener('click', () => {
      const originalText = copyBtn.textContent;
      
      navigator.clipboard.writeText(scriptText.textContent)
        .then(() => {
          copyBtn.textContent = 'Đã Copy!';
          copyBtn.style.backgroundColor = 'var(--success)';
          copyBtn.style.color = '#fff';
          
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = 'rgba(255, 69, 0, 0.1)';
            copyBtn.style.color = 'var(--accent)';
          }, 2000);
        })
        .catch(err => {
          console.error('Không thể copy kịch bản: ', err);
          alert('Không thể tự động copy. Vui lòng chọn văn bản và copy thủ công.');
        });
    });
  }


  /* ==========================================================================
     3. FINANCIAL CALCULATOR & DYNAMIC SVG CHART
     ========================================================================== */
  
  // Product Template Configurations
  const productTemplates = {
    tshirt: { fabric: 85000, sewing: 65000, packaging: 15000, mkt: 40000, price: 380000 },
    hoodie: { fabric: 180000, sewing: 110000, packaging: 18000, mkt: 60000, price: 680000 },
    pants: { fabric: 140000, sewing: 90000, packaging: 15000, mkt: 50000, price: 520000 },
    cap: { fabric: 40000, sewing: 35000, packaging: 10000, mkt: 25000, price: 180000 }
  };

  // DOM Elements - Inputs
  const prodTypeSelect = document.getElementById('select-prod-type');
  const fabricInput = document.getElementById('input-c-fabric');
  const sewingInput = document.getElementById('input-c-sewing');
  const packageInput = document.getElementById('input-c-package');
  const mktInput = document.getElementById('input-c-mkt');
  const priceInput = document.getElementById('input-price');
  const fixedCostInput = document.getElementById('input-fixed-cost');

  // DOM Elements - Labels for slider values
  const lblFabric = document.getElementById('lbl-c-fabric');
  const lblSewing = document.getElementById('lbl-c-sewing');
  const lblPackage = document.getElementById('lbl-c-package');
  const lblMkt = document.getElementById('lbl-c-mkt');

  // DOM Elements - Outputs
  const valCogs = document.getElementById('val-cogs');
  const valUnitProfit = document.getElementById('val-unit-profit');
  const valMarginPct = document.getElementById('val-margin-pct');
  const valBepQty = document.getElementById('val-bep-qty');
  const valBepAnalysis = document.getElementById('calc-bep-analysis');

  // Format currency helper (VND)
  function formatVND(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Update slider label texts
  function updateSliderLabels() {
    lblFabric.textContent = Math.round(fabricInput.value / 1000) + 'k VNĐ';
    lblSewing.textContent = Math.round(sewingInput.value / 1000) + 'k VNĐ';
    lblPackage.textContent = Math.round(packageInput.value / 1000) + 'k VNĐ';
    lblMkt.textContent = Math.round(mktInput.value / 1000) + 'k VNĐ';
  }

  // Load product templates
  prodTypeSelect.addEventListener('change', () => {
    const template = productTemplates[prodTypeSelect.value];
    if (template) {
      fabricInput.value = template.fabric;
      sewingInput.value = template.sewing;
      packageInput.value = template.packaging;
      mktInput.value = template.mkt;
      priceInput.value = template.price;
      
      updateSliderLabels();
      calculateEconomics();
    }
  });

  // Attach input listeners to all inputs
  [fabricInput, sewingInput, packageInput, mktInput, priceInput, fixedCostInput].forEach(input => {
    input.addEventListener('input', () => {
      updateSliderLabels();
      calculateEconomics();
    });
  });

  // Calculate Unit Economics & BEP
  function calculateEconomics() {
    const fabric = parseFloat(fabricInput.value) || 0;
    const sewing = parseFloat(sewingInput.value) || 0;
    const packaging = parseFloat(packageInput.value) || 0;
    const mkt = parseFloat(mktInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const fixedCost = parseFloat(fixedCostInput.value) || 0;

    // Financial formulas
    const cogs = fabric + sewing + packaging;
    const grossProfit = price - cogs;
    const grossMarginPct = price > 0 ? (grossProfit / price) * 100 : 0;
    
    // Contribution Margin (Unit profit after variable marketing cost)
    const contributionMargin = price - cogs - mkt;
    
    let bepQty = 0;
    let bepAnalysisText = '';
    let isHealthy = true;

    if (contributionMargin <= 0) {
      bepQty = Infinity;
      bepAnalysisText = '⚠️ CẢNH BÁO: Giá bán quá thấp hoặc chi phí biến đổi quá cao! Bạn đang bù lỗ trên mỗi áo bán ra. Không thể hòa vốn.';
      isHealthy = false;
    } else {
      bepQty = Math.ceil(fixedCost / contributionMargin);
      const dailyQty = (bepQty / 30).toFixed(1);
      bepAnalysisText = `Với mức chi phí cố định ${formatVND(fixedCost)}/tháng, bạn cần bán được ít nhất <strong>${bepQty} sản phẩm</strong> mỗi tháng (khoảng <strong>${dailyQty} cái/ngày</strong>) để bắt đầu có lợi nhuận.`;
    }

    // Update UI elements
    valCogs.textContent = formatVND(cogs);
    valUnitProfit.textContent = formatVND(contributionMargin);
    valMarginPct.textContent = grossMarginPct.toFixed(1) + '%';
    
    if (bepQty === Infinity) {
      valBepQty.textContent = 'Vô hạn';
      valBepQty.style.color = 'var(--danger)';
      valBepAnalysis.className = 'runway-card runway-danger';
    } else {
      valBepQty.textContent = bepQty + ' sản phẩm';
      valBepQty.style.color = 'var(--accent)';
      valBepAnalysis.className = 'runway-card runway-healthy';
    }
    
    valBepAnalysis.innerHTML = bepAnalysisText;

    // Draw Chart
    drawBepChart(price, cogs, mkt, fixedCost, bepQty);
    
    // Trigger cashflow calculation because it depends on product unit costs
    calculateCashflow(cogs, mkt, price, fixedCost);
  }

  // Draw dynamic SVG Chart
  function drawBepChart(price, cogs, mkt, fixedCost, bepQty) {
    const svg = document.getElementById('bep-chart');
    if (!svg) return;

    const pathFixed = document.getElementById('path-fixed-cost');
    const pathTotalCost = document.getElementById('path-total-cost');
    const pathRevenue = document.getElementById('path-revenue');
    const dotBep = document.getElementById('dot-bep');
    const txtBep = document.getElementById('chart-txt-bep');
    const lblMid = document.getElementById('chart-lbl-mid');
    const lblMax = document.getElementById('chart-lbl-max');

    // Chart dimensions (inside viewBox="0 0 500 220")
    const chartXStart = 50;
    const chartXEnd = 480;
    const chartYStart = 180; // y-axis bottom
    const chartYEnd = 20;    // y-axis top
    const chartWidth = chartXEnd - chartXStart;
    const chartHeight = chartYStart - chartYEnd;

    // Determine dynamic scales
    let maxQty = 200;
    if (bepQty !== Infinity && bepQty > 0) {
      maxQty = Math.max(100, Math.ceil(bepQty * 1.8));
    }
    
    // Round maxQty to clean number
    maxQty = Math.ceil(maxQty / 10) * 10;
    
    const variableCostPerUnit = cogs + mkt;
    const maxRevenue = maxQty * price;
    const maxCost = fixedCost + (maxQty * variableCostPerUnit);
    const maxMoney = Math.max(maxRevenue, maxCost, fixedCost * 1.5, 1000000);

    // Helpers to scale values to SVG pixel coordinates
    function getX(q) {
      return chartXStart + (q / maxQty) * chartWidth;
    }
    
    function getY(money) {
      return chartYStart - (money / maxMoney) * chartHeight;
    }

    // Set X-axis labels
    lblMid.textContent = Math.round(maxQty / 2);
    lblMax.textContent = maxQty + ' cái';

    // 1. Draw Fixed Cost Line (horizontal line)
    const yFixed = getY(fixedCost);
    pathFixed.setAttribute('d', `M ${chartXStart} ${yFixed} L ${chartXEnd} ${yFixed}`);

    // 2. Draw Total Cost Line (Fixed Cost + Q * Variable Cost)
    const yCostStart = getY(fixedCost);
    const yCostEnd = getY(fixedCost + maxQty * variableCostPerUnit);
    pathTotalCost.setAttribute('d', `M ${chartXStart} ${yCostStart} L ${chartXEnd} ${yCostEnd}`);

    // 3. Draw Revenue Line (Q * Price)
    const yRevStart = getY(0);
    const yRevEnd = getY(maxQty * price);
    pathRevenue.setAttribute('d', `M ${chartXStart} ${yRevStart} L ${chartXEnd} ${yRevEnd}`);

    // 4. Draw BEP Dot & text
    if (bepQty !== Infinity && bepQty > 0 && bepQty <= maxQty) {
      const xBep = getX(bepQty);
      const yBep = getY(bepQty * price);
      
      dotBep.setAttribute('cx', xBep);
      dotBep.setAttribute('cy', yBep);
      dotBep.setAttribute('r', '6');
      dotBep.style.display = 'block';

      txtBep.textContent = `Hòa vốn: ${bepQty} cái`;
      txtBep.setAttribute('x', xBep + 10);
      txtBep.setAttribute('y', yBep - 5);
      txtBep.style.display = 'block';
    } else {
      dotBep.style.display = 'none';
      txtBep.style.display = 'none';
    }
  }


  /* ==========================================================================
     4. CASHFLOW & RUNWAY SIMULATOR
     ========================================================================== */
  
  // DOM Elements - Cashflow Inputs
  const inputCapital = document.getElementById('input-capital');
  const inputBatch = document.getElementById('input-batch');
  const inputSalesQty = document.getElementById('input-sales-qty');

  // DOM Elements - Cashflow Labels
  const lblCapital = document.getElementById('lbl-capital');
  const lblBatch = document.getElementById('lbl-batch');
  const lblSalesQty = document.getElementById('lbl-sales-qty');

  // DOM Elements - Cashflow Outputs
  const valBatchCost = document.getElementById('val-batch-cost');
  const valMonthlyNet = document.getElementById('val-monthly-net');
  const valEndCash = document.getElementById('val-end-cash');
  const valRunway = document.getElementById('val-runway');
  const valRunwayDesc = document.getElementById('val-runway-desc');

  // Attach input event listeners
  [inputCapital, inputBatch, inputSalesQty].forEach(input => {
    input.addEventListener('input', () => {
      // Update UI slider labels
      lblCapital.textContent = (inputCapital.value / 1000000).toFixed(0) + 'M VNĐ';
      lblBatch.textContent = inputBatch.value + ' cái';
      lblSalesQty.textContent = inputSalesQty.value + ' cái';
      
      // Calculate based on current calculator state
      const fabric = parseFloat(fabricInput.value) || 0;
      const sewing = parseFloat(sewingInput.value) || 0;
      const packaging = parseFloat(packageInput.value) || 0;
      const mkt = parseFloat(mktInput.value) || 0;
      const price = parseFloat(priceInput.value) || 0;
      const fixedCost = parseFloat(fixedCostInput.value) || 0;
      
      calculateCashflow(fabric + sewing + packaging, mkt, price, fixedCost);
    });
  });

  // Calculate 6-month cashflow simulation
  function calculateCashflow(cogs, mkt, price, fixedCost) {
    const startCapital = parseFloat(inputCapital.value) || 0;
    const batchSize = parseInt(inputBatch.value) || 0;
    const salesTarget = parseInt(inputSalesQty.value) || 0;

    const batchCost = batchSize * cogs;
    valBatchCost.textContent = formatVND(batchCost);

    // Initial state
    let cash = startCapital;
    let inventory = 0;
    let isBankrupt = false;
    let bankruptMonth = 0;
    
    // Net profit check per product
    const unitMargin = price - cogs - mkt;

    // Month 0: Order the first batch
    cash -= batchCost;
    inventory += batchSize;

    if (cash < 0) {
      isBankrupt = true;
      bankruptMonth = 0;
    }

    // Array to record monthly history
    const monthlyLog = [];

    // Simulate Month 1 to Month 6
    for (let month = 1; month <= 6; month++) {
      if (isBankrupt) {
        monthlyLog.push({ month, startCash: 0, endCash: 0, inventory: 0, sold: 0 });
        continue;
      }

      const startCash = cash;

      // 1. Sales execution
      const actualSold = Math.min(salesTarget, inventory);
      const revenue = actualSold * price;
      const variableMktCost = actualSold * mkt;
      
      // Monthly financial updates
      const netMonthlyOperating = revenue - variableMktCost - fixedCost;
      cash += netMonthlyOperating;
      inventory -= actualSold;

      // 2. Replenishment Check: If inventory runs low (less than next month's sales target)
      let triggeredRestock = false;
      if (inventory < salesTarget) {
        cash -= batchCost;
        inventory += batchSize;
        triggeredRestock = true;
      }

      // Check bankruptcy
      if (cash < 0) {
        isBankrupt = true;
        bankruptMonth = month;
      }

      monthlyLog.push({
        month,
        startCash,
        endCash: cash,
        inventory,
        sold: actualSold,
        triggeredRestock,
        netMonthlyOperating
      });
    }

    // Update UI Outputs
    // Estimated regular monthly net cashflow (assuming stable selling, no batch ordering)
    const regularNet = (salesTarget * price) - (salesTarget * mkt) - fixedCost;
    valMonthlyNet.textContent = (regularNet >= 0 ? '+' : '') + formatVND(regularNet);

    if (isBankrupt) {
      valEndCash.textContent = 'HẾT VỐN';
      valEndCash.style.color = 'var(--danger)';
      
      valRunway.textContent = bankruptMonth === 0 ? 'Phá sản ngay T0' : `Sống sót ${bankruptMonth - 1} tháng`;
      valRunway.className = 'output-val runway-danger';
      valRunway.style.color = 'var(--danger)';
      
      valRunwayDesc.className = 'runway-card runway-danger';
      valRunwayDesc.innerHTML = `⚠️ <strong>Nguy cơ dòng tiền âm cực lớn!</strong> Vốn mồi ${formatVND(startCapital)} không đủ để sản xuất lô hàng đầu tiên (${formatVND(batchCost)}) và duy trì hoạt động cố định. Startup của bạn sẽ hết tiền vào <strong>Tháng ${bankruptMonth}</strong>.
      <br><br>💡 <strong>Lời khuyên:</strong> Hãy tăng vốn mồi, giảm quy mô lô hàng sản xuất (batch size) hoặc thương lượng trả chậm với xưởng may để tránh sập hầm dòng tiền.`;
    } else {
      valEndCash.textContent = formatVND(cash);
      valEndCash.style.color = '#fff';
      
      valRunway.textContent = 'An toàn (>6 tháng)';
      valRunway.className = 'output-val runway-healthy';
      valRunway.style.color = 'var(--success)';

      valRunwayDesc.className = 'runway-card runway-healthy';
      
      let restocksCount = monthlyLog.filter(m => m.triggeredRestock).length;
      
      valRunwayDesc.innerHTML = `✅ <strong>Dòng tiền khỏe mạnh!</strong> Vốn mồi của bạn đủ sức gánh chi phí sản xuất và bù đắp các tháng đầu. Đến cuối tháng 6, bạn còn dư <strong>${formatVND(cash)}</strong> trong quỹ, hàng tồn kho còn <strong>${inventory} cái</strong>.
      <br><br>Trong 6 tháng qua, bạn đã kích hoạt tái sản xuất <strong>${restocksCount} lần</strong> để đáp ứng nhu cầu thị trường.`;
    }
  }

  // Initial calculation trigger on page load
  updateSliderLabels();
  calculateEconomics();
});
