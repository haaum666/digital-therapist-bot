import { supabase } from "../database/db.js";
import { blocks } from "../data/blocks.js";
import { InputFile } from "grammy";
import { showMainMenu } from "./menu.js";

// Импортируем вопросы из всех 12 файлов, переименованных в латиницу
import { zeroLevelQuestions } from "../data/zero_level_web_presence.js";
import { seoQuestions } from "../data/seo_organic_search.js";
import { mobileQuestions } from "../data/mobile_apps.js";
import { adsAndTrafficQuestions } from "../data/ads_traffic.js";
import { crmAndSalesQuestions } from "../data/crm_sales.js";
import { automationQuestions } from "../data/automation_processes.js";
import { ecommerceQuestions } from "../data/e_commerce.js";
import { fintechQuestions } from "../data/finance_fintech.js";
import { cybersecurityQuestions } from "../data/cybersecurity.js";
import { hrQuestions } from "../data/hr_internal_infra.js";
import { marketingQuestions } from "../data/communications_marketing.js";
import { newTechQuestions } from "../data/new_technologies.js";

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

// Функция для экранирования HTML-символов
const escapeHtml = (unsafe) => {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

// Функция для генерации HTML-отчета
const generateReportHtml = (userData) => {
    // Группируем проблемы по приоритету
    const problemsByPriority = userData.problem_summary.reduce((acc, problem) => {
        const priorityMapping = {
            'Критический провал': 'Высокий приоритет',
            'Проблемная зона': 'Средний приоритет',
            'Упущенная возможность': 'Низкий приоритет',
        };
        const mappedPriority = priorityMapping[problem.priority] || 'Без приоритета';
        if (!acc[mappedPriority]) {
            acc[mappedPriority] = [];
        }
        acc[mappedPriority].push(problem);
        return acc;
    }, {});

    // Определяем порядок приоритетов
    const priorityOrder = ['Высокий приоритет', 'Средний приоритет', 'Низкий приоритет', 'Без приоритета'];

    const sortedProblemSummaryHtml = priorityOrder.map(priority => {
        const problems = problemsByPriority[priority];
        if (!problems || problems.length === 0) {
            return '';
        }

        let priorityClass = '';
        let priorityColor = '';

        switch (priority) {
            case 'Высокий приоритет':
                priorityClass = 'high-priority';
                priorityColor = '#D32F2F'; // Красный
                break;
            case 'Средний приоритет':
                priorityClass = 'medium-priority';
                priorityColor = '#FFC107'; // Оранжевый
                break;
            case 'Низкий приоритет':
                priorityClass = 'low-priority';
                priorityColor = '#03A9F4'; // Синий
                break;
            default:
                priorityClass = 'no-priority';
                priorityColor = '#607D8B'; // Серый
                break;
        }

        const problemItemsHtml = problems.map(
            (problem) => `
            <div class="problem-item">
              <p class="problem-title">${escapeHtml(problem.title)}</p>
              <p class="problem-description">${escapeHtml(problem.text)}</p>
            </div>
          `
        ).join("");

        return `
            <div class="priority-section">
              <h2 class="priority-header ${priorityClass}" style="background-color: ${priorityColor};">${priority}</h2>
              ${problemItemsHtml}
            </div>
        `;
    }).join('');

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
              .header { text-align: center; margin-bottom: 20px; }
              .company-logo { width: 150px; margin-bottom: 10px; }
              .report-title { color: #4CAF50; font-size: 28px; margin-bottom: 20px; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
              .report-intro, .report-outro { font-size: 16px; margin-bottom: 20px; text-align: justify; }
              .priority-section { margin-bottom: 30px; }
              .priority-header {
                  font-size: 18px;
                  font-weight: bold;
                  color: white;
                  padding: 8px 15px;
                  border-radius: 5px;
                  margin-bottom: 15px;
                  display: inline-block;
              }
              .problem-item { background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
              .problem-title { font-size: 16px; font-weight: bold; color: #555; margin-top: 0; margin-bottom: 5px; }
              .problem-description { font-size: 14px; color: #666; margin-bottom: 0; }
              .cta-button { text-align: center; margin-top: 30px; }
              .cta-button a { background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 18px; transition: background-color 0.3s ease; }
              .cta-button a:hover { background-color: #45a049; }
            </style>
          </head>
          <body>
            <div class="report-container">
              <div class="header">
                <img src="https://optim.tildacdn.com/tild3832-6562-4566-a337-653230636534/-/resize/248x/-/format/webp/Quantum_logo.png.webp" alt="Логотип Quantum" class="company-logo">
                <h1 class="report-title">Отчет по диагностике бизнеса</h1>
              </div>
              <div class="report-intro">
                Ваш отчет готов! Ниже представлены основные проблемы и упущенные возможности, выявленные в ходе диагностики.
              </div>
              ${sortedProblemSummaryHtml}
            </div>
          </body>
          </html>
        `;
};

const sendNextQuestion = async (ctx, nextBlock, nextQuestion, userData) => {
    let replyText = "";
    let buttons = null;

    if (!nextBlock) {
        // Если это последний блок, завершаем диагностику
        await ctx.reply("Диагностика завершена. Спасибо за ответы!");

        const reportHtml = generateReportHtml(userData);

        try {
            await ctx.replyWithDocument(new InputFile(Buffer.from(reportHtml), `Отчет_${userData.username}.html`));
        } catch (error) {
            console.error("Ошибка при отправке отчета:", error);
            await ctx.reply("Не удалось сгенерировать отчет. Пожалуйста, попробуйте еще раз.");
        }

        // Сбрасываем статус
        await supabase
            .from("diagnostics")
            .update({ status: null, current_block: null, current_question: null })
            .eq("user_id", ctx.from.id);

        await showMainMenu(ctx);
        return;
    }

    const nextQuestionData = allQuestions[nextBlock].find(q => q.id === nextQuestion);
    replyText = nextQuestionData.text;

    buttons = Object.keys(nextQuestionData.answers || {}).map(key => [{ text: key, callback_data: nextQuestionData.answers[key].id }]);

    // Обновляем базу данных
    const { error: updateError } = await supabase
        .from("diagnostics")
        .update({
            answers: userData.answers,
            problem_summary: userData.problem_summary,
            current_block: nextBlock,
            current_question: nextQuestion,
        })
        .eq("user_id", ctx.from.id);

    if (updateError) {
        console.error("Ошибка при обновлении данных:", updateError);
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте начать заново.");
        return;
    }

    const replyOptions = {};
    if (buttons && buttons.length > 0) {
        replyOptions.reply_markup = { inline_keyboard: buttons };
    }

    await ctx.reply(replyText, replyOptions);
};

const startDialog = async (ctx, diagnosisType, blockName) => {
    let firstBlock = blocks[0];
    let firstQuestionId = allQuestions[firstBlock][0].id;
    let status = "full_diagnosis";

    if (diagnosisType === "block_diagnosis" && blockName) {
        firstBlock = blockName;
        firstQuestionId = allQuestions[firstBlock][0].id;
        status = "block_diagnosis";
    }

    const { data, error } = await supabase
        .from("diagnostics")
        .upsert(
            {
                user_id: ctx.from.id,
                username: ctx.from.username,
                answers: {},
                problem_summary: [],
                final_report_sent: false,
                status: status,
                current_block: firstBlock,
                current_question: firstQuestionId,
            },
            { onConflict: "user_id" }
        );

    if (error) {
        console.error("Ошибка при создании/обновлении записи:", error);
        return;
    }

    const firstQuestion = allQuestions[firstBlock].find(q => q.id === firstQuestionId);
    const buttons = Object.keys(firstQuestion.answers).map(key => [{ text: key, callback_data: firstQuestion.answers[key].id }]);
    await ctx.reply(firstQuestion.text, {
        reply_markup: {
            inline_keyboard: buttons,
        },
    });
};

const handleAnswer = async (ctx) => {
    const userAnswerId = ctx.callbackQuery.data;

    const menuButtonIds = ['show_main_menu', 'show_diagnosis_menu', 'contacts', 'blog', 'about_company', 'start_diagnosis'];

    if (menuButtonIds.includes(userAnswerId)) {
        return;
    }

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

    if (status !== "full_diagnosis" && status !== "block_diagnosis") {
        return;
    }

    const currentBlockQuestions = allQuestions[current_block];
    const currentQuestionData = currentBlockQuestions.find((q) => q.id === current_question);

    const answerKey = Object.keys(currentQuestionData.answers).find(
        key => currentQuestionData.answers[key].id === userAnswerId
    );

    if (!answerKey) {
        console.error("Ответ с таким ID не найден:", userAnswerId);
        return;
    }

    const answerData = currentQuestionData.answers[answerKey];
    const nextQuestionId = answerData.next;
    const recommendation = answerData.recommendation;

    const updatedAnswers = { ...answers };
    updatedAnswers[current_block] = {
        ...updatedAnswers[current_block],
        [current_question]: answerKey,
    };

    const updatedProblemSummary = [...problem_summary];
    if (recommendation) {
        updatedProblemSummary.push(recommendation);
        await ctx.reply(recommendation.text, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Оставить заявку', url: 'https://t.me/Quantumdevelop' }],
                    [{ text: 'Вернуться в начало', callback_data: 'show_main_menu' }],
                ],
            },
        });
    }

    const nextBlock = nextQuestionId === null && status === "full_diagnosis"
        ? blocks[blocks.indexOf(current_block) + 1]
        : current_block;

    const nextQuestion = nextQuestionId === null && status === "full_diagnosis"
        ? allQuestions[nextBlock]?.[0]?.id
        : nextQuestionId;

    const updatedUserData = {
        ...userData,
        answers: updatedAnswers,
        problem_summary: updatedProblemSummary,
    };

    await sendNextQuestion(ctx, nextBlock, nextQuestion, updatedUserData);
};

export { startDialog, handleAnswer };
