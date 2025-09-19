// src/handlers/dialog.js
import { supabase } from "../database/db.js";

const startDialog = async (ctx, type) => {
  // Проверяем, существует ли запись для этого пользователя
  const user = await supabase.from("diagnostics").select("*").eq("user_id", ctx.from.id).single();

  if (!user.data) {
    // Если записи нет, создаем новую
    const { data, error } = await supabase.from("diagnostics").insert([
      {
        user_id: ctx.from.id,
        username: ctx.from.username,
        answers: {},
        problem_summary: {},
        final_report_sent: false,
      },
    ]);

    if (error) {
      console.error("Ошибка при создании записи:", error);
      return;
    }
  }

  // Отправляем первое сообщение
  await ctx.reply("Это будет полная диагностика. Отвечай на вопросы по очереди.");
};

const handleAnswer = async (ctx) => {
  // Пока эта функция просто получает ответ пользователя
  const userAnswer = ctx.message.text;
  await ctx.reply(`Твой ответ: "${userAnswer}"`);
};

export { startDialog, handleAnswer };
