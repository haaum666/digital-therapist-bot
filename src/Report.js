import React from 'react';

const Report = ({ userData }) => {
  const { problem_summary } = userData;
  
  if (problem_summary.length === 0) {
    return (
      <div className="report-container">
        <h2 className="report-title">Отличная работа!</h2>
        <p className="report-text">Похоже, у твоего бизнеса нет критических цифровых проблем. Это значит, что ты уже на шаг впереди многих конкурентов.</p>
        <p className="report-text">Если хочешь вывести бизнес на новый уровень, мы всегда готовы помочь с масштабированием, автоматизацией и новыми технологиями.</p>
      </div>
    );
  }

  // Группируем проблемы по приоритету
  const groupedProblems = problem_summary.reduce((acc, problem) => {
    const { priority } = problem;
    if (!acc[priority]) {
      acc[priority] = [];
    }
    acc[priority].push(problem);
    return acc;
  }, {});
  
  const priorityOrder = {
    "Самый высокий": 1,
    "Высокий": 2,
    "Средний": 3,
    "Низкий": 4,
    "Отсутствует": 5,
  };
  
  // Сортируем проблемы в порядке приоритета
  const sortedPriorities = Object.keys(groupedProblems).sort(
    (a, b) => priorityOrder[a] - priorityOrder[b]
  );
  
  return (
    <div className="report-container">
      <h2 className="report-title">Результаты диагностики</h2>
      <p className="report-intro">Мы проанализировали твой бизнес и нашли слабые места. Вот список проблем, которые мешают тебе расти. Мы сгруппировали их по степени важности.</p>

      {sortedPriorities.map((priority) => (
        <div key={priority} className="priority-section">
          <h3 className={`priority-title ${priority.replace(/\s/g, '-').toLowerCase()}`}>{priority} приоритет</h3>
          {groupedProblems[priority].map((problem, index) => (
            <div key={index} className="problem-item">
              <h4 className="problem-title">{problem.title}</h4>
              <p className="problem-description">{problem.text}</p>
            </div>
          ))}
        </div>
      ))}

      <p className="report-outro">Хочешь обсудить эти проблемы и узнать, как мы можем помочь? Запишись на бесплатную консультацию с Digital-терапевтом Quantum.</p>
      <div className="cta-button">
        <a href="https://t.me/QuantumDev_ru" target="_blank" rel="noopener noreferrer">Записаться на консультацию</a>
      </div>
    </div>
  );
};

export default Report;
