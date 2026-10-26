/* UX + animation layer: scroll reveal, marquee strips, carousel autoplay,
   interactive lightbox with sliding/swiping, sticky order bar, floating contact buttons. */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {}, $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* flying bees removed per user request */

  /* marquee strips: repeat text so it loops seamlessly */
  document.querySelectorAll(".s-strip").forEach(function (el) {
    var html = el.innerHTML, group = "";
    for (var i = 0; i < 4; i++) group += "<span>" + html + "</span>";
    el.innerHTML = '<div class="mq" aria-label="' + el.textContent.replace(/"/g, "") + '">' + group + group + "</div>";
  });

  /* photos for benefits card + offer banner (from config.images) */
  var im = C.images || {};
  var card = $(".benefit-card");
  if (card && im.benefit) {
    var d = document.createElement("div");
    d.className = "benefit-img";
    d.style.backgroundImage = "url('" + im.benefit + "')";
    d.setAttribute("role", "img");
    d.setAttribute("aria-label", "মধুর ছবি");
    card.insertBefore(d, card.children[0]);
    card.insertBefore($(".bar", card), d);
  }
  var offer = $(".s-offer");
  if (offer && im.offerBg) offer.style.setProperty("--offer-bg", "url('" + im.offerBg + "')");

  /* reveal on scroll */
  var targets = document.querySelectorAll(".s-video,.s-notice,.s-cta,.benefit-card,.s-gallery .carousel,.s-reviews .carousel,.s-docs .carousel,.s-offer>*,.co-left,.co-right,.bar");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12 });
    targets.forEach(function (t) { t.classList.add("reveal"); io.observe(t); });
  }

  /* carousel autoplay (pauses on hover/touch/tab hidden) */
  document.querySelectorAll(".carousel").forEach(function (c) {
    var next = $(".c-next", c), paused = false;
    if (!next || reduce) return;
    ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { c.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["mouseleave", "touchend", "focusout"].forEach(function (ev) { c.addEventListener(ev, function () { paused = false; }, { passive: true }); });
    setInterval(function () { if (!paused && !document.hidden && next.style.display !== "none") next.click(); }, 3800);
  });

  /* ---------- Lightbox (Desktop Slide + Phone Touch Swipe & Scroll) ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-label", "ছবি প্রদর্শনী");
  lb.innerHTML =
    '<div class="lb-inner">' +
      '<button type="button" class="lb-btn lb-close" aria-label="বন্ধ করুন">✕</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="পূর্ববর্তী ছবি">‹</button>' +
      '<div class="lb-stage">' +
        '<img src="" alt="" class="lb-img">' +
      '</div>' +
      '<button type="button" class="lb-btn lb-next" aria-label="পরবর্তী ছবি">›</button>' +
      '<div class="lb-caption">' +
        '<span class="lb-badge">ছবি <span id="lbCurrent">১</span> / <span id="lbTotal">১</span></span>' +
      '</div>' +
    '</div>';
  document.body.appendChild(lb);

  var lbImg = $(".lb-img", lb);
  var lbCurrent = $("#lbCurrent", lb);
  var lbTotal = $("#lbTotal", lb);
  var lbState = { images: [], index: 0 };
  var bnDigits = function (n) { return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); };

  function renderLb() {
    if (!lbState.images.length) return;
    var cur = lbState.images[lbState.index];
    lbImg.style.opacity = "0";
    lbImg.style.transform = "scale(0.96)";
    setTimeout(function () {
      lbImg.src = cur.currentSrc || cur.src;
      lbImg.alt = cur.alt || "ছবি";
      lbImg.style.opacity = "1";
      lbImg.style.transform = "scale(1)";
    }, 110);
    if (lbCurrent) lbCurrent.textContent = bnDigits(lbState.index + 1);
    if (lbTotal) lbTotal.textContent = bnDigits(lbState.images.length);
  }

  function goLb(step) {
    if (!lbState.images.length) return;
    var len = lbState.images.length;
    lbState.index = (lbState.index + step + len) % len;
    renderLb();
  }

  function closeLb() {
    lb.classList.remove("open");
  }

  // গ্যালারি বা রিভিউ বা ডকুমেন্টের ছবিতে ক্লিক করলে লাইটবক্সে স্লাইড চালু
  document.addEventListener("click", function (e) {
    var im = e.target.closest && e.target.closest(".c-slide img");
    if (!im) return;
    var carousel = im.closest("[data-carousel]");
    if (carousel) {
      var allImgs = Array.from(carousel.querySelectorAll(".c-slide img"));
      lbState.images = allImgs;
      lbState.index = Math.max(0, allImgs.indexOf(im));
    } else {
      lbState.images = [im];
      lbState.index = 0;
    }
    renderLb();
    lb.classList.add("open");
  });

  // লাইটবক্স নেভিগেশন বাটন
  $(".lb-close", lb).onclick = function (e) { e.stopPropagation(); closeLb(); };
  $(".lb-prev", lb).onclick = function (e) { e.stopPropagation(); goLb(-1); };
  $(".lb-next", lb).onclick = function (e) { e.stopPropagation(); goLb(1); };

  // ব্যাকগ্রাউন্ডে ক্লিক করলে লাইটবক্স ক্লোজ
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lb-stage") || e.target.classList.contains("lb-inner")) {
      closeLb();
    }
  });

  // কিবোর্ড অ্যারো নেভিগেশন (Escape, Left, Right)
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") goLb(-1);
    if (e.key === "ArrowRight") goLb(1);
  });

  // মোবাইলে টাচ সোয়াইপ (Swipe Left = Next, Swipe Right = Prev)
  var touchStartX = null;
  var touchStartY = null;
  lb.addEventListener("touchstart", function (e) {
    if (!lb.classList.contains("open") || !e.touches[0]) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lb.addEventListener("touchend", function (e) {
    if (touchStartX === null || !e.changedTouches[0]) return;
    var diffX = e.changedTouches[0].clientX - touchStartX;
    var diffY = e.changedTouches[0].clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        goLb(1); // সোয়াইপ লেফট -> পরের ছবি
      } else {
        goLb(-1); // সোয়াইপ রাইট -> আগের ছবি
      }
    }
  }, { passive: true });

  /* sticky order bar (hidden while checkout is visible) */
  var bar = document.createElement("div"); bar.className = "sticky-cta"; bar.id = "stickyCta";
  var p = (C.products || []).filter(function (x) { return x.id === C.defaultProduct; })[0] || (C.products || [])[0];
  var toNum = function (v) {
    if (typeof v === "number") return isNaN(v) ? 0 : v;
    var s = String(v || "").replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^\d.]/g, "");
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };
  var bn = function (n) { return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); };
  bar.innerHTML = (p ? '<div class="sp">' + (p.name || "") + "<b>" + (C.currency || "৳") + bn(toNum(p.price).toLocaleString("en-US")) + "</b></div>" : "") + '<button type="button" class="btn-order" data-scroll-order>👍 এখনই অর্ডার করুন</button>';
  document.body.appendChild(bar);
  $("[data-scroll-order]", bar).addEventListener("click", function () { $("#checkout").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); });
  var co = $("#checkout"), firstCta = $(".s-cta"), checkoutVisible = false, pastFirst = false;
  function upd() { bar.classList.toggle("show", pastFirst && !checkoutVisible); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { checkoutVisible = es[0].isIntersecting; upd(); }, { threshold: .05 }).observe(co);
    new IntersectionObserver(function (es) { pastFirst = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; upd(); }).observe(firstCta);
  }

  /* floating contact buttons (shown only if configured) */
  var ct = C.contact || {}, fl = document.createElement("div"); fl.className = "floaters";
  if (ct.whatsapp) fl.innerHTML += '<a class="wa" href="https://wa.me/' + String(ct.whatsapp).replace(/\D/g, "") + '" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>';
  if (ct.phone) fl.innerHTML += '<a class="tel" href="tel:' + String(ct.phone).replace(/[^\d+]/g, "") + '" aria-label="কল করুন">📞</a>';
  if (fl.children.length) document.body.appendChild(fl);
})();
