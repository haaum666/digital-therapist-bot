const handleContacts = async (ctx) => {
    await ctx.reply(
        `Если ты хочешь получить консультацию или у тебя есть вопросы, мы всегда на связи. Выбери, где тебе удобнее:`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Telegram', url: 'https://t.me/Quantumdevelop' }],
                    [{ text: 'WhatsApp', url: 'https://wa.me/79994512356' }],
                    [{ text: 'Вернуться в начало', callback_data: 'show_main_menu' }], // <-- Добавлено
                ],
            },
        }
    );
};

export { handleContacts };
