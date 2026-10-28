/**
 * Servicio de Inteligencia Artificial para Dulce Gusto
 * Conexión directa a Google Gemini API + Generación visual de Tortas
 */

const SYSTEM_INSTRUCTION = `
Eres DulceBot, el asistente repostero virtual de "Dulce Gusto", pastelería artesanal en Lima, Perú.
Tu objetivo es ayudar al cliente a personalizar su torta de forma rápida, amigable y muy directa.

PAUTAS OBLIGATORIAS:
1. MENSAJES CORTOS Y DIRECTOS (sin textos largos ni explicaciones excesivas):
   - Envía exactamente 2 o 3 mensajes breves separados por doble salto de línea (\\n\\n).
   - Mensaje 1: Reacción entusiasta y breve a lo que dijo o eligió el cliente (máximo 1 oración).
   - Mensaje 2: Pregunta directa y precisa para el siguiente paso (ej: "¿Para cuántas personas la necesitas?", "¿Qué sabor de bizcocho prefieres?").
2. ORDEN DE PASOS:
   - Paso 1: Ocasión (Cumpleaños, Boda, Infantil, etc.) -> preguntar porciones/personas.
   - Paso 2: Porciones -> preguntar sabor de queque/bizcocho.
   - Paso 3: Sabor de bizcocho -> preguntar rellenos y coberturas.
   - Paso 4: Relleno/cobertura -> preguntar dedicatoria en chocolate.
   - Paso 5: Confirmación final -> marcar "ready_to_order": true.
3. PRECIOS EN SOLES (S/.):
   - 10-15 porciones: S/ 75 - S/ 85
   - 20-25 porciones: S/ 95 - S/ 120
   - 35-40 porciones (2 pisos): S/ 150 - S/ 180
   - 50+ porciones (3 pisos): S/ 250 - S/ 300
4. PERSONALIZACIÓN DE IMAGEN:
   - Llena los campos "sponge", "filling", "frosting", "tiers" con la opción exacta que el cliente eligió para que la imagen se actualice visualmente a su torta.

Responde SIEMPRE en formato JSON válido:
{
  "reply": "¡Genial elección! 🎂\\n\\n¿Para cuántas personas te gustaría la torta?",
  "suggestions": ["Para 15 personas 🎂", "Para 25 personas 👥", "Para 40 personas (2 pisos) 💍", "Para 50+ personas 👑"],
  "cake_details": {
    "ready_to_order": false,
    "name": "Nombre de la torta",
    "occasion": "Cumpleaños",
    "portions": 20,
    "tiers": 1,
    "sponge": "Chocolate Fudge húmedo",
    "filling": "Manjar de olla",
    "frosting": "Ganache",
    "style_description": "Estilo artesanal",
    "message": "¡Feliz Cumpleaños!",
    "estimated_price": 95.00,
    "image_prompt": "artisanal gourmet chocolate cake with smooth chocolate frosting"
  }
}
`

/**
 * Obtener la API key activa (del entorno o de localStorage)
 */
export function getActiveGeminiKey() {
  const fromStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key')?.trim() : ''
  const fromEnv = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY) ? import.meta.env.VITE_GEMINI_API_KEY.trim() : ''
  return fromStorage || fromEnv || ''
}

/**
 * Guardar API key en localStorage
 */
export function setActiveGeminiKey(key) {
  if (key) {
    localStorage.setItem('gemini_api_key', key.trim())
  } else {
    localStorage.removeItem('gemini_api_key')
  }
}

/**
 * Catálogo Curado de Fotografía Gastronómica de Pastelería Artesanal
 * Mapeo visual exacto según las opciones de bizcocho, rellenos y pisos.
 */
const GOURMET_CAKES = {
  chocolate_fudge:   'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop&q=80',
  chocolate_berries: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
  chocolate_drip:    'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&auto=format&fit=crop&q=80',
  red_velvet:        'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&auto=format&fit=crop&q=80',
  strawberries:      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80',
  vanilla_floral:    'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=800&auto=format&fit=crop&q=80',
  wedding_tiered:    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&auto=format&fit=crop&q=80',
  tiered_3:          'https://images.unsplash.com/photo-1519869325930-281384150729?w=800&auto=format&fit=crop&q=80',
  carrot_walnut:     'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&auto=format&fit=crop&q=80',
  festive_macarons:  'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=800&auto=format&fit=crop&q=80',
  birthday_party:    'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800&auto=format&fit=crop&q=80',
  chantilly_fruits:  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80',
}

