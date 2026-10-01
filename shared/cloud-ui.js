(function () {
  'use strict';

  const embedded = document.querySelector('#cloud-dialog:not(dialog)');
  const panel = embedded || document.createElement('dialog');
  let open = null;

  if (!embedded) {
    const bar = document.createElement('div');
    bar.className = 'cloud-bar';
    open = document.createElement('button');
    open.type = 'button';
    open.id = 'cloud-open';
    open.textContent = 'CONNECTING…';
    bar.append(open);
    document.querySelector('header')?.after(bar);
    panel.id = 'cloud-dialog';
    document.body.append(panel);
  }

  panel.innerHTML = `
    ${embedded ? '' : '<button type="button" id="cloud-close" aria-label="Close cloud records">×</button>'}
    <p class="cloud-kicker">YOUR MOMENTS, KEPT</p>
    <h2>Keep this moment with you.</h2>
    <p id="cloud-message" role="status"></p>
    <button id="cloud-restore" type="button">RESTORE SIGN-IN</button>
    <p id="cloud-origin"></p>
    <p id="cloud-feedback" role="status"></p>
    <form id="cloud-login">
      <label for="cloud-email">Your email</label>
      <input id="cloud-email" type="email" autocomplete="email" required placeholder="you@example.com">
      <label for="cloud-password">Site password</label>
      <input id="cloud-password" type="password" autocomplete="current-password" placeholder="Not your Supabase dashboard password">
      <button type="submit" id="cloud-password-login">SIGN IN WITH PASSWORD</button>
      <button type="button" id="cloud-send-link">USE AN EMAIL LINK</button>
      <p>The first sign-in uses an email link. Once you are in, you can set a site password and skip the email next time.</p>
    </form>
    <section id="cloud-account" hidden>
      <p id="cloud-email-label"></p>
      <div class="cloud-actions">
        <button id="cloud-refresh">REFRESH CLOUD MOMENTS</button>
        <button id="cloud-retry">RETRY PENDING MOMENTS</button>
        <button id="cloud-migrate">UPLOAD OLDER BROWSER MOMENTS</button>
        <button id="cloud-export">EXPORT BACKUP</button>
      </div>
      <p id="cloud-old-count"></p>
      <div id="cloud-list"></div>
      <details>
        <summary>SET A SITE PASSWORD</summary>
        <form id="cloud-set-password">
          <label for="cloud-new-password">New password (at least 10 characters)</label>
          <input id="cloud-new-password" type="password" autocomplete="new-password" minlength="10" required>
          <label for="cloud-confirm-password">Enter it again</label>
          <input id="cloud-confirm-password" type="password" autocomplete="new-password" minlength="10" required>
          <button id="cloud-save-password" type="submit">SAVE SITE PASSWORD</button>
          <p>Your password goes directly to Supabase. It is never written into the site files or your saved moments.</p>
        </form>
      </details>
      <button id="cloud-logout">SIGN OUT ON THIS DEVICE</button>
    </section>
    <button id="cloud-local-export">EXPORT OLDER LOCAL BACKUP</button>
  `;

  const $ = selector => panel.querySelector(selector);
  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function draw() {
    const cloud = AtlasRecords.state();
    if (open) {
      open.textContent = cloud.phase === 'restoring'
        ? 'RESTORING SIGN-IN…'
        : cloud.user
          ? cloud.phase === 'error'
            ? 'CLOUD CONNECTION NEEDS ATTENTION'
            : cloud.pending
              ? cloud.pending + ' WAITING TO SYNC'
              : 'CLOUD MOMENTS · ' + cloud.count
          : 'SIGN IN TO SAVE';
    }
    $('#cloud-message').textContent = cloud.message;
    $('#cloud-origin').textContent = 'Current site: ' + cloud.origin + '. Sign-in is stored separately for each browser and site address.';
    $('#cloud-restore').hidden = !!cloud.user && cloud.phase !== 'error';
    $('#cloud-login').hidden = !!cloud.user || cloud.phase === 'restoring';
    $('#cloud-account').hidden = !cloud.user;
    $('#cloud-email-label').textContent = cloud.user?.email || '';
    $('#cloud-retry').hidden = !cloud.pending;

    let older = [];
    try { older = AtlasRecords.legacy(); } catch {}
    $('#cloud-migrate').hidden = !older.length;
    $('#cloud-old-count').textContent = older.length
      ? older.length + ' older moment(s) are still in this browser. They only move to the cloud if you upload them, and the local originals stay here.'
      : '';
    $('#cloud-local-export').hidden = !older.length;

    const list = $('#cloud-list');
    list.replaceChildren();
    AtlasRecords.read()
      .slice()
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
      .slice(0, 30)
      .forEach(record => {
        const anchor = document.createElement('a');
        const path = location.pathname.includes('/tutu/') ? 'map.html' : 'tutu/map.html';
        anchor.href = path + '#record=' + encodeURIComponent(record.id);
        anchor.textContent = record.title;
        const date = document.createElement('small');
        date.textContent = new Date(record.recordedAt).toLocaleString('en-US');
        anchor.append(date);
        if (!embedded) anchor.onclick = () => panel.close();
        list.append(anchor);
      });
  }
  async function act(button, action) {
    button.disabled = true;
    $('#cloud-feedback').textContent = '';
    try {
      await action();
    } catch (actionError) {
      $('#cloud-feedback').textContent = /rate.limit|too many|quota/i.test(actionError.message)
        ? 'Sign-in is temporarily unavailable. Please try again later.'
        : actionError.message;
    } finally {
      button.disabled = false;
      draw();
    }
  }
  function show() {
    draw();
    if (embedded) {
      window.dispatchEvent(new CustomEvent('atlas-open-settings'));
    } else {
      panel.showModal();
    }
  }

  if (open) open.onclick = show;
  $('#cloud-close')?.addEventListener('click', () => panel.close());
  $('#cloud-login').onsubmit = event => {
    event.preventDefault();
    if (!$('#cloud-password').value) {
      $('#cloud-feedback').textContent = 'Enter your site password, or use an email link.';
      return;
    }
    act($('#cloud-password-login'), async () => {
      try {
        await AtlasRecords.signInPassword($('#cloud-email').value, $('#cloud-password').value);
        $('#cloud-feedback').textContent = 'Signed in.';
      } finally {
        $('#cloud-password').value = '';
      }
    });
  };
  $('#cloud-send-link').onclick = () => {
    if (!$('#cloud-email').reportValidity()) return;
    act($('#cloud-send-link'), async () => {
      await AtlasRecords.signIn($('#cloud-email').value);
      $('#cloud-feedback').textContent = 'The sign-in email is on its way. Once you are in, you can set a site password.';
    });
  };
  $('#cloud-set-password').onsubmit = event => {
    event.preventDefault();
    if ($('#cloud-new-password').value !== $('#cloud-confirm-password').value) {
      $('#cloud-feedback').textContent = 'The two passwords do not match.';
      return;
    }
    act($('#cloud-save-password'), async () => {
      try {
        await AtlasRecords.setPassword($('#cloud-new-password').value);
        $('#cloud-feedback').textContent = 'Your site password is set. Next time, you can sign in with your email and this password.';
      } finally {
        $('#cloud-new-password').value = '';
        $('#cloud-confirm-password').value = '';
      }
    });
  };
  $('#cloud-restore').onclick = () => act($('#cloud-restore'), async () => {
    await AtlasRecords.restore();
    await AtlasRecords.refresh();
  });
  $('#cloud-refresh').onclick = () => act($('#cloud-refresh'), () => AtlasRecords.refresh());
  $('#cloud-retry').onclick = () => act($('#cloud-retry'), () => AtlasRecords.retry());
  $('#cloud-migrate').onclick = () => act($('#cloud-migrate'), () => AtlasRecords.migrate());
  $('#cloud-logout').onclick = () => act($('#cloud-logout'), () => AtlasRecords.signOut());
  $('#cloud-export').onclick = () => download({
    exportedAt: new Date().toISOString(),
    records: AtlasRecords.read(),
    pending: AtlasRecords.pending()
  }, 'my-moments-backup.json');
  $('#cloud-local-export').onclick = () => {
    try {
      download({ records: AtlasRecords.legacy() }, 'local-moments-backup.json');
    } catch (exportError) {
      $('#cloud-feedback').textContent = exportError.message;
    }
  };

  window.addEventListener('atlas-cloud-state', draw);
  window.AtlasCloudUI = { open: show };
  draw();
})();
