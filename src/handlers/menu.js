import { startDialog } from "./dialog.js";
import { showMainMenu, showDiagnosisMenu } from "../utils/menu.js";

// Главное меню
const handleShowMainMenu = async (ctx) => {
  await showMainMenu(ctx);
};

// Меню выбора типа диагностики
const handleShowDiagnosisMenu = async (ctx) => {
  await showDiagnosisMenu(ctx);
};

export { handleShowMainMenu as showMainMenu, handleShowDiagnosisMenu as showDiagnosisMenu, startDialog };