/**
 * Resuelve la fotografía exacta según las opciones que el cliente seleccionó
 */
export function generateCakeImageUrl(imagePrompt = '', cakeName = '', cakeDetails = null) {
  const combined = `${imagePrompt} ${cakeName} ${cakeDetails?.sponge || ''} ${cakeDetails?.filling || ''} ${cakeDetails?.frosting || ''} ${cakeDetails?.occasion || ''}`.toLowerCase()

  // 1. Tres pisos o más
  if ((cakeDetails?.tiers && cakeDetails.tiers >= 3) || combined.includes('3 pisos') || combined.includes('3-tier') || combined.includes('50+')) {
    return GOURMET_CAKES.tiered_3
  }

  // 2. Dos pisos / Boda / Aniversario elegante
  if ((cakeDetails?.tiers && cakeDetails.tiers === 2) || combined.includes('2 pisos') || combined.includes('2-tier') || combined.includes('boda') || combined.includes('matrimonio')) {
    return GOURMET_CAKES.wedding_tiered
  }

  // 3. Red Velvet
  if (combined.includes('red velvet') || combined.includes('velvet')) {
    return GOURMET_CAKES.red_velvet
  }

  // 4. Zanahoria con Nueces
  if (combined.includes('zanahoria') || combined.includes('carrot') || combined.includes('nuez') || combined.includes('nueces')) {
    return GOURMET_CAKES.carrot_walnut
  }

  // 5. Fresas con Chantilly / Frutos frescos
  if (combined.includes('chantilly') || (combined.includes('fresa') && !combined.includes('choc'))) {
    return GOURMET_CAKES.strawberries
  }

  // 6. Chocolate combinaciones
  if (combined.includes('choc') || combined.includes('fudge') || combined.includes('cacao') || combined.includes('trufa')) {
    if (combined.includes('fresa') || combined.includes('berry') || combined.includes('fruto') || combined.includes('rojo')) {
      return GOURMET_CAKES.chocolate_berries
    }
    if (combined.includes('drip') || combined.includes('manjar')) {
      return GOURMET_CAKES.chocolate_drip
    }
    return GOURMET_CAKES.chocolate_fudge
  }

  // 7. Vainilla / Floral / Blanco
  if (combined.includes('vainilla') || combined.includes('floral') || combined.includes('blanc') || combined.includes('buttercream')) {
    return GOURMET_CAKES.vanilla_floral
  }

  // 8. Infantil / Macarons coloridos
  if (combined.includes('infantil') || combined.includes('niñ') || combined.includes('macaron') || combined.includes('colores')) {
    return GOURMET_CAKES.festive_macarons
  }

  // 9. Cumpleaños festivo
  if (combined.includes('cumple') || combined.includes('birthday') || combined.includes('fiesta')) {
    return GOURMET_CAKES.birthday_party
  }

  return GOURMET_CAKES.chocolate_berries
}

/**
 * Motor de Fallback Inteligente y Progresivo
 * Mensajes breves, preguntas directas y divididas en mensajes claros.
 */
