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

      // প্রি-লোডেড থাম্বনেইল পোস্টার যাতে ০ সেকেন্ড ব্ল্যাক স্ক্রিন থাকে
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
      // স্ক্রিনে প্রথম স্পর্শ বা ক্লিকে স্বয়ংক্রিয়ভাবে সাউন্ড চালু
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

  // পণ্যসমূহ রেন্ডার করা (বামপাশের কার্ড)
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

    // কার্ডে ক্লিক করলে টগল হবে
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

  // অর্ডার বিল ও সারাংশ হিসাব নিকাশ
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

    // ডানপাশের "আপনার অর্ডার" কার্ট রেন্ডার (+/- বাটন ও প্রতিটি পণ্যের দাম সহ)
    if (sumListEl) {
      if (selectedList.length === 0) {
        sumListEl.innerHTML = '<div class="sum-row empty-notice"><span>⚠️ কোনো পণ্য সিলেক্ট করা হয়নি (কমপক্ষে ১টি সিলেক্ট করুন)</span><span>' + money(0) + '</span></div>';
      } else {
        sumListEl.innerHTML = selectedList.map(function (it) {
          return '<div class="sum-cart-item" data-id="' + esc(it.product.id) + '">' +
            '<div class="sci-details">' +
              '<span class="sci-name">' + esc(it.product.name) + '</span>' +
              '<span class="sci-unit-price">প্রতিটি: ' + money(it.product.price) + '</span>' +
            '</div>' +
            '<div class="sci-action">' +
              '<div class="sci-qty">' +
                '<button type="button" class="sci-btn minus" data-id="' + esc(it.product.id) + '" aria-label="কমান">−</button>' +
                '<span class="sci-num">' + bn(it.qty) + '</span>' +
                '<button type="button" class="sci-btn plus" data-id="' + esc(it.product.id) + '" aria-label="বাড়ান">+</button>' +
              '</div>' +
              '<span class="sci-item-total">' + money(it.total) + '</span>' +
            '</div>' +
          '</div>';
        }).join("");
      }
    }

    // ডিসকাউন্ট হিসাব
    var discount = 0;
    var D = C.discount;
    if (D && D.enabled && selectedList.length > 0 && subtotal >= (D.minOrderAmount || 0)) {
      if (D.type === "PERCENT") {
        discount = Math.round((subtotal * (D.amount || 0)) / 100);
      } else {
        discount = D.amount || 0;
      }
      if (selectedList.length > 1 && D.multiItemBonusDiscount) {
        discount += D.multiItemBonusDiscount;
      }
      discount = Math.min(discount, subtotal);
    }

    var discRow = $("#sumDiscountRow");
    if (discRow) {
      if (discount > 0) {
        discRow.style.display = "flex";
        $("#sumDiscount").textContent = "− " + money(discount);
      } else {
        discRow.style.display = "none";
      }
    }

    // শিপিং চার্জ
    var shipCharge = s ? s.charge : 0;
    if (C.freeShippingMinTotal > 0 && subtotal >= C.freeShippingMinTotal) {
      shipCharge = 0;
    }

    var grandTotal = Math.max(0, subtotal - discount) + (selectedList.length > 0 ? shipCharge : 0);

    $("#sumSub").textContent = money(subtotal);
    $("#sumShip").textContent = shipCharge === 0 && selectedList.length > 0 && C.freeShippingMinTotal > 0 ? "ফ্রি" : money(shipCharge);
    $("#sumTotal").textContent = money(grandTotal);

    return {
      subtotal: subtotal,
      discount: discount,
      shipping: shipCharge,
      total: grandTotal,
      items: selectedList
    };
  }

  calc();

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
    v.district.length < 2 ? bad("district", "জেলা বা এলাকার নাম লিখুন") : setErr("district");
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
          form.reset();
          state.items = {};
          if (defProd) state.items[defProd] = 1;
          state.sid = C.defaultShipping || "dhaka";
          calc();

          btn.disabled = true;
          setTimeout(function () { btn.disabled = false; }, 4000); // accidental double click guard
          state.busy = false;
          btn.classList.remove("loading");
          $("#submitLabel").textContent = "অর্ডার কনফার্ম করুন";
        } else {
          busy(false);
          showMsg("fail", (d && d.error) ? d.error : "অর্ডার সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন অথবা ফোনে যোগাযোগ করুন।");
        }
      })
      .catch(function () {
        busy(false);
        showMsg("fail", "সার্ভারের সাথে সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করার পূর্বে ফোনে যোগাযোগ করুন।");
      })
      .finally(function () { clearTimeout(to); });
  });
})();
