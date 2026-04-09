/* Thinking in R — live review overlay
   Loaded via bookmarklet. POSTs to Netlify Functions. */
(function () {
  if (document.getElementById('_review_loaded')) return;
  document.getElementById('_review_loaded')?.remove();
  var marker = document.createElement('meta');
  marker.id = '_review_loaded';
  document.head.appendChild(marker);

  var API = 'https://thinking-in-r.netlify.app/api/feedback-save';

  /* ── CSS ── */
  var style = document.createElement('style');
  style.textContent = `
#rv-sidebar {
  position:fixed;top:0;right:0;width:270px;height:100vh;
  background:#fafafa;border-left:1px solid #e0e0e0;overflow-y:auto;
  z-index:9000;padding:12px 10px 80px;box-sizing:border-box;
  font-family:system-ui,sans-serif;font-size:13px;
}
#rv-sidebar h3 {
  margin:0 0 10px;font-size:12px;font-weight:700;color:#666;
  text-transform:uppercase;letter-spacing:.05em;
}
.rv-change {
  background:#fff;border:1px solid #e0e0e0;border-left:3px solid #1a73e8;
  border-radius:5px;padding:8px 10px;margin-bottom:7px;
}
.rv-change .rv-del { color:#c62828;text-decoration:line-through;font-size:11px;word-break:break-word; }
.rv-change .rv-arr { color:#aaa;font-size:10px;margin:2px 0; }
.rv-change .rv-ins { color:#2e7d32;font-size:11px;word-break:break-word; }
.rv-comment {
  background:#fff;border:1px solid #e0e0e0;border-left:3px solid #f9a825;
  border-radius:5px;padding:8px 10px;margin-bottom:7px;
}
.rv-comment .rv-anchor {
  font-size:11px;color:#999;font-style:italic;margin-bottom:3px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.rv-comment .rv-note { color:#222; }
.rv-empty { color:#bbb;font-size:12px;line-height:1.6; }
#rv-submitbar {
  position:fixed;bottom:0;right:0;width:270px;
  background:#fafafa;border-top:1px solid #e0e0e0;
  padding:10px;box-sizing:border-box;z-index:9001;
}
#rv-submitbar button {
  width:100%;padding:9px;background:#1a73e8;color:#fff;
  border:none;border-radius:6px;font-size:13px;font-weight:600;
  cursor:pointer;font-family:system-ui,sans-serif;
}
#rv-submitbar button:hover { background:#1557b0; }
#rv-submitbar button:disabled { background:#aaa;cursor:default; }
body { margin-right:276px !important; }
[data-rv]:focus { outline:2px solid #1a73e8;outline-offset:2px;border-radius:2px; }
[data-rv].rv-changed { background:#f1f8e9; }
.rv-hi { background:#fff9c4;border-bottom:2px solid #f9a825; }
#rv-trigger {
  display:none;position:fixed;background:#f9a825;color:#fff;
  border:none;border-radius:4px;padding:5px 11px;font-size:12px;
  font-weight:600;cursor:pointer;z-index:9100;
  box-shadow:0 2px 8px rgba(0,0,0,.2);font-family:system-ui,sans-serif;
}
#rv-trigger:hover { background:#e65100; }
#rv-popup {
  display:none;position:fixed;background:#fff;border:1px solid #ccc;
  border-radius:8px;padding:12px 14px;
  box-shadow:0 6px 20px rgba(0,0,0,.15);z-index:9200;width:300px;
  font-family:system-ui,sans-serif;font-size:13px;
}
#rv-popup .rv-pa {
  font-style:italic;color:#999;font-size:11px;margin-bottom:8px;
  border-left:2px solid #f9a825;padding-left:6px;
}
#rv-popup textarea {
  width:100%;height:80px;box-sizing:border-box;border:1px solid #ccc;
  border-radius:4px;padding:6px;font-size:13px;font-family:inherit;resize:vertical;
}
#rv-popup textarea:focus { outline:none;border-color:#f9a825; }
#rv-popup .rv-row { display:flex;gap:8px;margin-top:8px; }
#rv-popup .rv-row button {
  flex:1;padding:7px;border:none;border-radius:5px;font-size:13px;
  font-weight:600;cursor:pointer;font-family:system-ui,sans-serif;
}
.rv-save-btn { background:#f9a825;color:#fff; }
.rv-save-btn:hover { background:#e65100; }
.rv-cancel-btn { background:#f1f3f4;color:#333; }
#rv-flash {
  display:none;position:fixed;bottom:60px;right:285px;
  background:#2e7d32;color:#fff;padding:9px 16px;border-radius:6px;
  font-size:13px;font-weight:600;font-family:system-ui,sans-serif;
  z-index:9300;box-shadow:0 3px 10px rgba(0,0,0,.2);
}`;
  document.head.appendChild(style);

  /* ── Sidebar HTML ── */
  var sidebar = document.createElement('div');
  sidebar.id = 'rv-sidebar';
  sidebar.innerHTML = '<h3>Review</h3><div id="rv-items"></div>';
  document.body.appendChild(sidebar);

  var submitBar = document.createElement('div');
  submitBar.id = 'rv-submitbar';
  submitBar.innerHTML = '<button id="rv-submit-btn" onclick="rvSubmit()">Submit feedback</button>';
  document.body.appendChild(submitBar);

  var trigger = document.createElement('button');
  trigger.id = 'rv-trigger';
  trigger.textContent = '+ Comment';
  trigger.setAttribute('onclick', 'rvOpenPopup()');
  document.body.appendChild(trigger);

  var popup = document.createElement('div');
  popup.id = 'rv-popup';
  popup.innerHTML = `
    <div class="rv-pa" id="rv-pa"></div>
    <textarea id="rv-note" placeholder="Your note…"></textarea>
    <div class="rv-row">
      <button class="rv-save-btn" onclick="rvSaveComment()">Save</button>
      <button class="rv-cancel-btn" onclick="rvClosePopup()">Cancel</button>
    </div>`;
  document.body.appendChild(popup);

  var flash = document.createElement('div');
  flash.id = 'rv-flash';
  document.body.appendChild(flash);

  /* ── State ── */
  var changes = [], comments = [], cid = 0, selAnchor = '', selRange = null, popupOpen = false;

  /* ── Make paragraphs editable ── */
  var paras = document.querySelectorAll(
    'main p, #quarto-content p, section p, article p, .content p, main li'
  );
  paras.forEach(function (el) {
    if (el.closest('pre, code, .sourceCode, nav, #rv-sidebar')) return;
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-rv', '');
    el.setAttribute('data-orig', el.innerText.trim());
    el.addEventListener('blur', function () {
      var orig = el.getAttribute('data-orig');
      var curr = el.innerText.trim();
      if (curr === orig) { el.classList.remove('rv-changed'); return; }
      el.classList.add('rv-changed');
      changes = changes.filter(function (c) { return c.el !== el; });
      changes.push({ el: el, original: orig, edited: curr });
      rvRender();
    });
  });

  /* ── Selection → trigger ── */
  document.addEventListener('mouseup', function (e) {
    if (popupOpen) return;
    if (e.target.closest('#rv-sidebar,#rv-popup,#rv-trigger,#rv-submitbar')) return;
    setTimeout(function () {
      var sel = window.getSelection();
      var txt = sel ? sel.toString().trim() : '';
      if (txt.length > 6) {
        selAnchor = txt;
        try { selRange = sel.getRangeAt(0).cloneRange(); } catch (_) { selRange = null; }
        var btn = document.getElementById('rv-trigger');
        btn.style.left = Math.min(e.clientX, window.innerWidth - 150) + 'px';
        btn.style.top  = (e.clientY - 38) + 'px';
        btn.style.display = 'block';
      } else {
        document.getElementById('rv-trigger').style.display = 'none';
      }
    }, 10);
  });

  window.rvOpenPopup = function () {
    document.getElementById('rv-trigger').style.display = 'none';
    popupOpen = true;
    var p = document.getElementById('rv-popup');
    p.style.left = Math.min(window.innerWidth / 2 - 150, window.innerWidth - 320) + 'px';
    p.style.top  = (window.innerHeight / 2 - 100) + 'px';
    p.style.display = 'block';
    document.getElementById('rv-pa').textContent =
      '\u201c' + selAnchor.slice(0, 100) + (selAnchor.length > 100 ? '\u2026' : '') + '\u201d';
    document.getElementById('rv-note').value = '';
    document.getElementById('rv-note').focus();
  };

  window.rvClosePopup = function () {
    document.getElementById('rv-popup').style.display = 'none';
    popupOpen = false;
  };

  window.rvSaveComment = function () {
    var note = document.getElementById('rv-note').value.trim();
    rvClosePopup();
    if (!note) return;
    var id = ++cid;
    comments.push({ id: id, anchor: selAnchor, note: note });
    if (selRange) {
      try {
        var mark = document.createElement('mark');
        mark.className = 'rv-hi';
        mark.title = note;
        selRange.surroundContents(mark);
      } catch (_) {}
    }
    selAnchor = ''; selRange = null;
    rvRender();
    rvFlash('Comment saved');
  };

  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function rvRender() {
    var el = document.getElementById('rv-items');
    if (!changes.length && !comments.length) {
      el.innerHTML = '<p class="rv-empty">No feedback yet.<br>Click a paragraph to edit,<br>or select text to comment.</p>';
      return;
    }
    var html = '';
    changes.forEach(function (c) {
      html += '<div class="rv-change">' +
        '<div class="rv-del">' + esc(c.original.slice(0, 130)) + (c.original.length > 130 ? '…' : '') + '</div>' +
        '<div class="rv-arr">→</div>' +
        '<div class="rv-ins">' + esc(c.edited.slice(0, 130)) + (c.edited.length > 130 ? '…' : '') + '</div>' +
        '</div>';
    });
    comments.forEach(function (c) {
      html += '<div class="rv-comment">' +
        '<div class="rv-anchor">\u201c' + esc(c.anchor.slice(0, 80)) + '\u201d</div>' +
        '<div class="rv-note">' + esc(c.note) + '</div>' +
        '</div>';
    });
    el.innerHTML = html;
  }

  window.rvSubmit = function () {
    if (!changes.length && !comments.length) return;
    var btn = document.getElementById('rv-submit-btn');
    btn.disabled = true; btn.textContent = 'Saving…';
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        changes:  changes.map(function (c) { return { original: c.original, edited: c.edited }; }),
        comments: comments.map(function (c) { return { anchor: c.anchor, note: c.note }; })
      })
    }).then(function () {
      btn.disabled = false; btn.textContent = 'Submit feedback';
      changes = []; comments = [];
      document.querySelectorAll('[data-rv].rv-changed').forEach(function (el) {
        el.classList.remove('rv-changed');
        el.setAttribute('data-orig', el.innerText.trim());
      });
      document.querySelectorAll('.rv-hi').forEach(function (m) {
        var p = m.parentNode;
        while (m.firstChild) p.insertBefore(m.firstChild, m);
        p.removeChild(m);
      });
      rvRender();
      rvFlash('Feedback saved');
    });
  };

  function rvFlash(msg) {
    var el = document.getElementById('rv-flash');
    el.textContent = '\u2713 ' + msg;
    el.style.display = 'block';
    setTimeout(function () { el.style.display = 'none'; }, 2000);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') rvClosePopup();
  });

  rvRender();
})();
