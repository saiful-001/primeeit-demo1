(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  
  var toNum = function (v) {
    if (typeof v === "number") return isNaN(v) ? 0 : v;
    var s = String(v || "").replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^\d.]/g, "");
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };
  var bn = function (n) { return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); };
  var money = function (n) { return C.currency + bn(toNum(n).toLocaleString("en-US")); };
  // [[text]] -> emphasised span
  var mark = function (s, cls) { return esc(s).replace(/\[\[(.+?)\]\]/g, '<em class="' + cls + '">$1</em>'); };

  /* ---------- বাংলাদেশ এর ৬৪ জেলার তালিকা (বাংলা ও ইংরেজি নাম) ---------- */
  var DISTRICTS = [
    { bn: "ঢাকা", en: "Dhaka" },
    { bn: "চট্টগ্রাম", en: "Chattogram Chittagong" },
    { bn: "রাজশাহী", en: "Rajshahi" },
    { bn: "খুলনা", en: "Khulna" },
    { bn: "বরিশাল", en: "Barishal Barisal" },
    { bn: "সিলেট", en: "Sylhet" },
    { bn: "রংপুর", en: "Rangpur" },
    { bn: "ময়মনসিংহ", en: "Mymensingh" },
    { bn: "গাজীপুর", en: "Gazipur" },
    { bn: "নারায়ণগঞ্জ", en: "Narayanganj" },
    { bn: "কুমিল্লা", en: "Cumilla Comilla" },
    { bn: "বগুড়া", en: "Bogura Bogra" },
    { bn: "কক্সবাজার", en: "Cox's Bazar Coxsbazar" },
    { bn: "যশোর", en: "Jashore Jessore" },
    { bn: "দিনাজপুর", en: "Dinajpur" },
    { bn: "পাবনা", en: "Pabna" },
    { bn: "টাঙ্গাইল", en: "Tangail" },
    { bn: "ফরিদপুর", en: "Faridpur" },
    { bn: "নরসিংদী", en: "Narsingdi" },
    { bn: "কিশোরগঞ্জ", en: "Kishoreganj" },
    { bn: "ব্রাহ্মণবাড়িয়া", en: "Brahmanbaria" },
    { bn: "নোয়াখালী", en: "Noakhali" },
    { bn: "ফেনী", en: "Feni" },
    { bn: "চাঁদপুর", en: "Chandpur" },
    { bn: "লক্ষ্মীপুর", en: "Lakshmipur" },
    { bn: "হবিগঞ্জ", en: "Habiganj" },
    { bn: "মৌলভীবাজার", en: "Moulvibazar" },
    { bn: "সুনামগঞ্জ", en: "Sunamganj" },
    { bn: "কুষ্টিয়া", en: "Kushtia" },
    { bn: "ঝিনাইদহ", en: "Jhenaidah" },
    { bn: "সাতক্ষীরা", en: "Satkhira" },
    { bn: "বাগেরহাট", en: "Bagerhat" },
    { bn: "চুয়াডাঙ্গা", en: "Chuadanga" },
    { bn: "মেহেরপুর", en: "Meherpur" },
    { bn: "মাগুরা", en: "Magura" },
    { bn: "নড়াইল", en: "Narail" },
    { bn: "সিরাজগঞ্জ", en: "Sirajganj" },
    { bn: "নওগাঁ", en: "Naogaon" },
    { bn: "নাটোর", en: "Natore" },
    { bn: "চাঁপাইনবাবগঞ্জ", en: "Chapai Nawabganj" },
    { bn: "জয়পুরহাট", en: "Joypurhat" },
    { bn: "পটুয়াখালী", en: "Patuakhali" },
    { bn: "ভোলা", en: "Bhola" },
    { bn: "পিরোজপুর", en: "Pirojpur" },
    { bn: "বরগুনা", en: "Barguna" },
    { bn: "ঝালকাঠি", en: "Jhalakathi" },
    { bn: "জামালপুর", en: "Jamalpur" },
    { bn: "নেত্রকোণা", en: "Netrokona" },
    { bn: "শেরপুর", en: "Sherpur" },
    { bn: "গাইবান্ধা", en: "Gaibandha" },
    { bn: "কুড়িগ্রাম", en: "Kurigram" },
    { bn: "লালমনিরহাট", en: "Lalmonirhat" },
    { bn: "নীলফামারী", en: "Nilphamari" },
    { bn: "পঞ্চগড়", en: "Panchagarh" },
    { bn: "ঠাকুরগাঁও", en: "Thakurgaon" },
    { bn: "মানিকগঞ্জ", en: "Manikganj" },
    { bn: "মুন্সীগঞ্জ", en: "Munshiganj" },
    { bn: "গোপালগঞ্জ", en: "Gopalganj" },
    { bn: "মাদারীপুর", en: "Madaripur" },
    { bn: "শরীয়তপুর", en: "Shariatpur" },
    { bn: "রাজবাড়ী", en: "Rajbari" },
    { bn: "রাঙ্গামাটি", en: "Rangamati" },
    { bn: "বান্দরবান", en: "Bandarban" },
    { bn: "খাগড়াছড়ি", en: "Khagrachhari" }
  ];

  /* ---------- placeholder images ---------- */
  function ph(label, w, h) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><rect width="100%" height="100%" fill="#d9d9d9"/><text x="50%" y="50%" fill="#777" font-family="sans-serif" font-size="' + Math.round(w / 14) + '" text-anchor="middle" dominant-baseline="middle">' + label + '</text></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  function src(name) { return /^(https?:)?\/\//.test(name) || name.indexOf("/") > -1 ? name : C.images.base + name + C.images.ext; }
  function img(name, label, w, h, alt) {
    var el = new Image();
    el.alt = alt || label; el.loading = "lazy";
    el.onerror = function () { el.onerror = null; el.src = ph(label, w, h); };
    el.src = src(name);
    return el;
  }

  /* ---------- static copy ---------- */
  var T = C.copy;
  $("#topHeading").innerHTML = mark(T.topHeading, "g");
  $("#noticeText").textContent = T.notice;
  $("#benefitsTitle").textContent = T.benefitsTitle;
  $("#benefitsList").innerHTML = T.benefits.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("");
  $("#strip1").innerHTML = mark(T.strip1, "r");
  $("#strip2").innerHTML = mark(T.strip2, "r");
  $("#reviewsTitle").textContent = T.reviewsTitle;
  $("#docsTitle").textContent = T.docsTitle;
  $("#checkoutTitle").textContent = T.checkoutTitle;
  $("#footMsg").textContent = T.footMsg;
  $("#footCredit").textContent = T.footCredit;
  $("#lnkPrivacy").href = T.privacyUrl; $("#lnkTerms").href = T.termsUrl;
  $("#offerLine").textContent = T.offerLine;
  $("#offerNote").textContent = T.offerNote;
  var oldEl = $("#offerOld");
  if (T.offerOld) oldEl.textContent = money(T.offerOld); else oldEl.remove();
  var firstPrice = C.products[0] ? C.products[0].price : 0;
  $("#offerNew").textContent = money(T.offerNew || firstPrice);

  /* ---------- video (Fast Load + Instant Autoplay + Sound) ---------- */
  (function () {
    var box = $("#videoBox"), u = C.videoUrl;
    if (!box || !u) return;

    var isMp4 = /\.(mp4|webm)(\?|$)/i.test(u);
    var soundBtn = document.createElement("button");
    soundBtn.type = "button";
    soundBtn.className = "video-sound-btn";
    soundBtn.innerHTML = '<span class="vs-icon">🔇</span> সাউন্ড চালু করুন';

    if (isMp4) {
      box.innerHTML = '<video controls autoplay muted playsinline loop preload="auto" src="' + esc(u) + '"></video>';
      box.appendChild(soundBtn);
      var vid = $("video", box);
      function unmuteMp4() {
        if (vid) {
          vid.muted = false;
          vid.volume = 1.0;
          soundBtn.classList.add("unmuted");
          soundBtn.innerHTML = '<span class="vs-icon">🔊</span> সাউন্ড চালু আছে';
        }
      }
      soundBtn.onclick = function (e) { e.stopPropagation(); unmuteMp4(); };
      window.addEventListener("click", function () { unmuteMp4(); }, { once: true });
      window.addEventListener("touchstart", function () { unmuteMp4(); }, { once: true });
    } else {
      var yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w\-]+)/);
      var videoId = yt ? yt[1] : "";
      var embedUrl = videoId ? "https://www.youtube-nocookie.com/embed/" + videoId : u;

      if (videoId) {
        box.style.background = "#000 url('https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg') center/cover no-repeat";
      }

      var sep = embedUrl.indexOf("?") > -1 ? "&" : "?";
      if (!/autoplay=/i.test(embedUrl)) {
        embedUrl += sep + "autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1&controls=1";
      }

      box.innerHTML = '<iframe id="heroYtFrame" src="' + esc(embedUrl) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="eager" title="Honey Nuts Video"></iframe>';
      box.appendChild(soundBtn);

      var iframe = $("#heroYtFrame", box);
      var unmuted = false;
      function unmuteYt() {
        if (unmuted || !iframe || !iframe.contentWindow) return;
        unmuted = true;
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "unMute", args: "" }), "*");
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [100] }), "*");
        soundBtn.classList.add("unmuted");
        soundBtn.innerHTML = '<span class="vs-icon">🔊</span> সাউন্ড চালু আছে';
        setTimeout(function () {
          soundBtn.style.opacity = "0";
          soundBtn.style.pointerEvents = "none";
        }, 2500);
      }

      soundBtn.onclick = function (e) { e.stopPropagation(); unmuteYt(); };
      window.addEventListener("click", function () { unmuteYt(); }, { once: true });
      window.addEventListener("touchstart", function () { unmuteYt(); }, { once: true });
      window.addEventListener("scroll", function () { unmuteYt(); }, { once: true });
    }
  })();

  /* ---------- scroll to checkout ---------- */
  document.querySelectorAll("[data-scroll-order]").forEach(function (b) {
    b.addEventListener("click", function () {
      $("#checkout").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block: "start" });
      setTimeout(function () { var n = $("#name"); if (n) n.focus({ preventScroll: true }); }, 600);
    });
  });

  /* ---------- carousels ---------- */
  var RATIO = { gallery: "4/3", reviews: "3/4", documents: "3/4" };
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var key = root.getAttribute("data-carousel"), names = C.images[key] || [];
    var label = C.placeholderLabels[key] || "ছবি";
    var dims = RATIO[key] === "4/3" ? [600, 450] : [450, 600];
    root.style.setProperty("--ratio", RATIO[key]);
    root.innerHTML = '<button class="c-nav c-prev" type="button" aria-label="আগের">‹</button><div class="c-view"><div class="c-track"></div></div><button class="c-nav c-next" type="button" aria-label="পরের">›</button><div class="c-dots"></div>';
    var track = $(".c-track", root), dots = $(".c-dots", root), idx = 0, per = 3, timer;
    names.forEach(function (n, i) {
      var s = document.createElement("div"); s.className = "c-slide";
      var f = document.createElement("div"); f.className = "frame";
      f.appendChild(img(n, label + " " + bn(i + 1), dims[0], dims[1]));
      s.appendChild(f); track.appendChild(s);
    });
    function perView() { var w = window.innerWidth; return Math.min(w < 400 ? 2 : 3, names.length || 1); }
    function maxIdx() { return Math.max(0, names.length - per); }
    function render() {
      idx = Math.min(Math.max(idx, 0), maxIdx());
      track.style.transform = "translateX(" + (-idx * (100 / per)) + "%)";
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i === idx); d.setAttribute("aria-current", i === idx ? "true" : "false"); });
    }
    function build() {
      per = perView(); root.style.setProperty("--per", per);
      dots.innerHTML = "";
      for (var i = 0; i <= maxIdx(); i++) { (function (i) { var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "স্লাইড " + (i + 1)); b.onclick = function () { idx = i; render(); }; dots.appendChild(b); })(i); }
      var many = maxIdx() > 0;
      root.querySelectorAll(".c-nav").forEach(function (n) { n.style.display = many ? "" : "none"; });
      render();
    }
    function go(d) { idx = idx + d; if (idx > maxIdx()) idx = 0; if (idx < 0) idx = maxIdx(); render(); }
    $(".c-prev", root).onclick = function () { go(-1); };
    $(".c-next", root).onclick = function () { go(1); };
    var sx = null;
    root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); sx = null; });
    root.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); });
    window.addEventListener("resize", build);
    build();
  });

  /* ---------- checkout (Multiple Products Support + Interactive Cart) ---------- */
  var state = {
    items: {}, // key: productId, value: quantity
    sid: C.defaultShipping || (C.shipping[0] && C.shipping[0].id) || "dhaka",
    busy: false
  };

  // ডিফল্ট প্রোডাক্ট সিলেক্ট রাখা
  var defProd = C.defaultProduct || (C.products[0] && C.products[0].id);
  if (defProd) {
    state.items[defProd] = 1;
  }

  var pkgBox = $("#packages"), shipBox = $("#shipping"), sumListEl = $("#sumItemsList");
  var ship = function () { return C.shipping.filter(function (s) { return s.id === state.sid; })[0]; };

  // পণ্যসমূহ রেন্ডার করা (বামপাশের প্যাকেজ কার্ড)
  C.products.forEach(function (p) {
    var card = document.createElement("div");
    card.className = "pkg";
    card.dataset.id = p.id;
    card.innerHTML =
      '<input type="checkbox" class="pkg-check" data-id="' + esc(p.id) + '" aria-label="' + esc(p.name) + '">' +
      '<span class="th"></span>' +
      '<div class="pkg-info">' +
        '<span class="nm">' + esc(p.name) + '</span>' +
        '<span class="pr">' + (p.oldPrice ? "<del>" + money(p.oldPrice) + "</del>" : "") + money(p.price) + '</span>' +
      '</div>' +
      '<div class="pkg-qty" data-id="' + esc(p.id) + '">' +
        '<button type="button" class="pq-btn minus" data-id="' + esc(p.id) + '" aria-label="কমান">−</button>' +
        '<span class="pkg-qty-num" data-id="' + esc(p.id) + '">১</span>' +
        '<button type="button" class="pq-btn plus" data-id="' + esc(p.id) + '" aria-label="বাড়ান">+</button>' +
      '</div>' +
      (p.badge ? '<span class="bd">' + esc(p.badge) + '</span>' : '');

    $(".th", card).replaceWith(img(C.images.products[p.thumb] || p.thumb, "ছবি", 112, 112, p.name));
    pkgBox.appendChild(card);
  });

  // শিপিং মেথড রেন্ডার করা
  C.shipping.forEach(function (s) {
    var l = document.createElement("label");
    l.innerHTML = '<input type="radio" name="shipping" value="' + esc(s.id) + '"> ' + esc(s.label) + " – " + money(s.charge);
    shipBox.appendChild(l);
  });

  // বামপাশের প্রোডাক্ট কার্ডে ক্লিক বা পরিমাণ পরিবর্তনের হ্যান্ডলার
  pkgBox.addEventListener("click", function (e) {
    var minusBtn = e.target.closest(".minus");
    var plusBtn = e.target.closest(".plus");
    var chk = e.target.closest(".pkg-check");
    var card = e.target.closest(".pkg");
    if (!card) return;
    var pid = card.dataset.id;

    if (minusBtn) {
      e.preventDefault();
      e.stopPropagation();
      var currentQty = state.items[pid] || 0;
      if (currentQty > 1) {
        state.items[pid] = currentQty - 1;
      } else {
        delete state.items[pid];
      }
      calc();
      return;
    }

    if (plusBtn) {
      e.preventDefault();
      e.stopPropagation();
      var curQ = state.items[pid] || 0;
      if (curQ < C.maxQty) {
        state.items[pid] = curQ + 1;
      }
      calc();
      return;
    }

    if (chk) {
      if (chk.checked) {
        state.items[pid] = state.items[pid] || 1;
      } else {
        delete state.items[pid];
      }
      calc();
      return;
    }

    if (state.items[pid]) {
      delete state.items[pid];
    } else {
      state.items[pid] = 1;
    }
    calc();
  });

  // ডানপাশের "আপনার অর্ডার" কার্ট থেকে পরিমাণ (+ / -) পরিবর্তনের হ্যান্ডলার
  if (sumListEl) {
    sumListEl.addEventListener("click", function (e) {
      var minusBtn = e.target.closest(".sci-btn.minus");
      var plusBtn = e.target.closest(".sci-btn.plus");
      var card = e.target.closest(".sum-cart-item");
      if (!card) return;
      var pid = card.dataset.id;
      if (!pid) return;

      if (minusBtn) {
        e.preventDefault();
        e.stopPropagation();
        var cur = state.items[pid] || 0;
        if (cur > 1) {
          state.items[pid] = cur - 1;
        } else {
          delete state.items[pid];
        }
        calc();
        return;
      }

      if (plusBtn) {
        e.preventDefault();
        e.stopPropagation();
        var curQ = state.items[pid] || 0;
        if (curQ < C.maxQty) {
          state.items[pid] = curQ + 1;
        }
        calc();
        return;
      }
    });
  }

  shipBox.addEventListener("change", function (e) {
    if (e.target.name === "shipping") {
      state.sid = e.target.value;
      calc();
    }
  });

  // অর্ডার বিল ও সারাংশ হিসাব নিকাশ (ডিসকাউন্ট বাদ দিয়ে নিখুঁত হিসাব)
  function calc() {
    var s = ship();
    var selectedList = [];
    var subtotal = 0;

    // পণ্য তালিকা আপডেট (বামপাশের প্যাকেজ কার্ড)
    pkgBox.querySelectorAll(".pkg").forEach(function (card) {
      var pid = card.dataset.id;
      var qty = state.items[pid] || 0;
      var isSelected = qty > 0;

      card.classList.toggle("sel", isSelected);
      var chk = $(".pkg-check", card);
      if (chk) chk.checked = isSelected;

      var qNum = $(".pkg-qty-num", card);
      if (qNum) qNum.textContent = bn(qty > 0 ? qty : 1);

      if (isSelected) {
        var p = C.products.filter(function (x) { return x.id === pid; })[0];
        if (p) {
          var itemTotal = p.price * qty;
          subtotal += itemTotal;
          selectedList.push({ product: p, qty: qty, total: itemTotal });
        }
      }
    });

    // শিপিং রেডিও চেক আপডেট
    shipBox.querySelectorAll("input").forEach(function (i) {
      i.checked = i.value === state.sid;
    });

    // ডানপাশের "আপনার অর্ডার" কার্ট রেন্ডার (আসল দাম, ডিসকাউন্ট মূল্য ও +/- বাটন)
    if (sumListEl) {
      if (selectedList.length === 0) {
        sumListEl.innerHTML = '<div class="sum-row empty-notice"><span>⚠️ কোনো পণ্য সিলেক্ট করা হয়নি (কমপক্ষে ১টি সিলেক্ট করুন)</span></div>';
      } else {
        sumListEl.innerHTML = selectedList.map(function (it) {
          var p = it.product;
          var hasOld = p.oldPrice && p.oldPrice > p.price;
          var saveAmount = hasOld ? (p.oldPrice - p.price) : 0;

          var pricesHtml = '<div class="sci-prices">';
          if (hasOld) {
            pricesHtml += '<del class="sci-real-price">' + money(p.oldPrice) + '</del>';
          }
          pricesHtml += '<strong class="sci-sell-price">' + money(p.price) + '</strong>';
          if (hasOld) {
            pricesHtml += '<span class="sci-save">' + money(saveAmount) + ' ছাড়</span>';
          }
          pricesHtml += '</div>';

          return '<div class="sum-cart-item" data-id="' + esc(p.id) + '">' +
            '<div class="sci-details">' +
              '<span class="sci-name">' + esc(p.name) + '</span>' +
              pricesHtml +
            '</div>' +
            '<div class="sci-action">' +
              '<div class="sci-qty">' +
                '<button type="button" class="sci-btn minus" data-id="' + esc(p.id) + '" aria-label="কমান">−</button>' +
                '<span class="sci-num">' + bn(it.qty) + '</span>' +
                '<button type="button" class="sci-btn plus" data-id="' + esc(p.id) + '" aria-label="বাড়ান">+</button>' +
              '</div>' +
              '<div class="sci-total-wrap">' +
                '<span class="sci-total-label">মোট দাম:</span>' +
                '<span class="sci-item-total">' + money(it.total) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join("");
      }
    }

    // শিপিং চার্জ
    var shipCharge = s ? s.charge : 0;
    if (C.freeShippingMinTotal > 0 && subtotal >= C.freeShippingMinTotal) {
      shipCharge = 0;
    }

    // অফার ডিসকাউন্ট বাদ দিয়ে সরাসরি সাব-টোটাল + শিপিং = সর্বমোট
    var grandTotal = subtotal + (selectedList.length > 0 ? shipCharge : 0);

    $("#sumSub").textContent = money(subtotal);
    $("#sumShip").textContent = shipCharge === 0 && selectedList.length > 0 && C.freeShippingMinTotal > 0 ? "ফ্রি" : money(shipCharge);
    $("#sumTotal").textContent = money(grandTotal);

    return {
      subtotal: subtotal,
      discount: 0,
      shipping: shipCharge,
      total: grandTotal,
      items: selectedList
    };
  }

  calc();

  /* ---------- বাংলাদেশ এর ৬৪ জেলার সার্চ ও ড্রপডাউন হ্যান্ডলার ---------- */
  var distWrap = $("#distPickerWrap"),
      distTrigger = $("#distTriggerBox"),
      distInput = $("#district"),
      distOpenBtn = $("#distOpenBtn"),
      distBox = $("#distDropdown"),
      distSearchInput = $("#distSearchInput"),
      distClearBtn = $("#distClearBtn"),
      distDoSearchBtn = $("#distDoSearchBtn"),
      distCountText = $("#distCountText"),
      distOptionsList = $("#distOptionsList"),
      distCustomOption = $("#distCustomOption"),
      distCustomVal = $("#distCustomVal"),
      distUseCustomBtn = $("#distUseCustomBtn");

  var activeDistIdx = -1;
  var currentFilteredDistricts = DISTRICTS.slice();
  var isTouchScrolling = false;

  function selectDistrict(val) {
    if (!val) return;
    if (distInput) distInput.value = val;
    closeDistDropdown();
    setErr("district");
  }

  function renderDistrictOptions(list, selectedVal, isInitialOpen) {
    if (!distOptionsList) return;
    currentFilteredDistricts = list;
    activeDistIdx = -1;

    if (list.length === 0) {
      distOptionsList.innerHTML = '<div class="dist-empty-notice">⚠️ "' + esc(distSearchInput.value) + '" নামে কোনো জেলা পাওয়া যায়নি।<br>নিচের বাটনে ক্লিক করে সরাসরি এই এলাকা হিসেবে ব্যবহার করুন।</div>';
      return;
    }

    distOptionsList.innerHTML = list.map(function (d, i) {
      var isSel = selectedVal && selectedVal.trim().toLowerCase() === d.bn.toLowerCase();
      return '<div class="dist-option-item' + (isSel ? ' selected' : '') + '" data-val="' + esc(d.bn) + '" role="option" aria-selected="' + (isSel ? 'true' : 'false') + '">' +
        '<div class="dist-opt-left">' +
          '<span class="dist-opt-check">' + (isSel ? '✓' : '') + '</span>' +
          '<span class="dist-opt-bn">' + esc(d.bn) + '</span>' +
          '<span class="dist-opt-en">' + esc(d.en) + '</span>' +
        '</div>' +
        '<span class="dist-opt-tag">জেলা</span>' +
      '</div>';
    }).join("");

    // শুধুমাত্র প্রথমবার ওপেন করার সময় নির্বাচিত জেলা থাকলে স্ক্রোল করা
    if (isInitialOpen) {
      var selEl = distOptionsList.querySelector(".dist-option-item.selected");
      if (selEl) {
        setTimeout(function () {
          selEl.scrollIntoView({ block: "nearest" });
        }, 50);
      }
    }
  }

  function normTxt(s) {
    if (!s) return "";
    var str = String(s);
    if (str.normalize) str = str.normalize("NFC");
    return str.toLowerCase().replace(/\u09BC/g, "");
  }

  function filterDistrictsList(isInitialOpen) {
    var q = (distSearchInput ? distSearchInput.value : "").trim();
    var curVal = distInput ? distInput.value : "";

    if (distClearBtn) {
      distClearBtn.style.display = q ? "flex" : "none";
    }

    if (!q) {
      if (distCountText) distCountText.textContent = "মোট ৬৪টি জেলা";
      if (distCustomOption) distCustomOption.style.display = "none";
      renderDistrictOptions(DISTRICTS, curVal, isInitialOpen);
      return;
    }

    var qNorm = normTxt(q);
    var filtered = DISTRICTS.filter(function (d) {
      return normTxt(d.bn).indexOf(qNorm) > -1 || normTxt(d.en).indexOf(qNorm) > -1;
    });

    if (distCountText) {
      distCountText.textContent = filtered.length > 0 ? bn(filtered.length) + "টি জেলা পাওয়া গেছে" : "কোনো জেলা মেলেনি";
    }

    renderDistrictOptions(filtered, curVal, false);

    if (distCustomOption && distCustomVal) {
      distCustomVal.textContent = '"' + distSearchInput.value.trim() + '"';
      distCustomOption.style.display = "block";
    }
  }

  function openDistDropdown() {
    if (!distBox) return;
    distBox.classList.add("show");
    if (distTrigger) {
      distTrigger.classList.add("open");
      distTrigger.setAttribute("aria-expanded", "true");
    }
    if (distSearchInput) {
      distSearchInput.value = "";
      if (distClearBtn) distClearBtn.style.display = "none";
      setTimeout(function () {
        distSearchInput.focus();
      }, 80);
    }
    filterDistrictsList(true);
  }

  function closeDistDropdown() {
    if (!distBox) return;
    distBox.classList.remove("show");
    if (distTrigger) {
      distTrigger.classList.remove("open");
      distTrigger.setAttribute("aria-expanded", "false");
    }
    activeDistIdx = -1;
  }

  function toggleDistDropdown(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!distBox) return;
    if (distBox.classList.contains("show")) {
      closeDistDropdown();
    } else {
      openDistDropdown();
    }
  }

  if (distWrap && distTrigger && distBox) {
    distTrigger.addEventListener("click", toggleDistDropdown);

    distTrigger.addEventListener("keydown", function (e) {
      if (e.target !== distSearchInput && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
        e.preventDefault();
        openDistDropdown();
      }
    });

    // ড্রপডাউনের ভেতরে ক্লিক/টাচ করলে বাইরে ক্লিক হিসেবে গণ্য হওয়া ঠেকানো
    ["click", "mousedown", "pointerdown", "touchstart"].forEach(function (ev) {
      distBox.addEventListener(ev, function (e) {
        e.stopPropagation();
      }, { passive: ev === "touchstart" });
    });

    // টাচ স্ক্রল ট্র্যাকিং (মোবাইলে স্ক্রোল করার সময় অসাবধানতাবশত ক্লিক যেন না হয়)
    if (distOptionsList) {
      distOptionsList.addEventListener("touchstart", function () {
        isTouchScrolling = false;
      }, { passive: true });

      distOptionsList.addEventListener("touchmove", function () {
        isTouchScrolling = true;
      }, { passive: true });

      distOptionsList.addEventListener("click", function (e) {
        if (isTouchScrolling) return;
        var it = e.target.closest(".dist-option-item");
        if (!it) return;
        var val = it.dataset.val;
        if (val) selectDistrict(val);
      });
    }

    // সার্চ ইনপুটে টাইপিং
    if (distSearchInput) {
      distSearchInput.addEventListener("input", function () {
        filterDistrictsList(false);
      });

      distSearchInput.addEventListener("keydown", function (e) {
        // কিবোর্ড কম্পোজিশন (যেমন: অভ্র, রিদ্মিক, জিবোর্ড ইত্যাদি) চলাকালীন ইন্টারাপ্ট না করা
        if (e.isComposing || e.keyCode === 229) return;

        var items = distOptionsList ? distOptionsList.querySelectorAll(".dist-option-item") : [];
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (items.length > 0) {
            activeDistIdx = (activeDistIdx + 1) % items.length;
            items.forEach(function (el, i) { el.classList.toggle("active", i === activeDistIdx); });
            if (items[activeDistIdx]) items[activeDistIdx].scrollIntoView({ block: "nearest" });
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (items.length > 0) {
            activeDistIdx = (activeDistIdx - 1 + items.length) % items.length;
            items.forEach(function (el, i) { el.classList.toggle("active", i === activeDistIdx); });
            if (items[activeDistIdx]) items[activeDistIdx].scrollIntoView({ block: "nearest" });
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          // শুধুমাত্র যদি অ্যারো কি দিয়ে কোনো আইটেম সিলেক্ট করা থাকে, তবেই এন্টারে সিলেক্ট হবে
          if (activeDistIdx >= 0 && items[activeDistIdx]) {
            selectDistrict(items[activeDistIdx].dataset.val);
          } else {
            filterDistrictsList(false);
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeDistDropdown();
        }
      });
    }

    // ক্লিয়ার (✕) বাটন
    if (distClearBtn) {
      distClearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (distSearchInput) {
          distSearchInput.value = "";
          distSearchInput.focus();
        }
        filterDistrictsList(false);
      });
    }

    // সার্চ "খুঁজুন" বাটন
    if (distDoSearchBtn) {
      distDoSearchBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (currentFilteredDistricts.length > 0) {
          selectDistrict(currentFilteredDistricts[0].bn);
        } else if (distSearchInput && distSearchInput.value.trim()) {
          selectDistrict(distSearchInput.value.trim());
        } else if (distSearchInput) {
          distSearchInput.focus();
        }
      });
    }

    // কাস্টম এরিয়া বাটন
    if (distUseCustomBtn) {
      distUseCustomBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var custom = distSearchInput ? distSearchInput.value.trim() : "";
        if (custom) selectDistrict(custom);
      });
    }

    // বাইরে আসল ইউজার ক্লিক করলে তবেই ড্রপডাউন বন্ধ (সিন্থেটিক বা অটো ক্লিক ইগনোর)
    document.addEventListener("click", function (e) {
      if (!e.isTrusted) return;
      if (!distWrap || !distWrap.contains(e.target)) {
        closeDistDropdown();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeDistDropdown();
      }
    });
  }

  /* validation */
  function normPhone(v) { return v.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[\s\-()]/g, ""); }
  var BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
  function setErr(name, msg) {
    var f = $("[data-err='" + name + "']").closest(".field");
    $("[data-err='" + name + "']").textContent = msg || ""; f.classList.toggle("bad", !!msg);
  }

  function validate() {
    var v = {
      name: $("#name").value.trim(),
      phone: normPhone($("#phone").value),
      district: $("#district").value.trim(),
      address: $("#address").value.trim()
    }, ok = true, first = null;

    function bad(k, m) { setErr(k, m); ok = false; if (!first) first = $("#" + k); }
    v.name.length < 2 ? bad("name", "আপনার নাম লিখুন") : setErr("name");
    !BD_PHONE.test(v.phone) ? bad("phone", "সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 01712345678)") : setErr("phone");
    v.district.length < 2 ? bad("district", "জেলা বা এলাকার নাম নির্বাচন করুন") : setErr("district");
    v.address.length < 6 ? bad("address", "সম্পূর্ণ ঠিকানা লিখুন") : setErr("address");
    if (first) first.focus();
    return ok ? v : null;
  }

  ["name", "phone", "district", "address"].forEach(function (k) {
    $("#" + k).addEventListener("input", function () { setErr(k); });
  });

  /* submit */
  var form = $("#orderForm"), btn = $("#submitBtn"), msg = $("#formMsg");
  function showMsg(type, text) { msg.className = "form-msg show " + type; msg.textContent = text; msg.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  function busy(on) { state.busy = on; btn.disabled = on; btn.classList.toggle("loading", on); $("#submitLabel").textContent = on ? "অর্ডার পাঠানো হচ্ছে…" : "অর্ডার কনফার্ম করুন"; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (state.busy) return;
    msg.className = "form-msg";

    if ($("#hp").value) return; // honeypot spam protection

    var t = calc();
    if (!t.items || t.items.length === 0) {
      showMsg("fail", "⚠️ অনুগ্রহ করে আপনার পছন্দের কমপক্ষে একটি পণ্য সিলেক্ট করুন।");
      $("#packages").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    var v = validate();
    if (!v) return;

    // ফ্রড এলার্ট ও ডুপ্লিকেট স্প্যাম প্রটেকশন (একই নাম্বার দিয়ে বারবার অর্ডার আটকানো)
    var FRAUD_COOLDOWN_MS = 15 * 60 * 1000; // ১৫ মিনিট কুলডাউন
    var lastOrderRaw = localStorage.getItem("honey_last_order");
    if (lastOrderRaw) {
      try {
        var lastOrder = JSON.parse(lastOrderRaw);
        var timePassed = Date.now() - (lastOrder.time || 0);
        if (lastOrder.phone === v.phone && timePassed < FRAUD_COOLDOWN_MS) {
          var minsLeft = Math.ceil((FRAUD_COOLDOWN_MS - timePassed) / 60000);
          showMsg("fail", "⚠️ ফ্রড এলার্ট (Fraud Alert): আপনি এই মোবাইল নাম্বার দিয়ে কিছুক্ষণ আগেই একটি অর্ডার সম্পন্ন করেছেন (অর্ডার আইডি: " + (lastOrder.orderId || "") + ")। আপনার অর্ডারটি ইতোমধ্যে সফলভাবে গ্রহণ করা হয়েছে। বারবার অর্ডার পাঠানোর প্রয়োজন নেই। অর্ডারে কোনো পরিবর্তন করতে চাইলে সরাসরি আমাদের নম্বরে কল করুন। (" + bn(minsLeft) + " মিনিট পর পুনরায় নতুন অর্ডার করা যাবে)");
          $("#checkout").scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      } catch (err) {}
    }

    if (!C.apiEndpoint) {
      showMsg("fail", "অর্ডার সিস্টেম এখনও কনফিগার করা হয়নি। js/config.js এ আপনার Google Apps Script এর apiEndpoint লিংক যুক্ত করুন। (README দেখুন)");
      return;
    }

    var payload = {
      name: v.name,
      phone: v.phone,
      district: v.district,
      address: v.address,
      note: $("#note").value.trim(),
      shippingId: state.sid,
      items: t.items.map(function (it) {
        return { id: it.product.id, name: it.product.name, price: it.product.price, qty: it.qty };
      }),
      clientTotal: t.total,
      submittedAt: new Date().toISOString()
    };

    busy(true);
    var ctl = new AbortController();
    var to = setTimeout(function () { ctl.abort(); }, 30000);

    fetch(C.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: ctl.signal
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.success) {
          showMsg("ok", "ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আপনার অর্ডার আইডি: " + d.orderId + " | সর্বমোট বিল: " + money(d.total) + "। আমরা অতি দ্রুত আপনার সাথে যোগাযোগ করব।");
          
          try {
            localStorage.setItem("honey_last_order", JSON.stringify({
              phone: v.phone,
              orderId: d.orderId,
              time: Date.now()
            }));
          } catch (e) {}

          form.reset();
          state.items = {};
          if (defProd) state.items[defProd] = 1;
          state.sid = C.defaultShipping || "dhaka";
          calc();

          btn.disabled = true;
          setTimeout(function () { btn.disabled = false; }, 4000);
          state.busy = false;
          btn.classList.remove("loading");
          $("#submitLabel").textContent = "অর্ডার কনফার্ম করুন";
        } else {
          busy(false);
          var errMsg = (d && d.error) ? d.error : "অর্ডার সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন অথবা ফোনে যোগাযোগ করুন।";
          showMsg("fail", errMsg);
        }
      })
      .catch(function () {
        busy(false);
        showMsg("fail", "সার্ভারের সাথে সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করার পূর্বে ফোনে যোগাযোগ করুন।");
      })
      .finally(function () { clearTimeout(to); });
  });
})();