function getSmartFallbackReply(messages, lastUserText = '') {
  const text = lastUserText.toLowerCase().trim()
  const userMessages = messages.filter((m) => m.role === 'user')
  const step = userMessages.length

  // Paso 0: Foto de referencia adjunta
  if (text.includes('foto') || text.includes('imagen') || text.includes('referencia') || text.includes('adjunt') || text.includes('cámara') || text.includes('clip')) {
    return {
      reply: '¡Qué linda foto de referencia! 📸 Nos encanta ese estilo y podemos recrearlo a la perfección.\n\n¿Para cuántas personas te gustaría que preparemos la torta?',
      suggestions: [
        'Para 15 personas (1 piso) 🎂',
        'Para 25 personas (1 piso alto) 👥',
        'Para 40 personas (2 pisos) 💍',
        'Para 50+ personas (3 pisos) 👑',
      ],
      cake_details: {
        ready_to_order: false,
        name: 'Torta Personalizada según Foto',
        occasion: 'Diseño Personalizado',
        portions: 25,
        tiers: 1,
        sponge: 'Chocolate o Vainilla',
        filling: 'Manjar blanco artesanal',
        frosting: 'Decoración personalizada',
        style_description: 'Diseño inspirado en tu fotografía',
        message: '¡Felicidades!',
        estimated_price: 125.0,
        image_prompt: 'customized luxury bakery cake based on reference photo, studio lighting',
      },
    }
  }

  // Detección de intenciones por contenido
  const isPortionsIntent = text.includes('persona') || text.includes('invitad') || text.includes('piso') || /\b\d{1,3}\b/.test(text)
  const isSpongeIntent = text.includes('choc') || text.includes('fudge') || text.includes('vainilla') || text.includes('red velvet') || text.includes('velvet') || text.includes('zanahoria') || text.includes('queque') || text.includes('bizcoch')
  const isFillingIntent = text.includes('manjar') || text.includes('ganache') || text.includes('fruto') || text.includes('fresa') || text.includes('buttercream') || text.includes('chantilly') || text.includes('relleno') || text.includes('cobertura')
  const isOrderIntent = text.includes('carrito') || text.includes('comprar') || text.includes('pedir') || text.includes('perfecta') || text.includes('ordenar')

  // Paso 5: Confirmación de Pedido / Torta lista
  if (isOrderIntent || (step >= 5 && !isPortionsIntent && !isSpongeIntent && !isFillingIntent)) {
    let dedicationMsg = '¡Feliz Cumpleaños!'
    if (text.includes('sin')) dedicationMsg = ''
    else if (text.length > 3 && !text.includes('carrito') && !text.includes('perfecta')) dedicationMsg = lastUserText.replace(/[¡!🎉❤️💕✨]/g, '').trim()

    return {
      reply: '¡Listo! Tu torta personalizada ha quedado armada a la perfección 🎉\n\n¿Deseas agregarla directamente al carrito para reservarla?',
      suggestions: [
        '¡Está perfecta! Agregar al carrito 🛒',
        'Cambiar sabores de relleno 🍯',
        'Hacerla de 2 pisos 🎂',
        'Consultar por delivery 🚚',
      ],
      cake_details: {
        ready_to_order: true,
        name: 'Torta Exclusiva Dulce Gusto',
        occasion: 'Celebración Especial',
        portions: 25,
        tiers: 1,
        sponge: 'Chocolate Fudge húmedo',
        filling: 'Manjar de olla y ganache al 70%',
        frosting: 'Cobertura satinada con frutos del bosque',
        style_description: 'Diseño moderno con frutos frescos',
        message: dedicationMsg || '¡Felicidades!',
        estimated_price: 120.0,
        image_prompt: 'luxurious gourmet chocolate and berry cake, warm bakery photo',
      },
    }
  }

  // Paso 4: Rellenos y Coberturas -> Pedir Dedicatoria
  if (isFillingIntent || step === 4) {
    let chosenFilling = 'Manjar de olla con fudge artesanal'
    let cakeImgPrompt = 'chocolate fudge drip cake'
    if (text.includes('fruto') || text.includes('rojo') || text.includes('ganache')) {
      chosenFilling = 'Ganache Bitter 70% + Frutos Rojos'
      cakeImgPrompt = 'gourmet chocolate cake crowned with fresh red berries and blackberries'
    } else if (text.includes('chantilly') || text.includes('fresa')) {
      chosenFilling = 'Crema Chantilly suave + Fresas frescas'
      cakeImgPrompt = 'fresh strawberry chantilly cake with whipped cream and sliced berries'
    } else if (text.includes('buttercream')) {
      chosenFilling = 'Buttercream Suizo de Vainilla'
      cakeImgPrompt = 'elegant white buttercream vanilla cake'
    }

    return {
      reply: `¡Qué delicia! La combinación con ${chosenFilling} queda espectacular 🍓\n\n¿Deseas colocarle alguna dedicatoria personalizada en una plaquita de chocolate?`,
      suggestions: [
        '¡Feliz Cumpleaños! 🎉',
        '¡Feliz Aniversario! ❤️',
        'Con mucho amor 💕',
        'Sin dedicatoria (solo decoración) ✨',
      ],
      cake_details: {
        ready_to_order: false,
        name: 'Torta Artesanal Dulce Gusto',
        occasion: 'Celebración',
        portions: 20,
        tiers: 1,
        sponge: 'Chocolate Fudge o Vainilla',
        filling: chosenFilling,
        frosting: 'Ganache de chocolate o Buttercream suave',
        style_description: 'Acabado gourmet con frutos frescos',
        message: '¡Feliz Día!',
        estimated_price: 110.0,
        image_prompt: cakeImgPrompt,
      },
    }
  }

  // Paso 3: Bizcocho / Sabor -> Pedir Relleno
  if (isSpongeIntent || step === 3) {
    let chosenSponge = 'Chocolate Fudge húmedo'
    let cakeImgPrompt = 'decadent dark chocolate fudge cake with dripping chocolate'
    if (text.includes('red velvet') || text.includes('velvet')) {
      chosenSponge = 'Red Velvet clásico'
      cakeImgPrompt = 'red velvet cake with cream cheese frosting, gourmet bakery'
    } else if (text.includes('zanahoria')) {
      chosenSponge = 'Zanahoria con Nueces y Canela'
      cakeImgPrompt = 'moist spiced carrot cake with toasted walnuts and cream frosting'
    } else if (text.includes('vainilla')) {
      chosenSponge = 'Vainilla Francesa artesanal'
      cakeImgPrompt = 'elegant vanilla floral cake with smooth white buttercream'
    }

    return {
      reply: `¡Riquísimo! El bizcocho de ${chosenSponge} es súper esponjoso y húmedo ✨\n\n¿Qué relleno y cobertura te gustaría combinarle?`,
      suggestions: [
        'Manjar de olla + Fudge artesanal 🍯',
        'Ganache Bitter 70% + Frutos Rojos 🍓',
        'Crema Chantilly + Fresas frescas 🍓',
        'Buttercream Suizo de Vainilla 🍨',
      ],
      cake_details: {
        ready_to_order: false,
        name: `Torta de ${chosenSponge}`,
        occasion: 'Celebración',
        portions: 20,
        tiers: 1,
        sponge: chosenSponge,
        filling: 'A elegir',
        frosting: 'A elegir',
        style_description: 'Elegante y apetitosa',
        message: '¡Felicidades!',
        estimated_price: 105.0,
        image_prompt: cakeImgPrompt,
      },
    }
  }

  // Paso 2: Porciones / Invitados -> Pedir Bizcocho
  if (isPortionsIntent || step === 2) {
    const num = parseInt(text.match(/\d+/)?.[0] || '20', 10)
    const tiers = num >= 35 ? 2 : 1
    const price = Math.max(75, Math.round(num * 5.2))
    const imgPrompt = tiers === 2 ? 'elegant 2-tier wedding anniversary celebration cake' : 'delicious 1-tier artisanal celebration cake'

    return {
      reply: `¡Excelente cálculo! Para ${num} personas calculamos ${tiers === 1 ? '1 piso generoso' : '2 pisos espectaculares'} 🎂\n\n¿Qué sabor de bizcocho prefieres de base?`,
      suggestions: [
        'Chocolate Fudge húmedo 🍫',
        'Vainilla Francesa artesanal 🌾',
        'Red Velvet clásico ❤️',
        'Zanahoria con Nueces y Canela 🥕',
      ],
      cake_details: {
        ready_to_order: false,
        name: `Torta Celebración (${num} porciones)`,
        occasion: 'Celebración',
        portions: num,
        tiers,
        sponge: 'A elegir',
        filling: 'A elegir',
        frosting: 'A elegir',
        style_description: 'Elegante y apetitosa',
        message: '¡Felicidades!',
        estimated_price: price,
        image_prompt: imgPrompt,
      },
    }
  }

  // Paso 1: Ocasión (Por defecto al iniciar la conversación o elegir temática)
  let occasionName = 'Cumpleaños 🎈'
  let occasionPrompt = 'festive birthday celebration cake with macarons and fresh berries'
  if (text.includes('boda') || text.includes('aniversario') || text.includes('matrimonio')) {
    occasionName = 'Boda o Aniversario 💍'
    occasionPrompt = 'elegant tiered wedding cake with gold flakes and floral decorations'
  } else if (text.includes('infantil') || text.includes('niñ')) {
    occasionName = 'Fiesta Infantil 🧸'
    occasionPrompt = 'fun colorful kids party cake with pastel macarons and sprinkles'
  } else if (text.includes('gradua')) {
    occasionName = 'Graduación 🎓'
    occasionPrompt = 'graduation celebration cake elegant white with golden details'
  }

  return {
    reply: `¡Qué gran motivo para celebrar! Diseñemos una torta especial para ${occasionName} 🎂\n\n¿Para cuántas personas la necesitas?`,
    suggestions: [
      'Para 15 personas 🎂',
      'Para 25 personas 👥',
      'Para 40 personas (2 pisos) 💍',
      'Para 50+ personas (3 pisos) 👑',
    ],
    cake_details: {
      ready_to_order: false,
      name: `Torta ${occasionName}`,
      occasion: occasionName,
      portions: 20,
      tiers: 1,
      sponge: 'Por definir',
      filling: 'Por definir',
      frosting: 'Por definir',
      style_description: 'Diseño artesanal contemporáneo',
      message: '¡Felicidades!',
      estimated_price: 95.0,
      image_prompt: occasionPrompt,
    },
  }
}

