export type OpcionSemanal = {
  texto: string;
  /** Respuesta alineada con valores de empatía y buen clima laboral */
  recomendada: boolean;
};

export type ActividadSemanal = {
  numero: number;
  escenario: string;
  pregunta: string;
  opciones: OpcionSemanal[];
};

export const SEMANAL_INTRO =
  "Lee cada situación y elige qué harías o qué frase usarías. Después verás cuál opción fomenta mejor el ambiente de trabajo y la comunicación.";

export const ACTIVIDADES_SEMANALES: ActividadSemanal[] = [
  {
    numero: 1,
    escenario: "Un compañero está callado todo el día.",
    pregunta: "¿Qué harías?",
    opciones: [
      { texto: "Ignorarlo", recomendada: false },
      { texto: "Preguntar si está bien", recomendada: true },
      { texto: "Pensar que está enojado", recomendada: false },
    ],
  },
  {
    numero: 2,
    escenario: "Un compañero llega tarde por un problema personal.",
    pregunta: "¿Qué harías en este caso?",
    opciones: [
      { texto: "Criticar", recomendada: false },
      { texto: "Ignorar", recomendada: false },
      { texto: "Comprender", recomendada: true },
    ],
  },
  {
    numero: 3,
    escenario: "Alguien dice: “Estoy cansado de este trabajo.”",
    pregunta: "¿Qué responderías?",
    opciones: [
      { texto: "“Así es aquí”", recomendada: false },
      { texto: "“Pues renuncia”", recomendada: false },
      { texto: "“¿Qué pasó?”", recomendada: true },
    ],
  },
  {
    numero: 4,
    escenario: "Alguien comete un error.",
    pregunta: "¿Qué harías?",
    opciones: [
      { texto: "Regañarlo", recomendada: false },
      { texto: "Ignorarlo", recomendada: false },
      { texto: "Ayudar a solucionarlo", recomendada: true },
    ],
  },
  {
    numero: 5,
    escenario: "Elige la mejor frase para aplicar en tu entorno.",
    pregunta: "",
    opciones: [
      { texto: "“Eso está mal”", recomendada: false },
      { texto: "“Podemos mejorarlo juntos”", recomendada: true },
      { texto: "“Siempre haces lo mismo”", recomendada: false },
    ],
  },
  {
    numero: 6,
    escenario: "",
    pregunta: "¿Qué mejora más el ambiente?",
    opciones: [
      { texto: "Saludar", recomendada: true },
      { texto: "Ignorar", recomendada: false },
      { texto: "Criticar", recomendada: false },
    ],
  },
  {
    numero: 7,
    escenario: "Alguien te explica un problema.",
    pregunta: "¿Qué debes hacer?",
    opciones: [
      { texto: "Interrumpir", recomendada: false },
      { texto: "Escuchar", recomendada: true },
      { texto: "Cambiar de tema", recomendada: false },
    ],
  },
  {
    numero: 8,
    escenario: "Hay un desacuerdo entre compañeros.",
    pregunta: "¿Cómo reaccionas ante esto?",
    opciones: [
      { texto: "Discutir", recomendada: false },
      { texto: "Evitar", recomendada: false },
      { texto: "Dialogar", recomendada: true },
    ],
  },
];
