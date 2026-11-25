/* Static Vercel site: no API key, build step, or visitor email app required.
 * Configure the verified receiving form in index.html; see FORM_SETUP.md.
 * Personal information stays in the POST body, never URLs, storage, or logs.
 */
(function () {
  'use strict';

  const form = document.getElementById('joinForm');
  const modal = document.getElementById('joinModal');
  const status = document.getElementById('joinStatus');
  const button = form.querySelector('[type="submit"]');
  const buttonLabel = button.textContent;
  let pending = false;
  let returnFocus;

  function message(state, text) {
    status.dataset.state = state;
    status.textContent = text;
    status.hidden = false;
    if (state !== 'pending' && modal.classList.contains('on')) status.focus();
  }

  window.openJoin = function () {
    returnFocus = document.activeElement;
    modal.classList.add('on');
    modal.querySelector('.jm-x').focus();
  };
  window.closeJoin = function () {
    modal.classList.remove('on');
    if (returnFocus) returnFocus.focus();
  };
  modal.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') window.closeJoin();
    if (event.key !== 'Tab') return;
    const items = Array.from(modal.querySelectorAll('button, input, a[href]'))
      .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === status)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === status)) {
      event.preventDefault(); first.focus();
    }
  });
  form.addEventListener('input', function () { if (!pending) status.hidden = true; });

  window.submitJoin = async function (event) {
    event.preventDefault();
    if (pending) return;
    const names = ['fullName', 'phone', 'email', 'location'];
    for (const name of names) form.elements[name].value = form.elements[name].value.trim();
    if (!form.reportValidity()) return;
    const roles = Array.from(form.querySelectorAll('input[name="role"]:checked'), input => input.value);
    if (!roles.length) {
      message('error', 'Vui lòng chọn ít nhất một vị trí mong muốn. / Please select at least one preferred role.');
      form.querySelector('input[name="role"]').focus();
      return;
    }
    const formId = form.dataset.formspreeId;
    if (!/^[a-zA-Z0-9]{8,32}$/.test(formId || '')) {
      message('error', 'Biểu mẫu đang được thiết lập. Vui lòng liên hệ lophocbiencuong@gmail.com. / Registration is being set up. Please contact lophocbiencuong@gmail.com.');
      return;
    }
    if (form.elements._gotcha.value) {
      message('error', 'Không thể gửi biểu mẫu. Vui lòng liên hệ email bên dưới. / Unable to submit. Please contact us by email below.');
      return;
    }

    // Explicit allowlist: preserve all existing registration fields and selections.
    const data = new FormData();
    for (const name of names) data.set(name, form.elements[name].value);
    data.set('role', roles.join(', '));
    data.set('format', form.elements.format.value);
    data.set('consent', 'Có / Yes');
    data.set('_gotcha', '');
    data.set('_subject', 'Đăng ký đồng hành cùng Lớp học biên cương');

    pending = true;
    const controls = Array.from(form.elements, element => [element, element.disabled]);
    for (const [element] of controls) element.disabled = true;
    form.setAttribute('aria-busy', 'true');
    button.textContent = 'Đang gửi… · Sending…';
    message('pending', 'Đang gửi thông tin, vui lòng chờ. / Sending your details, please wait.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://formspree.io/f/' + formId, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'error',
        referrerPolicy: 'strict-origin-when-cross-origin'
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result && result.ok === true && !result.errors) {
        form.reset();
        message('success', 'Đã tiếp nhận đăng ký. Cảm ơn bạn đã quan tâm đồng hành cùng Lớp học biên cương! / Your registration has been received. Thank you for your interest in Border Classroom!');
      } else if (response.status === 429) {
        message('error', 'Hiện chưa thể tiếp nhận thêm đăng ký. Vui lòng thử lại sau hoặc liên hệ email bên dưới. / Registration is temporarily unavailable. Please try later or contact us by email below.');
      } else if (response.status === 400 || response.status === 422) {
        message('error', 'Chưa gửi được đăng ký. Vui lòng kiểm tra thông tin; nếu vẫn gặp lỗi, hãy liên hệ email bên dưới. / Registration was not sent. Please check your details; if the problem persists, contact us by email below.');
      } else if (!response.ok) {
        message('error', 'Dịch vụ tiếp nhận đang gặp lỗi. Thông tin đã điền được giữ lại; vui lòng thử lại sau hoặc liên hệ email bên dưới. / The registration service is unavailable. Your entries are kept; please try later or contact us by email below.');
      } else {
        // HTML, CAPTCHA and unexpected JSON are never treated as confirmation.
        message('error', 'Chưa xác nhận được đăng ký. Vui lòng liên hệ email bên dưới trước khi gửi lại. / Registration could not be confirmed. Please contact us by email below before submitting again.');
      }
    } catch (_) {
      // A network error/timeout can happen after receipt: do not retry automatically.
      message('error', 'Chưa xác nhận được đăng ký do lỗi kết nối hoặc hết thời gian chờ. Thông tin đã điền được giữ lại. Vui lòng liên hệ email bên dưới để kiểm tra trước khi gửi lại. / A connection error or timeout prevented confirmation. Your entries are kept. Please contact us by email below before submitting again.');
    } finally {
      clearTimeout(timer);
      for (const [element, disabled] of controls) element.disabled = disabled;
      form.removeAttribute('aria-busy');
      button.textContent = buttonLabel;
      pending = false;
    }
  };
  button.disabled = false;
})();
