# Mercacentro · Laboratorio de Google Analytics 4

Tienda en línea **ficticia** de despensa para el laboratorio académico de GA4 del
*Diplomado en E-commerce y Negocios Internacionales Digitales*.

- Solo HTML, CSS y JavaScript puros: sin frameworks, sin npm, sin compilación.
- Sin servidor, sin base de datos y sin pagos reales.
- Estilo visual inspirado en Apple (fondo claro, tipografía del sistema, tarjetas redondeadas).
- No pide ni guarda correo, teléfono, documento ni datos de tarjeta.

## 1. Configurar tu ID de medición (único archivo a editar)

Abre `js/config.js` y reemplaza el marcador por tu ID de GA4:

```js
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // ← pega aquí tu ID (G-...)
  DEBUG_MODE: true                   // true = DebugView · false = normal
};
```

El ID está en GA4 → **Administrar → Flujos de datos → tu flujo web → ID de medición**.

- Con el marcador `G-XXXXXXXXXX` **no se carga gtag.js** y el monitor muestra el aviso rojo.
- Con un ID válido el monitor muestra "Conectado a G-... · modo depuración" en verde.
- `DEBUG_MODE: true` envía `debug_mode` y los eventos aparecen en **Administrar → DebugView**.

## 2. Estructura

```
Mercacentro/
├── index.html          Catálogo (+ banner del cupón)
├── producto.html       Detalle: producto.html?id=ARR-001
├── carrito.html        Carrito y cupón
├── checkout.html       Checkout en 2 pasos (Envío → Pago simulado)
├── gracias.html        Confirmación (evento purchase)
├── css/estilos.css
├── js/config.js        ← lo único que editas
├── js/productos.js     8 productos
├── js/carrito.js       Carrito, cupón, tarifas e ítems GA4
├── js/analytics.js     gtag, enviarEvento() y enviarEventoYNavegar()
├── js/monitor.js       Monitor de eventos (panel derecho)
└── js/pagina-*.js      Un archivo por página
```

## 3. Productos (precios en COP)

| ID | Producto | Categoría | Precio |
|---|---|---|---|
| ARR-001 | Arroz Premium 5 kg | Granos y cereales | 24.900 |
| FRI-002 | Fríjol Cargamanto 1 kg | Granos y cereales | 11.900 |
| CAF-003 | Café de Origen Huila 500 g | Café y bebidas | 28.900 |
| ACE-004 | Aceite de Oliva Extra Virgen 500 ml | Aceites y aderezos | 39.900 |
| PAS-005 | Pasta Integral 500 g | Pastas | 6.900 |
| CHO-006 | Chocolate de Mesa 500 g | Dulces y chocolate | 14.500 |
| PAN-007 | Panela Orgánica 1 kg | Endulzantes | 8.900 |
| ATU-008 | Atún en Aceite de Oliva x3 | Enlatados | 21.900 |

`item_brand` es siempre `Mercacentro` (marca propia).

## 4. Cupón y envíos

- Cupón **BIENVENIDA10**: 10 % de descuento. Se aplica desde el banner del inicio (lleva al
  carrito) o escribiéndolo en el carrito.
- Tarifas de envío (COP):

| Servicio | Estándar | Express |
|---|---|---|
| Nacional (Colombia) | 12.000 (gratis desde 150.000 en productos) | 25.000 |
| Internacional | 95.000 | 160.000 |

El umbral de envío gratis se evalúa sobre el valor de los productos **ya con descuento**.
Países disponibles: Colombia, México, Estados Unidos, España, Argentina, Chile, Perú y Brasil.

## 5. Contrato de medición

Todos los eventos llevan `currency: "COP"`. Cada ítem lleva `item_id`, `item_name`,
`item_brand`, `item_category`, `price`, `quantity` e `index`. Con cupón activo, el ítem lleva
además `price` con descuento, `discount` (por unidad) y `coupon`.

| Evento | Cuándo se envía |
|---|---|
| `view_item_list` | Al cargar el catálogo (`catalogo_principal`) |
| `view_promotion` | Al mostrarse el banner del cupón |
| `select_promotion` | Clic en el banner: aplica el cupón y va al carrito |
| `select_item` | Clic en un producto del catálogo, antes de navegar |
| `view_item` | Al abrir el detalle del producto |
| `add_to_cart` | Al agregar o aumentar unidades |
| `remove_from_cart` | Al quitar o disminuir unidades |
| `view_cart` | Al abrir el carrito con productos |
| `begin_checkout` | Al abrir `checkout.html` |
| `add_shipping_info` | Clic en "Continuar al pago" (`shipping_tier`) |
| `add_payment_info` | Clic en "Pagar (simulado)" (`payment_type`) |
| `purchase` | Al cargar `gracias.html`, una sola vez por pedido |

Valores exactos de `shipping_tier`: `Nacional - Estándar`, `Nacional - Express`,
`Internacional - Estándar`, `Internacional - Express`.

`purchase` lleva `transaction_id` único, `affiliation`, `value` (productos con descuento, sin
envío), `shipping`, `coupon`, `tipo_cliente` e `items`. La propiedad de usuario `tipo_cliente`
(`Nacional` o `Internacional`) se fija con `gtag('set', 'user_properties', …)` al confirmar el
envío y de nuevo en `gracias.html`, justo antes de `purchase`.

El pedido se guarda en `sessionStorage`, se marca como enviado tras `purchase` (recargar no lo
repite) y entonces se vacía el carrito.

## 6. Monitor de eventos

Panel fijo a la derecha (380 px; abajo con 300 px en pantallas de menos de 820 px) con:

- Estado de la conexión con GA4.
- **Origen de la visita**: `utm_source / utm_medium · utm_campaign` de la primera página de la
  sesión, o "directo (sin UTM)".
- Los últimos 12 eventos (hora, nombre, resumen y parámetros desplegables), incluido `page_view`.
- Botón **Ocultar / Mostrar** (recuerda su estado).
- Botón **Simular nuevo visitante**: borra las cookies `_ga*`, el carrito y `sessionStorage`, y
  vuelve al inicio.

Para probar el origen, abre la tienda con una URL como:
`https://tu-sitio.vercel.app/?utm_source=newsletter&utm_medium=email&utm_campaign=lanzamiento`

## 7. Publicar en GitHub y Vercel (gratis)

**GitHub (desde el navegador)**
1. Entra a <https://github.com/new>, crea un repositorio (por ejemplo `mercacentro`) y créalo vacío.
2. En el repositorio pulsa **Add file → Upload files**.
3. Descomprime el .zip y arrastra **el contenido** de la carpeta `Mercacentro`
   (`index.html`, `css/`, `js/`, etc.), de modo que `index.html` quede en la raíz del repositorio.
4. Pulsa **Commit changes**.

**Vercel**
1. Entra a <https://vercel.com> e inicia sesión con tu cuenta de GitHub.
2. **Add New → Project** e importa el repositorio.
3. En **Framework Preset** elige **Other**. Deja vacíos Build Command y Output Directory.
4. Pulsa **Deploy**. Vercel te dará una URL pública.

Para cambiar el ID de medición después, edita `js/config.js` en GitHub (ícono del lápiz) y
confirma el cambio: Vercel vuelve a publicar automáticamente.

## Aviso

Sitio académico de simulación. No procesa pagos ni guarda datos personales. Usa Google Analytics 4.
