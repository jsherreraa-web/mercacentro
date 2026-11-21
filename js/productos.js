/* Catálogo de Mercacentro: 8 productos ficticios (precios enteros en COP).
   No hay imágenes externas: cada producto usa un bloque de color con su sigla. */
window.MARCA = "Mercacentro";

window.PRODUCTOS = [
  {
    id: "ARR-001",
    nombre: "Arroz Premium 5 kg",
    categoria: "Granos y cereales",
    precio: 24900,
    descripcion: "Arroz blanco de grano largo, suelto y rendidor. Ideal para el almuerzo diario de toda la familia.",
    sigla: "ARR", color1: "#b8801f", color2: "#f0c46a"
  },
  {
    id: "FRI-002",
    nombre: "Fríjol Cargamanto 1 kg",
    categoria: "Granos y cereales",
    precio: 11900,
    descripcion: "Fríjol cargamanto rojo seleccionado, de cocción pareja y sabor tradicional para la bandeja paisa.",
    sigla: "FRI", color1: "#8a2f2f", color2: "#d9776b"
  },
  {
    id: "CAF-003",
    nombre: "Café de Origen Huila 500 g",
    categoria: "Café y bebidas",
    precio: 28900,
    descripcion: "Café tostado medio de fincas del Huila, con notas a panela y cacao. Molido para filtro o cafetera.",
    sigla: "CAF", color1: "#4a2f20", color2: "#a37352"
  },
  {
    id: "ACE-004",
    nombre: "Aceite de Oliva Extra Virgen 500 ml",
    categoria: "Aceites y aderezos",
    precio: 39900,
    descripcion: "Aceite de oliva extra virgen de primera prensada en frío, perfecto para ensaladas y cocción suave.",
    sigla: "ACE", color1: "#5d7a1f", color2: "#bdd36a"
  },
  {
    id: "PAS-005",
    nombre: "Pasta Integral 500 g",
    categoria: "Pastas",
    precio: 6900,
    descripcion: "Espagueti de trigo integral, alto en fibra y con textura al dente. Listo en solo 9 minutos.",
    sigla: "PAS", color1: "#c9892b", color2: "#f5d78e"
  },
  {
    id: "CHO-006",
    nombre: "Chocolate de Mesa 500 g",
    categoria: "Dulces y chocolate",
    precio: 14500,
    descripcion: "Chocolate de mesa tradicional con canela, para disfrutar caliente con queso y pan.",
    sigla: "CHO", color1: "#3d2318", color2: "#8b5a3c"
  },
  {
    id: "PAN-007",
    nombre: "Panela Orgánica 1 kg",
    categoria: "Endulzantes",
    precio: 8900,
    descripcion: "Panela orgánica en bloque, elaborada artesanalmente con jugo de caña. Endulzante natural sin refinar.",
    sigla: "PAN", color1: "#a8651b", color2: "#e7a95a"
  },
  {
    id: "ATU-008",
    nombre: "Atún en Aceite de Oliva x3",
    categoria: "Enlatados",
    precio: 21900,
    descripcion: "Pack de tres latas de lomitos de atún en aceite de oliva. Práctico, nutritivo y listo para servir.",
    sigla: "ATU", color1: "#1f4e79", color2: "#6aa5d9"
  }
];

window.obtenerProducto = function (id) {
  for (var i = 0; i < window.PRODUCTOS.length; i++) {
    if (window.PRODUCTOS[i].id === id) return window.PRODUCTOS[i];
  }
  return null;
};
