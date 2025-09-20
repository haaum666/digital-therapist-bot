// src/handlers/contacts.js
const handleContacts = async (ctx) => {
    await ctx.reply(
        `Свяжитесь с нами:
Телефон: +7 (900) 000-00-00
Email: contact@quantumdev.ru
Сайт: quantumdev.ru`
    );
};

export { handleContacts };
