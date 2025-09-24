import { supabase } from "../database/db.js";
import { blocks } from "../data/blocks.js";
import { showMainMenu } from "../utils/menu.js";

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
    "Сайт и цифровизация": zeroLevelQuestions,
    "SEO оптимизация": seoQuestions,
    "Мобильные приложения": mobileQuestions,
    "Реклама и трафик": adsAndTrafficQuestions,
    "CRM и продажи": crmAndSalesQuestions,
    "Автоматизация и процессы": automationQuestions,
    "Интернет-магазин": ecommerceQuestions,
    "Финансы": fintechQuestions,
    "Кибербезопасность": cybersecurityQuestions,
    "HR-процессы": hrQuestions,
    "Цифровой маркетинг": marketingQuestions,
    "Новые технологии": newTechQuestions,
};

const sendNextQuestion = async (ctx, nextBlock, nextQuestion, userData) => {
    let replyText = "";
    let buttons = null;

    if (!nextBlock) {
        await ctx.reply("Диагностика завершена. Спасибо за ответы!");
        await ctx.reply("Отчет готов! Чтобы получить его, пожалуйста, обратитесь к менеджеру.");
        
        await supabase
            .from("diagnostics")
            .update({ status: null, current_block: null, current_question: null })
            .eq("user_id", ctx.from.id);

        await showMainMenu(ctx);
        return;
    }

    const nextQuestionData = allQuestions[nextBlock].find(q => q.id === nextQuestion);
    
    // ДОБАВЛЕНО ИСПРАВЛЕНИЕ: Проверка на существование вопроса
    if (!nextQuestionData) {
        console.error(`Ошибка: Вопрос с ID ${nextQuestion} не найден в блоке ${nextBlock}`);
        await ctx.reply("Произошла ошибка в логике вопросов. Пожалуйста, начните заново.");
        return;
    }
    
    replyText = nextQuestionData.text;

    buttons = Object.keys(nextQuestionData.answers || {}).map(key => [{ text: key, callback_data: nextQuestionData.answers[key].id }]);

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

    // ВАЖНО: При старте новой диагностики сбрасываем старые рекомендации
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

const handleAnswer = async (ctx, nextQuestionIdFromButton = null) => {
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

    let nextQuestion = nextQuestionIdFromButton;
    let nextBlock = current_block;
    
    // Инициализируем данные для обновления
    let updatedAnswers = { ...answers };
    let updatedProblemSummary = [...problem_summary];


    if (!nextQuestionIdFromButton) {
        // Мы обрабатываем обычный ответ на вопрос (не нажатие "Продолжить")
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
        const recommendation = answerData.recommendation;
        
        console.log("-----------------------------------------");
        console.log("Текущий вопрос:", current_question);
        console.log("Текущий блок:", current_block);
        console.log("ID ответа:", userAnswerId);
        console.log("Значение nextQuestionId:", answerData.next);
        console.log("Наличие рекомендации:", !!recommendation);
        console.log("-----------------------------------------");

        // 1. Обновление ответов
        updatedAnswers = { ...answers };
        updatedAnswers[current_block] = {
            ...updatedAnswers[current_block],
            [current_question]: answerKey, // Сохраняем текстовое значение ответа
        };

        // 2. Обновление рекомендаций
        updatedProblemSummary = [...problem_summary];
        if (recommendation) {
            updatedProblemSummary.push(recommendation);
            
            // Если есть рекомендация, мы показываем ее и кнопку "Продолжить"
            const buttons = [
                [{ text: 'Оставить заявку', url: 'https://t.me/Quantumdevelop' }],
                [{ text: 'Вернуться в начало', callback_data: 'show_main_menu' }],
            ];

            // Если есть next, добавляем кнопку "Продолжить"
            if (answerData.next) {
                buttons.push([{ text: 'Продолжить', callback_data: `continue_dialog_${answerData.next}` }]);
            }
            
            await ctx.reply(recommendation.text, {
                reply_markup: {
                    inline_keyboard: buttons,
                },
            });
            
            // Сохраняем состояние после ответа и рекомендации
            const { error: updateError } = await supabase
                .from("diagnostics")
                .update({
                    answers: updatedAnswers,
                    problem_summary: updatedProblemSummary,
                })
                .eq("user_id", ctx.from.id);
            
            if (updateError) {
                console.error("Ошибка при обновлении данных:", updateError);
            }
            return; // Завершаем функцию, так как ждем нажатия "Продолжить"
        }
        
        // 3. Если рекомендации нет, определяем следующий вопрос/блок
        nextQuestion = answerData.next;
        if (nextQuestion === null && status === "full_diagnosis") {
            nextBlock = blocks[blocks.indexOf(current_block) + 1];
            
            if (nextBlock) {
                 // Берем ID первого вопроса из следующего блока
                 nextQuestion = allQuestions[nextBlock]?.[0]?.id; 
                 // ИСПРАВЛЕНИЕ: Добавлена проверка на наличие вопроса
                 if (!nextQuestion) {
                    console.error(`Ошибка: В блоке ${nextBlock} нет вопросов.`);
                    nextBlock = null; // Завершаем диагностику, если блок пуст
                 }
            } else {
                 nextQuestion = null; // Диагностика полностью завершена
            }
        }
    } else {
        // Мы обрабатываем нажатие кнопки "Продолжить"
        // Нам не нужно обновлять answers и problem_summary, они уже были обновлены
        // после получения рекомендации.
    }


    // Если nextQuestion === null (конец модуля/диагностики), то здесь отправляем финальный отчет.
    if (!nextQuestion) {
        if (status === "block_diagnosis") {
            // В режиме по блокам, отчет показывается сразу, и используется updatedProblemSummary
            // Но чтобы получить актуальный problem_summary (если это был ответ без рекомендации),
            // нужно получить его из базы данных
            
            // Выполняем сохранение ответов, если это был ответ без рекомендации
            if (!nextQuestionIdFromButton) {
                const { error: updateError } = await supabase
                    .from("diagnostics")
                    .update({
                        answers: updatedAnswers,
                        problem_summary: updatedProblemSummary,
                    })
                    .eq("user_id", ctx.from.id);

                if (updateError) {
                    console.error("Ошибка при обновлении данных:", updateError);
                }
            }
            
            let reportText = "✅ **Диагностика модуля завершена.**\n\n";
            
            // Поскольку мы завершаем диагностику, берем финальные данные из текущего объекта userData
            // (или обновленного, если ответ был без рекомендации)
            const finalProblemSummary = nextQuestionIdFromButton ? problem_summary : updatedProblemSummary;

            if (finalProblemSummary.length > 0) {
                reportText += "Мы выявили несколько ключевых проблем:\n";
                finalProblemSummary.forEach((problem) => {
                    reportText += `\n**${problem.title}**\n${problem.text}\n`;
                });
            } else {
                reportText += "Поздравляем! Мы не выявили критических проблем в этом разделе.";
            }

            await ctx.reply(reportText, { parse_mode: "Markdown" });

            const buttons = [
                [{ text: 'Оставить заявку', url: 'https://t.me/Quantumdevelop' }],
                [{ text: 'Вернуться в начало', callback_data: 'show_main_menu' }],
            ];
            await ctx.reply("Спасибо за ответы! Вы можете продолжить диагностику или оставить заявку.", {
                reply_markup: {
                    inline_keyboard: buttons,
                },
            });
            
            await supabase
                .from("diagnostics")
                .update({ status: null, current_block: null, current_question: null })
                .eq("user_id", ctx.from.id);

            return;
        } else {
            // Режим full_diagnosis завершен
            
            // Выполняем сохранение ответов, если это был ответ без рекомендации
            if (!nextQuestionIdFromButton) {
                const { error: updateError } = await supabase
                    .from("diagnostics")
                    .update({
                        answers: updatedAnswers,
                        problem_summary: updatedProblemSummary,
                    })
                    .eq("user_id", ctx.from.id);

                if (updateError) {
                    console.error("Ошибка при обновлении данных:", updateError);
                }
            }

            await ctx.reply("Диагностика завершена. Спасибо за ответы!");
            await ctx.reply("Отчет готов! Чтобы получить его, пожалуйста, обратитесь к менеджеру.");

            await supabase
                .from("diagnostics")
                .update({ status: null, current_block: null, current_question: null })
                .eq("user_id", ctx.from.id);

            await showMainMenu(ctx);
            return;
        }
    }

    // Если есть следующий вопрос, переходим к нему
    // Если это был ответ без рекомендации, updatedAnswers уже содержит нужный ответ.
    // Если это было нажатие "Продолжить", updatedAnswers будет старым, но в базе уже есть нужные данные.
    // Передаем то, что было обновлено.
    const finalUserData = {
        answers: updatedAnswers,
        problem_summary: updatedProblemSummary,
    };
    
    await sendNextQuestion(ctx, nextBlock, nextQuestion, finalUserData);
};

export { startDialog, handleAnswer };
