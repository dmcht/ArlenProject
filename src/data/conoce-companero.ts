export type ConoceActividad = {
  numero: number;
  titulo: string;
  preguntas: string[];
  nota?: string;
};

export const CONOCE_INTRO =
  "Busca un compañero de trabajo y mantén una conversación con él o ella. Usa estas ideas como guía; no hace falta seguir un orden rígido.";

export const CONOCE_ACTIVIDADES: ConoceActividad[] = [
  {
    numero: 1,
    titulo: "Primeros temas",
    preguntas: [
      "¿Cómo te gusta que te llamen?",
      "¿Qué es lo que más disfrutas de tu trabajo?",
      "¿Cuánto tiempo llevas en la empresa?",
      "¿Qué haces en tu tiempo libre?",
    ],
  },
  {
    numero: 2,
    titulo: "El día a día",
    preguntas: [
      "¿Cómo es un día normal en tu trabajo?",
      "¿Qué es lo más difícil?",
      "¿Qué es lo más fácil?",
    ],
  },
  {
    numero: 3,
    titulo: "Retos",
    preguntas: [
      "¿Cuál ha sido tu mayor reto en el trabajo?",
      "¿Cómo lo superaste?",
    ],
  },
  {
    numero: 4,
    titulo: "Motivación",
    preguntas: [
      "¿Qué te motiva a venir a trabajar?",
      "¿Qué te hace sentir bien aquí?",
    ],
  },
  {
    numero: 5,
    titulo: "Apoyo",
    preguntas: [
      "¿Qué parte del trabajo te resulta más difícil?",
      "¿Cómo podrían ayudarte los demás?",
    ],
  },
  {
    numero: 6,
    titulo: "Comunicación",
    preguntas: [
      "¿Prefieres que te hablen directo o suave?",
      "¿Qué te molesta en la comunicación?",
    ],
  },
  {
    numero: 7,
    titulo: "Días difíciles",
    preguntas: [
      "Cuenta una vez que tuviste un mal día en el trabajo.",
      "¿Qué te hubiera ayudado?",
    ],
  },
  {
    numero: 8,
    titulo: "Cierre positivo",
    preguntas: [],
    nota: 'Cada uno dice: “Algo que valoro de trabajar contigo es…”',
  },
];
