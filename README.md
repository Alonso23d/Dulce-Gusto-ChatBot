<div align="center">
  <h1>🍰 Dulce Gusto — Pastelería Artesanal & IA Chatbot</h1>
  <p><strong>Una experiencia de E-commerce moderna, impulsada por Inteligencia Artificial para hacer tus pedidos más dulces y conversacionales.</strong></p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img alt="Laravel" src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
  </p>
</div>

---

## 🎯 Sobre el Proyecto

**Dulce Gusto** busca revolucionar la experiencia de comprar postres en línea. A través de nuestra interfaz amigable y elegante, el cliente no solo puede navegar por un catálogo tradicional de productos artesanales, sino interactuar con **DulceBot**, nuestro asistente virtual impulsado por Inteligencia Artificial.

### ¿Qué hace especial a DulceBot? 🤖
- 💡 **Recomendaciones Inteligentes:** Sugiere el postre ideal basado en la ocasión (cumpleaños, aniversarios, antojos).
- 🛒 **Toma de Pedidos Conversacional:** Puedes hacer todo tu pedido chateando, sin navegar por múltiples pantallas.
- 📍 **Cálculo de Delivery:** Solicita tu distrito y dirección para calcular automáticamente el costo de envío.
- 💳 **Redirección de Pago:** Genera enlaces y botones directos para finalizar la compra de forma 100% segura.

---

## 🛠️ Stack Tecnológico

La plataforma está construida utilizando una arquitectura desacoplada moderna:

| Capa | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Frontend (Tienda)** | React, Vite, Tailwind CSS | Interfaz principal para clientes, catálogo, chatbot interactivo y carrito. |
| **Frontend (Panel Admin)** | React, Vite, Tailwind CSS | Dashboard administrativo para gestión de inventario, productos y ventas. |
| **Backend (API)** | Laravel (PHP), MySQL | Lógica de negocio, gestión de base de datos, autenticación y endpoints. |
| **Mockup UI** | HTML5, Tailwind CDN | Archivo `mockup.html` autónomo que demuestra toda la UI/UX planeada. |

---

## 📁 Estructura del Repositorio

```text
📦 DulceGusto-ChatBot
 ┣ 📂 backend/                  # API REST (Laravel). Controladores, Modelos y Rutas.
 ┣ 📂 proyecto-frontend/
 ┃ ┣ 📂 e-commerce/             # Proyecto React para los clientes finales.
 ┃ ┗ 📂 panel-admin/            # Proyecto React para los administradores.
 ┣ 📜 mockup.html               # ✨ Maqueta visual completa del E-commerce (¡Ábrelo en tu navegador!).
 ┗ 📜 README.md                 # Documentación del proyecto.
```

---

## 🚀 Empezando (Guía de Instalación)

Sigue estos pasos para desplegar el entorno de desarrollo en tu máquina local.

### 1. Clonar el repositorio
```bash
git clone https://github.com/Alonso23d/Dulce-Gusto-ChatBot.git
cd Dulce-Gusto-ChatBot
```

### 2. Configurar el Backend (Laravel)
Asegúrate de tener PHP y Composer instalados.
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configura tus credenciales de base de datos en el archivo .env antes de migrar
php artisan migrate
php artisan serve
```

### 3. Configurar los Frontends (React / Vite)
Asegúrate de tener Node.js instalado (v18+ recomendado).

**Para arrancar la Tienda E-commerce:**
```bash
cd proyecto-frontend/e-commerce
npm install
npm run dev
```

**Para arrancar el Panel de Administración:**
```bash
cd proyecto-frontend/panel-admin
npm install
npm run dev
```

---

## 🎨 Explorando el Mockup Interactivo

Si deseas ver rápidamente cómo lucirá la aplicación final sin instalar dependencias, hemos incluido un archivo `mockup.html` autocontenido. 

1. Ve a la carpeta raíz del proyecto.
2. Haz doble clic en `mockup.html` para abrirlo en tu navegador web.
3. **Puntos clave a revisar:**
   - Haz clic en **"Iniciar Sesión"** para ver el modal.
   - Navega a la sección **"Pide con IA"** para leer la conversación de ejemplo del bot.
   - Desplázate hasta **"Finaliza tu Compra"** para ver el flujo de checkout detallado (formularios y pagos).

---

## 🤝 Cómo Contribuir

¡Nos encanta recibir aportes! Si deseas sumar nuevas características o corregir bugs:

1. Haz un Fork de este repositorio.
2. Crea tu rama para la nueva característica (`git checkout -b feature/MejoraIncreible`).
3. Haz commit de tus cambios (`git commit -m 'Añade una Mejora Increíble'`).
4. Haz push a la rama (`git push origin feature/MejoraIncreible`).
5. Abre un **Pull Request**.

---
<div align="center">
  <i>Desarrollado con 💖 para conectar los mejores postres con la mejor tecnología.</i>
</div>
