import { createClient } from '@supabase/supabase-js'

// Создаем клиента Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Добавляем запись о диагностике
export const addDiagnosis = async (user_id, username) => {
  const { data, error } = await supabase
    .from('diagnostics')
    .insert([{ user_id: user_id, username: username }])

  if (error) {
    console.error('Ошибка при добавлении записи:', error)
  }
}

// Получаем все записи для конкретного пользователя
export const getDiagnosis = async (user_id) => {
  const { data, error } = await supabase
    .from('diagnostics')
    .select('*')
    .eq('user_id', user_id)
    .single()

  if (error) {
    console.error('Ошибка при получении записи:', error)
  }
  return data
}