/**
 * Enviar mensaje al chatbot de Gemini
 * @param {Array<{role: string, text: string}>} conversation - Historial de conversación
 * @param {string} customKey - Clave opcional pasada directamente
 */
export async function sendChatMessage(conversation, customKey = '') {
  const apiKey = customKey || getActiveGeminiKey()
  const lastUserMsg = conversation[conversation.length - 1]?.text || ''

  // Modelos oficiales compatibles con la API v1beta de Google Gemini
  const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash']

  // Si no hay API key configurada, usar de inmediato el motor inteligente
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const fallback = getSmartFallbackReply(conversation, lastUserMsg)
    fallback.imageUrl = generateCakeImageUrl(fallback.cake_details?.image_prompt, fallback.cake_details?.name, fallback.cake_details)
    return fallback
  }

  // Formatear historial asegurando que el primer mensaje tenga rol 'user'
  const contents = []
  let lastRole = null

  for (const msg of conversation) {
    const role = msg.role === 'user' ? 'user' : 'model'
    // Gemini API v1beta requiere que el primer mensaje en contents sea 'user'
    if (contents.length === 0 && role !== 'user') {
      continue
    }
    if (role === lastRole && contents.length > 0) {
      contents[contents.length - 1].parts[0].text += `\n${msg.text}`
    } else {
      contents.push({
        role,
        parts: [{ text: msg.text || '' }],
      })
      lastRole = role
    }
  }

  // Salvaguarda: si contents quedó vacío, inicializar con el último texto
  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: lastUserMsg || 'Hola, deseo diseñar una torta.' }],
    })
  }

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      response_mime_type: 'application/json',
    },
  }

  // Probar en cascada los modelos disponibles
  for (const model of MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        console.warn(`Respuesta no satisfactoria del modelo ${model} (${response.status}):`, errJson?.error?.message)
        continue // Probar siguiente modelo en la lista
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      let parsed
      try {
        const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()
        parsed = JSON.parse(cleanJson)
      } catch (parseErr) {
        console.warn('Extrayendo texto directo tras fallo de JSON parse:', parseErr)
        parsed = {
          reply: rawText || '¡Perfecto! Estoy anotando todos los detalles para tu torta soñada.',
          suggestions: ['Para 15 personas 🎂', 'Para 25 personas 👥', 'Sabor chocolate fudge 🍫', 'Ver precios'],
          cake_details: null,
        }
      }

      if (parsed.cake_details) {
        parsed.imageUrl = generateCakeImageUrl(
          parsed.cake_details.image_prompt,
          parsed.cake_details.name,
          parsed.cake_details
        )
      }

      return parsed
    } catch (modelError) {
      console.warn(`Excepción al contactar ${model}:`, modelError.message)
    }
  }

  // Si ambos modelos fallan o no hay red, usar el motor de conversación local progresivo
  console.info('Activando motor de conversación progresivo de DulceBot...')
  const fallback = getSmartFallbackReply(conversation, lastUserMsg)
  fallback.imageUrl = generateCakeImageUrl(fallback.cake_details?.image_prompt, fallback.cake_details?.name, fallback.cake_details)
  return fallback
}

