export class LanguageHelper {
  static getTitleGenerationPrompt(languageCode: string): string {
    switch (languageCode) {
      case 'es': return 'Genera un título corto (máximo 6 palabras) en español que resuma el mensaje del usuario. No uses comillas, emojis ni puntuación final.';
      case 'en': return 'Generate a short title (maximum 6 words) in English that summarizes the user message. Do not use quotes, emojis or final punctuation.';
      case 'fr': return 'Génère un titre court (maximum 6 mots) en français qui résume le message de l\'utilisateur. N\'utilise pas de guillemets, d\'emojis ou de ponctuation finale.';
      case 'pt': return 'Gere um título curto (máximo 6 palavras) em português que resuma a mensagem do usuário. Não use aspas, emojis ou pontuação final.';
      case 'it': return 'Genera un titolo breve (massimo 6 parole) in italiano che riassuma il messaggio dell\'utente. Non usare virgolette, emoji o punteggiatura finale.';
      case 'de': return 'Generiere einen kurzen Titel (maximal 6 Wörter) auf Deutsch, der die Benutzernachricht zusammenfasst. Verwende keine Anführungszeichen, Emojis oder Endpunktuation.';
      case 'zh': return '生成一个简短的中文标题（最多6个词）来总结用户消息。不要使用引号、表情符号或结尾标点符号。';
      case 'ja': return 'ユーザーメッセージを要約する短いタイトル（最大6語）を日本語で生成してください。引用符、絵文字、句読点は使用しないでください。';
      case 'ru': return 'Сгенерируйте короткий заголовок (максимум 6 слов) на русском языке, который резюмирует сообщение пользователя. Не используйте кавычки, эмодзи или знаки препинания в конце.';
      case 'ko': return '사용자 메시지를 요약하는 짧은 제목(최대 6단어)을 한국어로 생성하세요. 따옴표, 이모지, 마침표는 사용하지 마세요.';
      case 'ar': return 'أنشئ عنواناً مختصراً (أقصاه 6 كلمات) باللغة العربية يلخص رسالة المستخدم. لا تستخدم علامات التنصيص أو الرموز التعبيرية أو علامات الترقيم النهائية.';
      case 'hi': return 'उपयोगकर्ता संदेश को सारांशित करने वाला एक छोटा शीर्षक (अधिकतम 6 शब्द) हिंदी में उत्पन्न करें। उद्धरण चिह्न, इमोजी या अंतिम विराम चिह्न का उपयोग न करें।';
      default: return 'Genera un título corto (máximo 6 palabras) en español que resuma el mensaje del usuario. No uses comillas, emojis ni puntuación final.';
    }
  }

  static getLanguageInstructions(languageCode: string): string {
    switch (languageCode) {
      case 'es': return 'IMPORTANTE: Debes responder SIEMPRE en español. Todas tus respuestas deben estar en español, sin excepción. No uses inglés ni otros idiomas.';
      case 'en': return 'IMPORTANT: You must ALWAYS respond in English. All your responses must be in English, without exception. Do not use Spanish or other languages.';
      case 'fr': return 'IMPORTANT: Tu dois TOUJOURS répondre en français. Toutes tes réponses doivent être en français, sans exception.';
      case 'pt': return 'IMPORTANTE: Você deve SEMPRE responder em português. Todas as suas respostas devem estar em português, sem exceção.';
      case 'it': return 'IMPORTANTE: Devi SEMPRE rispondere in italiano. Tutte le tue risposte devono essere in italiano, senza eccezioni.';
      case 'de': return 'WICHTIG: Du musst IMMER auf Deutsch antworten. Alle deine Antworten müssen auf Deutsch sein, ohne Ausnahme.';
      case 'zh': return '重要：你必须始终用中文回答。你的所有回答都必须是中文，没有例外。';
      case 'ja': return '重要：必ず日本語で回答してください。すべての回答は日本語である必要があり、例外はありません。';
      case 'ru': return 'ВАЖНО: Вы должны ВСЕГДА отвечать на русском языке. Все ваши ответы должны быть на русском языке, без исключений.';
      case 'ko': return '중요: 항상 한국어로 응답해야 합니다. 모든 응답은 한국어여야 하며 예외는 없습니다.';
      case 'ar': return 'مهم: يجب عليك الإجابة دائماً باللغة العربية. جميع إجاباتك يجب أن تكون باللغة العربية، بدون استثناء.';
      case 'hi': return 'महत्वपूर्ण: आपको हमेशा हिंदी में उत्तर देना चाहिए। आपके सभी उत्तर हिंदी में होने चाहिए, कोई अपवाद नहीं।';
      default: return 'IMPORTANTE: Debes responder SIEMPRE en español. Todas tus respuestas deben estar en español, sin excepción. No uses inglés ni otros idiomas.';
    }
  }
}
