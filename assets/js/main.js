(() => {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  // Шапка: фон при прокрутке
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Мобильное меню
  const closeMenu = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // Подсветка активного пункта меню
  const links = [...nav.querySelectorAll('.nav__link')];
  const sections = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navObserver.observe(s));

  // Появление блоков при прокрутке
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // Счётчики
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      countObserver.unobserve(el);
      if (reduced) { el.textContent = target; return; }
      const start = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

  // Карусель отзывов
  const track = document.getElementById('reviewsTrack');
  document.querySelectorAll('.round-btn[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = track.querySelector('.review');
      const step = card ? card.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  // Форма: заявка уходит в WhatsApp клиники (на сайте нет серверной части)
  const form = document.getElementById('form');
  const note = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    ['name', 'phone'].forEach((name) => {
      const input = form.elements[name];
      const ok = input.value.trim().length >= (name === 'phone' ? 6 : 2);
      input.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      note.textContent = 'Пожалуйста, укажите имя и телефон.';
      note.classList.remove('is-ok');
      return;
    }
    const text = [
      'Здравствуйте! Хочу записаться на приём.',
      'Имя: ' + form.elements.name.value.trim(),
      'Телефон: ' + form.elements.phone.value.trim(),
      form.elements.msg.value.trim() ? 'Вопрос: ' + form.elements.msg.value.trim() : '',
    ].filter(Boolean).join('\n');
    const url = 'https://wa.me/79518032229?text=' + encodeURIComponent(text);
    const win = window.open(url, '_blank');
    note.classList.add('is-ok');
    if (win) {
      note.textContent = 'Открываем WhatsApp — осталось нажать «Отправить».';
      return;
    }
    // Окно заблокировано — даём обычную ссылку
    note.textContent = 'Заявка готова: ';
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'открыть WhatsApp и отправить →';
    link.style.textDecoration = 'underline';
    note.append(link);
  });
})();
