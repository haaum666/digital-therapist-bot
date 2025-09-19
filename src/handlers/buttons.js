// src/handlers/buttons.js
import { supabase } from "../database/db.js";
import { blocks } from "../data/blocks.js";
import { startDialog } from "./dialog.js";

const handleButtonPress = async (ctx) => {
  const buttonData = ctx.callbackQuery.data;

  // Если нажата кнопка "Полная диагностика"
  if (buttonData === "full_diagnosis") {
    await ctx.reply("Это будет полная диагностика. Отвечай на вопросы по очереди.");
    await startDialog(ctx, "full_diagnosis");
  } 
  // Если нажата кнопка "Проверка по блокам"
  else if (buttonData === "block_diagnosis") {
    // Здесь мы создаем кнопки для каждого блока, используя массив blocks из нашего файла данных
    const blockButtons = blocks.map((block) => ({
      text: block,
      callback_data: `block_${block}`,
    }));
    await ctx.reply("Выберите блок для диагностики:", {
      reply_markup: {
        inline_keyboard: [blockButtons.slice(0, 2), blockButtons.slice(2, 4), blockButtons.slice(4, 6), blockButtons.slice(6, 8), blockButtons.slice(8, 10), blockButtons.slice(10)],
      },
    });
  } 
  // Если нажата кнопка с названием блока
  else if (buttonData.startsWith("block_")) {
      const blockName = buttonData.substring(6);
      await startDialog(ctx, "block_diagnosis", blockName);
  }
};

export { handleButtonPress };
