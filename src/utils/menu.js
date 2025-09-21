export const showMainMenu = async (ctx) => {
    await ctx.reply(`Привет! Я Digital-терапевт для бизнеса...`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Начать диагностику', callback_data: 'show_diagnosis_menu' }],
                [
                    { text: 'О компании', callback_data: 'about_company' },
                    { text: 'Блог', callback_data: 'blog' },
                    { text: 'Контакты', callback_data: 'contacts' }
                ]
            ]
        }
    });
};

export const showDiagnosisMenu = async (ctx) => {
    // Логика диагностического меню
};
