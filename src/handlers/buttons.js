// src/handlers/buttons.js
import { startDialog } from "./dialog.js";

const buttonsHandler = async (ctx) => {
  const callbackQuery = ctx.callbackQuery.data;

  // Проверка на нажатие кнопки "Полная диагностика"
  if (callbackQuery === "full_diagnosis") {
    // Начало диалога полной диагностики
    await startDialog(ctx, "full_diagnosis");
  }
};

export default buttonsHandler;
