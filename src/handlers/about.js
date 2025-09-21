import { InlineKeyboard } from "grammy";

const handleAbout = async (ctx) => {
    const inlineKeyboard = new InlineKeyboard()
        .url('Наш сайт', 'https://quantum-dev.ru/')
        .row()
        .text('Вернуться в начало', 'show_main_menu');

    await ctx.reply(
        `Привет! За диагностикой стоим мы, команда Quantum. Мы создаём современные сайты, мобильные приложения, внедряем CRM-системы и автоматизируем процессы. Наша миссия - находить и устранять цифровые барьеры, которые мешают бизнесу расти, и создавать эффективные цифровые решения, которые работают на результат.`, {
            reply_markup: inlineKeyboard,
        }
    );
};

export { handleAbout };
