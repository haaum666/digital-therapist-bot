// src/handlers/dialog.js
import { supabase } from "../database/db.js";
import { blocks } from "../data/blocks.js";
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import Report from '../Report.js';

// Импортируем вопросы из всех 12 файлов
import { zeroLevelQuestions } from "../data/Нулевой_уровень_и_веб-присутствие.js";
import { seoQuestions } from "../data/SEO_и_органический_поиск.js";
import { mobileQuestions } from "../data/Мобильные_приложения.js";
import { adsAndTrafficQuestions } from "../data/Реклама_и_трафик.js";
import { crmAndSalesQuestions } from "../data/CRM_и_продажи.js";
import { automationQuestions } from "../data/Автоматизация_и_процессы.js";
import { ecommerceQuestions } from "../data/E-commerce.js";
import { fintechQuestions } from "../data/Финансы_и_финтех.js";
import { cybersecurityQuestions } from "../data/Кибербезопасность.js";
import { hrQuestions } from "../data/HR_и_внутренняя_инфраструктура.js";
import { marketingQuestions } from "../data/Коммуникации_и_маркетинг.js";
import { newTechQuestions } from "../data/Новые_технологии.js";

// Объединяем все вопросы в один объект для удобного доступа
const allQuestions = {
  "Нулевой уровень и веб-присутствие": zeroLevelQuestions,
  "SEO и органический поиск": seoQuestions,
  "Мобильные приложения": mobileQuestions,
  "Реклама и трафик": adsAndTrafficQuestions,
  "CRM и продажи": crmAndSalesQuestions,
  "Автоматизация и процессы": automationQuestions,
  "E-commerce": ecommerceQuestions,
  "Финансы и финтех": fintechQuestions,
  "Кибербезопасность": cybersecurityQuestions,
  "HR и внутренняя инфраструктура": hrQuestions,
  "Коммуникации и маркетинг": marketingQuestions,
  "Новые технологии": newTechQuestions,
};

