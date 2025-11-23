
import { GoogleGenAI, Type } from "@google/genai";
import { Client } from "../types";

// Safely access API Key
const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Enhanced Caption Generator with "Brand DNA" Context
 */
export const generateCaption = async (
  topic: string, 
  client: Client, // Now requires the full Client object
  extraInstruction?: string
): Promise<string> => {
  
  if (!ai) {
    console.warn("API Key is missing. Returning mock data.");
    return `(Demo) ${topic} é incrível! 🚀 Transforme seus resultados hoje mesmo. #${client.industry.replace(/\s/g, '')}`;
  }

  try {
    // Constructing the "Brand DNA" System Prompt
    const brandContext = `
      PERFIL DA MARCA:
      - Nome: ${client.name}
      - Setor: ${client.industry}
      - O que faz: ${client.description || "Empresa líder no setor."}
      - Público-Alvo: ${client.targetAudience || "Geral"}
      - Tom de Voz: ${client.toneOfVoice || "Profissional e Amigável"}
      - Pilares de Conteúdo: ${client.contentPillars?.join(', ') || "Dicas, Novidades, Bastidores"}
      - O QUE EVITAR: ${client.avoidTerms || "Gírias excessivas, texto longo"}
      - Hashtags Obrigatórias: ${client.customHashtags || ""}
    `;

    const promptText = `
      Atue como um Social Media Manager Sênior especializado em Copywriting Persuasivo e Curto.
      
      CONTEXTO DA MARCA:
      ${brandContext}

      TAREFA:
      Escreva uma legenda para Instagram/LinkedIn sobre o tema: "${topic}".
      ${extraInstruction ? `INSTRUÇÃO EXTRA DE DESIGN/CONCEITO: "${extraInstruction}"` : ''}

      REGRAS OBRIGATÓRIAS (IMPORTANTE):
      1. **SEJA CURTO E DIRETO**: Nada de "encher linguiça". Máximo de 3 parágrafos curtos.
      2. **HOOK INICIAL**: A primeira frase deve prender a atenção imediatamente.
      3. **FORMATAÇÃO**: Use quebra de linhas para facilitar a leitura.
      4. **CTA**: Termine com uma Call to Action clara e simples.
      5. **HASHTAGS**: Use 3 hashtags do nicho + as hashtags obrigatórias da marca (se houver).
      6. **IDIOMA**: Português do Brasil (PT-BR) natural e fluído.

      A resposta deve conter APENAS o texto da legenda.
    `;

    const parts: any[] = [{ text: promptText }];

    // Attach Brandbook if available
    if (client.brandbook) {
        const cleanBase64 = client.brandbook.split(',')[1] || client.brandbook;
        parts.push({
            inlineData: {
                mimeType: 'application/pdf',
                data: cleanBase64
            }
        });
        parts[0].text += `\n\n[REFERÊNCIA VISUAL]: Use o Brandbook PDF anexado para calibrar o tom de voz exato da marca.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        temperature: 0.7, // Slightly lower for more focused/concise output
      }
    });

    return response.text || "Não foi possível gerar a legenda.";
  } catch (error) {
    console.error("Erro ao gerar legenda:", error);
    return `🚀 ${topic}\n\nUma novidade incrível chegando para você! Fique ligado.\n\n#${client.industry} #Novidade`;
  }
};

export const generateCaptionFromImage = async (base64Image: string, context: string): Promise<string> => {
  if (!ai) return "Legenda simulada baseada na imagem. #FotoIncrivel";

  try {
    const base64Data = base64Image.split(',')[1] || base64Image;

    const prompt = `
      Analise esta imagem. Crie uma legenda CURTA e CRIATIVA para Instagram.
      Contexto: "${context}".
      Regra: Máximo 2 frases + 3 hashtags. Sem clichês.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data
            }
          }
        ]
      }
    });

    return response.text || "Não consegui analisar a imagem.";
  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    return `Uma imagem vale mais que mil palavras! 📸\n\n${context}\n\n#InstaGood`;
  }
};

export const analyzeInsights = async (metricsDescription: string): Promise<string> => {
  if (!ai) return "• Foque em posts visuais\n• Publique mais stories";

  try {
    const prompt = `
      Analise estes dados de social media: ${metricsDescription}
      Forneça 2 insights estratégicos e ultra-curtos (max 10 palavras cada).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Sem insights.";
  } catch (error) {
    return "• Aumente a frequência\n• Use vídeos curtos";
  }
};

export const analyzeCompetitorInsights = async (competitorData: {name: string, value: number}[]): Promise<string> => {
  if (!ai) return "Concorrência ativa. Diferencie seu conteúdo visual.";

  try {
    const dataString = competitorData.map(d => `${d.name}: ${d.value}`).join(', ');
    
    const prompt = `
      Dados de Share of Voice: ${dataString}.
      Dê uma dica tática de 1 frase para superar a concorrência.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Análise indisponível.";
  } catch (error) {
    return "Recomendamos aumentar o investimento em tráfego pago.";
  }
};

export interface TopicSuggestion {
  title: string;
  visual_concept: string;
}

export const generatePostTopics = async (client: Client, month: string, count: number, campaignFocus?: string): Promise<TopicSuggestion[]> => {
  const fallbackTopics: TopicSuggestion[] = Array.from({length: count}, (_, i) => ({
      title: `Post sobre ${client.industry} ${i+1}`,
      visual_concept: `Foto de ${client.industry}`
  }));

  if (!ai) return fallbackTopics;

  try {
    // Brand DNA injection into Topic Generation
    const dna = `
      Marca: ${client.name} (${client.industry}).
      Público: ${client.targetAudience || 'Geral'}.
      O que vende/faz: ${client.description || 'Serviços'}.
    `;

    const prompt = `
      Atue como Estrategista de Conteúdo.
      CONTEXTO: ${dna}
      PERÍODO: ${month}.
      ${campaignFocus ? `FOCO DA CAMPANHA: "${campaignFocus}".` : ''}

      Gere ${count} ideias de posts ÚNICOS e NÃO REPETITIVOS.
      Saída JSON estrita: lista de objetos { title, visual_concept }.
      
      Regras:
      - Títulos (headlines) devem ser curtos e chamativos (clickbait saudável).
      - Conceito visual deve ser descritivo para um designer.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              visual_concept: { type: Type.STRING }
            },
            required: ['title', 'visual_concept']
          }
        }
      }
    });

    let topics: TopicSuggestion[] = [];
    try {
        topics = JSON.parse(response.text || "[]");
    } catch (e) {
        topics = fallbackTopics;
    }
    
    if (topics.length < count) {
      while(topics.length < count) topics.push({
          title: `Ideia Extra para ${client.name}`,
          visual_concept: `Imagem lifestyle`
      });
    }
    return topics.slice(0, count);

  } catch (error) {
    console.error("Erro tópicos:", error);
    return fallbackTopics;
  }
};

export const generateSingleTopic = async (clientName: string, industry: string, context: string): Promise<string> => {
    if (!ai) return `Ideia sobre ${industry}`;
    try {
        const prompt = `Gere 1 headline curta e viral para ${clientName} (${industry}). Contexto: ${context}. Apenas texto.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text?.replace(/['"]/g, '').trim() || `Ideia sobre ${industry}`;
    } catch (e) {
        return `Ideia Criativa`;
    }
}
