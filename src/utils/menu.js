// src/utils/menu.js
// Эти функции теперь могут быть импортированы куда угодно, не создавая циклов.

export const showMainMenu = async (ctx) => {
    await ctx.reply(`Привет! Я Digital-терапевт для бизнеса. Моя задача - найти слабые места в цифровой инфраструктуре твоей компании и помочь раскрыть её потенциал. Давай начнём?`, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Начать диагностику', callback_data: 'show_diagnosis_menu' },
                ],
                [
                    { text: 'О компании', callback_data: 'about_company' },
                    { text: 'Блог', callback_data: 'blog' },
                    { text: 'Контакты', callback_data: 'contacts' },
                ],
            ],
        },
    });
};

export const showDiagnosisMenu = async (ctx) => {
    await ctx.reply(`Доступно два режима диагностики: полная - последовательно проходим все блоки за 10–15 минут, и модульная - можно выбрать только один нужный блок, например автоматизацию или маркетинг.`, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📈 Полная диагностика', callback_data: 'start_full_diagnosis' },
                ],
                [
                    { text: '🧩 Модульная диагностика', callback_data: 'start_block_diagnosis' },
                ],
            ],
        },
    });
};
