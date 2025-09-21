const handleBlog = async (ctx) => {
    await ctx.reply(
        `Подписывайся на наши медиа, чтобы получать полезные статьи и кейсы по цифровизации бизнеса. Выбирай, где тебе удобнее читать:`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Блог на сайте', url: 'https://quantum-dev.ru/blog' }],
                    [{ text: 'Канал в Telegram', url: 'https://t.me/quantumdev1' }],
                    [{ text: 'Вернуться в начало', callback_data: 'show_main_menu' }], // <-- Добавлено
                ],
            },
        }
    );
};

export { handleBlog };
