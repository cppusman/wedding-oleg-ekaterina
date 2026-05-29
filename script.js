// 1. ТАЙМЕР
function startCountdown() {
  const weddingDate = new Date("July 31, 2026 11:00:00").getTime();
  
  setInterval(() => {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
    document.getElementById("hours").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById("minutes").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById("seconds").innerText = Math.floor((distance % (1000 * 60)) / 1000);
  }, 1000);
}

// 2. АНИМАЦИЯ ПОЯВЛЕНИЯ
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-section').forEach(section => {
  observer.observe(section);
});

// Запуск таймера при загрузке
startCountdown();

// ЛОГИКА ДИНАМИЧЕСКИХ ПОЛЕЙ АНКЕТЫ (Приду / Не приду)
const attendanceToggles = document.querySelectorAll('.attendance-toggle');
const extraFields = document.getElementById('extra-fields');

if (attendanceToggles.length > 0 && extraFields) {
  attendanceToggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      if (this.value === 'Я приду') {
        // Показываем блок сообщения и алкоголя
        extraFields.classList.remove('hidden');
        
        // Делаем выбор алкоголя обязательным
        const alcoholInputs = extraFields.querySelectorAll('input[type="radio"]');
        if (alcoholInputs.length > 0) {
          alcoholInputs[0].setAttribute('required', 'required');
        }
      } else {
        // Прячем блок
        extraFields.classList.add('hidden');
        
        // Сбрасываем обязательность и выбор
        const alcoholInputs = extraFields.querySelectorAll('input[type="radio"]');
        alcoholInputs.forEach(input => {
          input.removeAttribute('required');
          input.checked = false; 
        });
        const textarea = extraFields.querySelector('textarea');
        if (textarea) textarea.value = ''; 
      }
    });
  });
}

// ОТПРАВКА ФОРМЫ В TELEGRAM (прямая)
const weddingForm = document.querySelector('form');
const rsvpContainer = document.querySelector('.rsvp-panel');

if (weddingForm && rsvpContainer) {
  weddingForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const submitBtn = weddingForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    const formData = new FormData(weddingForm);
    const guestName = formData.get('Имя_гостя') || 'Не указано';
    const attendance = formData.get('Присутствие') || 'Не указано';
    const message = formData.get('Сообщение') || 'Нет сообщения';
    const alcohol = formData.get('Алкоголь') || 'Не выбран';

    const text = `🎉 *Новая анкета!*
👤 *Имя:* ${guestName}
📅 *Присутствие:* ${attendance}
💬 *Сообщение:* ${message}
🍷 *Алкоголь:* ${alcohol}`;

    const BOT_TOKEN = '8962443036:AAHn9ZY2KRuvqomf-37ExTwlZ2-KFXUPryA';
    const CHAT_ID = '-1003926368528';

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        rsvpContainer.innerHTML = `
          <div class="text-center py-8 animate-fade-in">
            <h4 class="heading-font text-2xl md:text-5xl text-[#7b866f]">СПАСИБО!</h4>
            <p class="mt-4 text-lg md:text-[2.2rem] decorative-script leading-relaxed text-stone-700">
              Ваш ответ успешно доставлен.<br>
              Олег и Екатерина очень ждут вас!
            </p>
          </div>
        `;
      } else {
        throw new Error('Ошибка Telegram');
      }
    } catch (error) {
      alert('Произошла ошибка. Пожалуйста, проверьте интернет и попробуйте ещё раз.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}