// Функция для генерации HTML-отчета
const generateReportHtml = (userData) => {
  const componentHtml = renderToStaticMarkup(React.createElement(Report, { userData }));
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Отчет по диагностике бизнеса</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333; padding: 20px; line-height: 1.6; }
          .report-container { background-color: #fff; max-width: 800px; margin: 40px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
          .report-title { color: #4CAF50; text-align: center; font-size: 28px; margin-bottom: 20px; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
          .report-intro, .report-outro { font-size: 16px; margin-bottom: 20px; text-align: justify; }
          .priority-section { margin-bottom: 30px; padding-left: 15px; border-left: 4px solid #ddd; }
          .priority-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
          .priority-title.самый-высокий-приоритет { color: #D32F2F; border-bottom: 2px solid #D32F2F; padding-bottom: 5px; }
          .priority-title.высокий-приоритет { color: #FF5722; border-bottom: 2px solid #FF5722; padding-bottom: 5px; }
          .priority-title.средний-приоритет { color: #FFC107; border-bottom: 2px solid #FFC107; padding-bottom: 5px; }
          .priority-title.низкий-приоритет { color: #03A9F4; border-bottom: 2px solid #03A9F4; padding-bottom: 5px; }
          .priority-title.отсутствует-приоритет { color: #8BC34A; border-bottom: 2px solid #8BC34A; padding-bottom: 5px; }
          .problem-item { background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
          .problem-title { font-size: 16px; font-weight: bold; color: #555; margin-top: 0; margin-bottom: 5px; }
          .problem-description { font-size: 14px; color: #666; margin-bottom: 0; }
          .cta-button { text-align: center; margin-top: 30px; }
          .cta-button a { background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 18px; transition: background-color 0.3s ease; }
          .cta-button a:hover { background-color: #45a049; }
        </style>
    </head>
    <body>
        ${componentHtml}
    </body>
    </html>
  `;
};

const startDialog = async (ctx, type) => {
  const user = await supabase
    .from("diagnostics")
    .select("*")
    .eq("user_id", ctx.from.id)
    .single();

  if (!user.data) {
    const { data, error } = await supabase.from("diagnostics").insert([
      {
        user_id: ctx.from.id,
        username: ctx.from.username,
        answers: {},
        problem_summary: [],
        final_report_sent: false,
      },
    ]);

    if (error) {
      console.error("Ошибка при создании записи:", error);
      return;
    }
  }

  // Обновляем статус пользователя, чтобы знать, что он проходит полную диагностику
  const { error: updateError } = await supabase
    .from("diagnostics")
    .update({ status: "full_diagnosis", current_block: blocks[0], current_question: allQuestions[blocks[0]][0].id })
    .eq("user_id", ctx.from.id);
  
  if (updateError) {
    console.error("Ошибка при обновлении статуса:", updateError);
  }

  const firstQuestion = allQuestions[blocks[0]][0];
  await ctx.reply(firstQuestion.text);
};

const handleAnswer = async (ctx) => {
  const userAnswer = ctx.message.text;

  // Получаем текущие данные пользователя из базы
  const { data: userData, error: fetchError } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("user_id", ctx.from.id)
    .single();

  if (fetchError || !userData) {
    console.error("Ошибка при получении данных пользователя:", fetchError);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте начать заново.");
    return;
  }

  const { status, current_block, current_question, answers, problem_summary } = userData;

  if (status !== 'full_diagnosis') {
      // Если пользователь не в режиме полной диагностики, ничего не делаем
      return;
  }

  const currentBlockQuestions = allQuestions[current_block];
  const currentQuestionIndex = currentBlockQuestions.findIndex(q => q.id === current_question);
  const currentQuestionData = currentBlockQuestions[currentQuestionIndex];
  
  // Проверяем, есть ли такой ответ
  const nextQuestionId = currentQuestionData.answers[userAnswer]?.next;
  const recommendation = currentQuestionData.answers[userAnswer]?.recommendation;
  
  // Добавляем ответ пользователя
  const updatedAnswers = { ...answers };
  updatedAnswers[current_block] = { ...updatedAnswers[current_block], [current_question]: userAnswer };
  
  // Добавляем рекомендацию, если она есть
  const updatedProblemSummary = [...problem_summary];
  if (recommendation) {
      updatedProblemSummary.push(recommendation);
  }

  let nextBlock = current_block;
  let nextQuestion = nextQuestionId;
  let replyText = '';

  // Если ответа нет, переходим к следующему вопросу по порядку
  if (nextQuestionId === undefined) {
      nextQuestion = currentBlockQuestions[currentQuestionIndex + 1]?.id;
  }
  
  // Если следующего вопроса в блоке нет, переходим к следующему блоку
  if (nextQuestion === null) {
      const currentBlockIndex = blocks.indexOf(current_block);
      nextBlock = blocks[currentBlockIndex + 1];
      
      // Если это последний блок, завершаем диагностику
      if (!nextBlock) {
          await ctx.reply("Диагностика завершена. Спасибо за ответы!");
          
          const reportHtml = generateReportHtml(userData);
          await ctx.replyWithDocument({
            source: Buffer.from(reportHtml),
            filename: `Отчет_${userData.username}.html`
          });
          
          // Сбрасываем статус
          await supabase.from("diagnostics").update({ status: null, current_block: null, current_question: null }).eq("user_id", ctx.from.id);
          return;
      }
      
      nextQuestion = allQuestions[nextBlock]?.[0]?.id;
      replyText = allQuestions[nextBlock]?.[0]?.text;
      
  } else {
      replyText = currentBlockQuestions.find(q => q.id === nextQuestion).text;
  }
  
  // Обновляем базу данных
  const { error: updateError } = await supabase
      .from("diagnostics")
      .update({
          answers: updatedAnswers,
          problem_summary: updatedProblemSummary,
          current_block: nextBlock,
          current_question: nextQuestion
      })
      .eq("user_id", ctx.from.id);
      
  if (updateError) {
      console.error("Ошибка при обновлении данных:", updateError);
      return;
  }
  
  await ctx.reply(replyText);
};

export { startDialog, handleAnswer };
