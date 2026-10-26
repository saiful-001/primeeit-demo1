/* UX + animation layer: scroll reveal, marquee strips, carousel autoplay,
   lightbox, sticky order bar, floating contact buttons, bees. */
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
  if (card && im.benefit) { var d = document.createElement("div"); d.className = "benefit-img"; d.style.backgroundImage = "url('" + im.benefit + "')"; d.setAttribute("role", "img"); d.setAttribute("aria-label", "মধুর ছবি"); card.insertBefore(d, card.children[0]); card.insertBefore($(".bar", card), d); }
  var offer = $(".s-offer");
  if (offer && im.offerBg) offer.style.setProperty("--offer-bg", "url('" + im.offerBg + "')");

  /* reveal on scroll */
  var targets = document.querySelectorAll(".s-video,.s-notice,.s-cta,.benefit-card,.s-gallery .carousel,.s-reviews .carousel,.s-docs .carousel,.s-offer>*,.co-left,.co-right,.bar");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12 });
    targets.forEach(function (t, i) { t.classList.add("reveal"); io.observe(t); });
  }

  /* carousel autoplay (pauses on hover/touch/tab hidden) */
  document.querySelectorAll(".carousel").forEach(function (c) {
    var next = $(".c-next", c), paused = false;
    if (!next || reduce) return;
    ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { c.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["mouseleave", "touchend", "focusout"].forEach(function (ev) { c.addEventListener(ev, function () { paused = false; }, { passive: true }); });
    setInterval(function () { if (!paused && !document.hidden && next.style.display !== "none") next.click(); }, 3800);
  });

  /* lightbox */
  var lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "ছবি");
  lb.innerHTML = '<button type="button" aria-label="বন্ধ করুন">×</button><img alt="">'; document.body.appendChild(lb);
  function closeLb() { lb.classList.remove("open"); }
  lb.addEventListener("click", closeLb);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  document.addEventListener("click", function (e) {
    var im = e.target.closest && e.target.closest(".c-slide img");
    if (!im) return;
    $("img", lb).src = im.currentSrc || im.src; $("img", lb).alt = im.alt; lb.classList.add("open");
  });

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
