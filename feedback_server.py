#!/usr/bin/env python3
"""
Live review server for Thinking in R.
Run: python feedback_server.py
Open http://localhost:8080

- Click any paragraph to edit it (tracked changes saved automatically)
- Select text + click Comment to leave a margin note
- All feedback saved to _feedback.md
"""
import json
import os
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

DOCS_DIR = Path(__file__).parent / "docs"
FEEDBACK_FILE = Path(__file__).parent / "_feedback.md"
PORT = 8080

INJECT = r"""
<style>
/* ── Sidebar ── */
#review-sidebar {
  position: fixed;
  top: 0; right: 0;
  width: 280px;
  height: 100vh;
  background: #fafafa;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  z-index: 900;
  padding: 12px 10px 80px;
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
  font-size: 13px;
}
#review-sidebar h3 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #444;
  letter-spacing: .03em;
  text-transform: uppercase;
}
.comment-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-left: 3px solid #f9a825;
  border-radius: 5px;
  padding: 8px 10px;
  margin-bottom: 8px;
  cursor: pointer;
}
.comment-card:hover { border-left-color: #e65100; }
.comment-card .anchor {
  font-size: 11px;
  color: #888;
  font-style: italic;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.comment-card .note { color: #222; }
.change-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-left: 3px solid #1a73e8;
  border-radius: 5px;
  padding: 8px 10px;
  margin-bottom: 8px;
}
.change-card .del { color: #c62828; text-decoration: line-through; font-size: 11px; }
.change-card .ins { color: #2e7d32; font-size: 11px; }

/* ── Push main content left ── */
body { margin-right: 296px !important; }

/* ── Editable paragraphs ── */
[data-editable]:focus {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
  border-radius: 2px;
}
[data-editable].changed { background: #e8f5e9; }
ins.track  { background: #c8e6c9; text-decoration: none; }
del.track  { background: #ffcdd2; text-decoration: line-through; color: #b71c1c; }
.comment-highlight { background: #fff9c4; border-bottom: 2px solid #f9a825; cursor: pointer; }

/* ── Comment popup ── */
#comment-popup {
  display: none;
  position: fixed;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,.15);
  z-index: 2000;
  width: 300px;
  font-family: system-ui, sans-serif;
  font-size: 13px;
}
#comment-popup .anchor-preview {
  font-style: italic;
  color: #888;
  font-size: 11px;
  margin-bottom: 8px;
  border-left: 2px solid #f9a825;
  padding-left: 6px;
}
#comment-popup textarea {
  width: 100%; height: 80px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
}
#comment-popup textarea:focus { outline: none; border-color: #f9a825; }

/* ── Floating comment button ── */
#comment-trigger {
  display: none;
  position: fixed;
  background: #f9a825;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  z-index: 1500;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
  font-family: system-ui, sans-serif;
}
#comment-trigger:hover { background: #e65100; }

/* ── Submit bar ── */
#submit-bar {
  position: fixed;
  bottom: 0; right: 0;
  width: 280px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
  padding: 10px;
  box-sizing: border-box;
  z-index: 1000;
}
#submit-bar button {
  width: 100%;
  padding: 9px;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: system-ui, sans-serif;
}
#submit-bar button:hover { background: #1557b0; }
#submit-bar button:disabled { background: #aaa; cursor: default; }

/* ── Flash ── */
#review-flash {
  display: none;
  position: fixed;
  bottom: 60px; right: 300px;
  background: #2e7d32;
  color: #fff;
  padding: 9px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: system-ui, sans-serif;
  z-index: 3000;
  box-shadow: 0 3px 10px rgba(0,0,0,.2);
}
</style>

<!-- Sidebar -->
<div id="review-sidebar">
  <h3>Review</h3>
  <div id="sidebar-items"></div>
</div>
<div id="submit-bar">
  <button onclick="submitAll()" id="submit-btn">Submit feedback</button>
</div>

<!-- Floating comment trigger -->
<button id="comment-trigger" onclick="openCommentPopup()">+ Comment</button>

<!-- Comment popup -->
<div id="comment-popup">
  <div class="anchor-preview" id="popup-anchor"></div>
  <textarea id="popup-text" placeholder="Your note…"></textarea>
  <div style="margin-top:8px;display:flex;gap:8px;">
    <button onclick="saveComment()"
      style="flex:1;padding:7px;background:#f9a825;color:#fff;border:none;border-radius:5px;font-size:13px;font-weight:600;cursor:pointer;font-family:system-ui">
      Save
    </button>
    <button onclick="closeCommentPopup()"
      style="flex:1;padding:7px;background:#f1f3f4;color:#333;border:none;border-radius:5px;font-size:13px;cursor:pointer;font-family:system-ui">
      Cancel
    </button>
  </div>
</div>
<div id="review-flash"></div>

<script>
(function() {

/* ── State ── */
var comments  = [];   // {id, anchor, note, range}
var changes   = [];   // {id, original, edited, el}
var commentId = 0;
var changeId  = 0;
var selAnchor = '';
var selRange  = null;
var triggerOpen = false;

/* ── Make paragraphs editable ── */
document.querySelectorAll(
  'main p, #quarto-content p, .content p, section p, ' +
  'main li, #quarto-content li'
).forEach(function(el) {
  // skip code blocks
  if (el.closest('pre, code, .sourceCode')) return;
  el.setAttribute('contenteditable', 'true');
  el.setAttribute('data-editable', '');
  el.setAttribute('data-original', el.innerText.trim());
  el.setAttribute('data-id', 'p' + (++changeId));
  el.addEventListener('blur', onParaBlur);
});

function onParaBlur(e) {
  var el = e.target;
  var orig = el.getAttribute('data-original');
  var curr = el.innerText.trim();
  if (curr === orig) { el.classList.remove('changed'); return; }

  el.classList.add('changed');

  // remove previous change record for this element
  var pid = el.getAttribute('data-id');
  changes = changes.filter(function(c) { return c.pid !== pid; });
  changes.push({ pid: pid, original: orig, edited: curr, el: el });
  renderSidebar();
}

/* ── Selection → comment trigger ── */
document.addEventListener('mouseup', function(e) {
  if (triggerOpen) return;
  if (e.target.closest('#review-sidebar, #comment-popup, #comment-trigger, #submit-bar')) return;

  setTimeout(function() {
    var sel = window.getSelection();
    var txt = sel ? sel.toString().trim() : '';
    if (txt.length > 6) {
      selAnchor = txt;
      try { selRange = sel.getRangeAt(0).cloneRange(); } catch(err) { selRange = null; }
      var btn = document.getElementById('comment-trigger');
      var x = Math.min(e.clientX, window.innerWidth - 140);
      var y = e.clientY - 36;
      btn.style.left = x + 'px';
      btn.style.top  = y + 'px';
      btn.style.display = 'block';
    } else {
      hideCommentTrigger();
    }
  }, 10);
});

function hideCommentTrigger() {
  document.getElementById('comment-trigger').style.display = 'none';
  selAnchor = '';
  selRange = null;
}

/* ── Comment popup ── */
window.openCommentPopup = function() {
  hideCommentTrigger();
  var popup = document.getElementById('comment-popup');
  var x = Math.min(window.innerWidth / 2 - 150, window.innerWidth - 320);
  var y = window.innerHeight / 2 - 100;
  popup.style.left = x + 'px';
  popup.style.top  = y + 'px';
  popup.style.display = 'block';
  document.getElementById('popup-anchor').textContent =
    '\u201c' + selAnchor.substring(0, 100) + (selAnchor.length > 100 ? '\u2026' : '') + '\u201d';
  document.getElementById('popup-text').value = '';
  document.getElementById('popup-text').focus();
  triggerOpen = true;
};

window.closeCommentPopup = function() {
  document.getElementById('comment-popup').style.display = 'none';
  triggerOpen = false;
};

window.saveComment = function() {
  var note = document.getElementById('popup-text').value.trim();
  closeCommentPopup();
  if (!note) return;

  var id = ++commentId;
  comments.push({ id: id, anchor: selAnchor, note: note });

  // highlight anchor text in document
  if (selRange) {
    try {
      var mark = document.createElement('mark');
      mark.className = 'comment-highlight';
      mark.title = note;
      mark.setAttribute('data-cid', id);
      selRange.surroundContents(mark);
    } catch(err) { /* selection crosses element boundary — skip wrap */ }
  }

  selAnchor = '';
  selRange = null;
  renderSidebar();
  flash('Comment saved');
};

/* ── Sidebar ── */
function renderSidebar() {
  var el = document.getElementById('sidebar-items');
  var html = '';

  if (changes.length === 0 && comments.length === 0) {
    el.innerHTML = '<p style="color:#aaa;font-size:12px">No feedback yet.<br>Click a paragraph to edit, or select text to comment.</p>';
    return;
  }

  changes.forEach(function(c) {
    html += '<div class="change-card">' +
      '<div class="del">' + esc(c.original.substring(0, 120)) + (c.original.length > 120 ? '…' : '') + '</div>' +
      '<div style="color:#888;font-size:10px;margin:3px 0">→</div>' +
      '<div class="ins">' + esc(c.edited.substring(0, 120)) + (c.edited.length > 120 ? '…' : '') + '</div>' +
      '</div>';
  });

  comments.forEach(function(c) {
    html += '<div class="comment-card">' +
      '<div class="anchor">\u201c' + esc(c.anchor.substring(0, 80)) + '\u201d</div>' +
      '<div class="note">' + esc(c.note) + '</div>' +
      '</div>';
  });

  el.innerHTML = html;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Submit ── */
window.submitAll = function() {
  if (changes.length === 0 && comments.length === 0) return;
  var btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: window.location.pathname,
      changes: changes.map(function(c) { return { original: c.original, edited: c.edited }; }),
      comments: comments.map(function(c) { return { anchor: c.anchor, note: c.note }; })
    })
  }).then(function() {
    btn.disabled = false;
    btn.textContent = 'Submit feedback';
    flash('Feedback saved to _feedback.md');
    // clear state
    changes = [];
    comments = [];
    document.querySelectorAll('[data-editable].changed').forEach(function(el) {
      el.classList.remove('changed');
      el.setAttribute('data-original', el.innerText.trim());
    });
    document.querySelectorAll('.comment-highlight').forEach(function(m) {
      var parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
    });
    renderSidebar();
  });
};

/* ── Flash ── */
function flash(msg) {
  var el = document.getElementById('review-flash');
  el.textContent = '\u2713 ' + msg;
  el.style.display = 'block';
  setTimeout(function() { el.style.display = 'none'; }, 2000);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCommentPopup();
});

renderSidebar();

})();
</script>
"""


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DOCS_DIR), **kwargs)

    def do_POST(self):
        if self.path == '/api/feedback':
            n = int(self.headers.get('Content-Length', 0))
            data = json.loads(self.rfile.read(n))
            self._save(data)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
        else:
            self.send_response(404)
            self.end_headers()

    def _save(self, data):
        page     = data.get('page', '').strip('/')
        changes  = data.get('changes', [])
        comments = data.get('comments', [])

        if not changes and not comments:
            return

        needs_header = (not FEEDBACK_FILE.exists()
                        or FEEDBACK_FILE.stat().st_size == 0)

        lines = []
        if needs_header:
            lines.append("# Book Feedback\n")

        lines.append(f"\n## {page or '(unknown)'}\n")

        for c in changes:
            orig = c.get('original', '').strip()
            edit = c.get('edited', '').strip()
            if orig != edit:
                lines.append("\n**EDIT**\n")
                lines.append(f"- Original: {orig}\n")
                lines.append(f"- Revised:  {edit}\n")

        for c in comments:
            anchor = c.get('anchor', '').strip()
            note   = c.get('note', '').strip()
            lines.append(f"\n**COMMENT** on \"{anchor[:120]}\"\n")
            lines.append(f"{note}\n")

        lines.append("\n---\n")

        with open(FEEDBACK_FILE, 'a', encoding='utf-8') as f:
            f.write(''.join(lines))

        print(f"[saved] {len(changes)} change(s), {len(comments)} comment(s) → {page}")

    def do_GET(self):
        path = urlparse(self.path).path
        fp = DOCS_DIR / path.lstrip('/')
        if fp.is_dir():
            fp = fp / 'index.html'
        if not fp.suffix:
            fp = fp.with_suffix('.html')

        if fp.exists() and fp.suffix == '.html':
            content = fp.read_text(encoding='utf-8')
            content = content.replace('</body>', INJECT + '\n</body>', 1)
            enc = content.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(enc)))
            self.end_headers()
            self.wfile.write(enc)
        else:
            super().do_GET()

    def log_message(self, fmt, *args):
        if args and '/api/' not in str(args[0]):
            super().log_message(fmt, *args)


if __name__ == '__main__':
    os.chdir(Path(__file__).parent)
    srv = HTTPServer(('localhost', PORT), Handler)
    url = f'http://localhost:{PORT}'
    print(f"Review server → {url}")
    print(f"Feedback file → {FEEDBACK_FILE.name}")
    print("Click a paragraph to edit it. Select text to add a comment.")
    print("Hit 'Submit feedback' in the sidebar when done.")
    print("Press Ctrl+C to stop.\n")
    webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
